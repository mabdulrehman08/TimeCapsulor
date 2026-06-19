"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createVapiClient, getVapiConfig } from "@/lib/vapi";
import { uploadCapsuleSession } from "@/lib/api";

type SessionState =
  | "idle"
  | "requesting-media"
  | "ready"
  | "starting-call"
  | "live"
  | "stopping"
  | "uploading"
  | "saved"
  | "error";

export function SessionStudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>("");
  const vapiRef = useRef<ReturnType<typeof createVapiClient> | null>(null);

  const [state, setState] = useState<SessionState>("idle");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [durationSec, setDurationSec] = useState(0);
  const [savedMessage, setSavedMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const config = useMemo(() => getVapiConfig(), []);

  useEffect(() => {
    let intervalId: number | null = null;

    if (state === "live") {
      intervalId = window.setInterval(() => {
        if (startedAtRef.current) {
          setDurationSec(
            Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000))
          );
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [state]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      vapiRef.current?.stop?.();
    };
  }, [downloadUrl]);

  async function prepareMedia() {
    setError("");
    setSavedMessage("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
    }
    setState("requesting-media");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setState("ready");
    } catch (mediaError) {
      setError("Could not access camera and microphone.");
      setState("error");
    }
  }

  async function startSession() {
    if (!streamRef.current) {
      await prepareMedia();
    }

    if (!streamRef.current) {
      return;
    }

    setError("");
    setState("starting-call");
    chunksRef.current = [];
    transcriptRef.current = "";
    setTranscript("");
    setDurationSec(0);

    try {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm"
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      startedAtRef.current = Date.now();

      const vapi = createVapiClient();
      vapiRef.current = vapi;

      vapi.on("message", (message: { type?: string; transcript?: string }) => {
        if (message.type === "transcript" && message.transcript) {
          transcriptRef.current = transcriptRef.current
            ? `${transcriptRef.current}\n${message.transcript}`
            : message.transcript;
          setTranscript(transcriptRef.current);
        }
      });

      await vapi.start(config.assistantId);
      setState("live");
    } catch (sessionError) {
      setError("Could not start the Vapi session.");
      setState("error");
    }
  }

  async function stopSession() {
    if (!recorderRef.current) {
      return;
    }

    setState("stopping");

    const stopPromise = new Promise<Blob>((resolve) => {
      const recorder = recorderRef.current!;

      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: "video/webm" }));
      };
    });

    recorderRef.current.stop();
    vapiRef.current?.stop?.();

    let blob: Blob | null = null;

    try {
      blob = await stopPromise;
      const finalDurationSec =
        startedAtRef.current == null
          ? durationSec
          : Math.max(
              1,
              Math.floor((Date.now() - startedAtRef.current) / 1000)
            );

      setDurationSec(finalDurationSec);
      setState("uploading");

      const saved = await uploadCapsuleSession({
        blob,
        durationSec: finalDurationSec,
        title: `Capsule - ${new Date().toISOString().slice(0, 10)}`,
        transcript: transcriptRef.current,
        vapiSessionId: ""
      });

      setSavedMessage(`Saved capsule: ${saved.title}`);
      setState("saved");
    } catch (stopError) {
      if (blob) {
        const localUrl = URL.createObjectURL(blob);
        setDownloadUrl(localUrl);
        setSavedMessage(
          "Upload is not connected yet. Download the recording locally for now."
        );
        setError("");
        setState("saved");
        return;
      }

      setError("The session could not be saved.");
      setState("error");
    }
  }

  const isBusy =
    state === "requesting-media" ||
    state === "starting-call" ||
    state === "stopping" ||
    state === "uploading";

  return (
    <div className="stack">
      <section className="panel stack">
        <div className="meta-grid">
          <div className="stack">
            <h2>Live Browser Session</h2>
            <p className="muted">
              This is the user-facing session screen. Camera and microphone stay
              in the browser, Vapi handles the live voice call, and FastAPI can
              receive the final recording afterward.
            </p>
            <div className="actions">
              <button className="button" disabled={isBusy} onClick={prepareMedia}>
                Prepare Camera + Mic
              </button>
              <button
                className="button primary"
                disabled={isBusy || !config.assistantId}
                onClick={startSession}
              >
                Start Vapi Session
              </button>
              <button
                className="button"
                disabled={state !== "live"}
                onClick={stopSession}
              >
                Stop + Save
              </button>
            </div>
          </div>

          <div className="stack">
            <div>
              <strong>Status</strong>
              <p className="muted">{state}</p>
            </div>
            <div>
              <strong>Duration</strong>
              <p className="muted">{durationSec}s</p>
            </div>
            <div>
              <strong>Vapi key</strong>
              <p className="muted">{config.publicKey ? "Configured" : "Missing"}</p>
            </div>
            <div>
              <strong>Assistant</strong>
              <p className="muted">{config.assistantId ? "Configured" : "Missing"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel stack">
        <h2>Camera Preview</h2>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            maxWidth: "720px",
            borderRadius: 8,
            background: "#090b0f",
            aspectRatio: "16 / 9"
          }}
        />
      </section>

      <section className="panel stack">
        <h2>Transcript Feed</h2>
        <p className="muted">
          Vapi transcript events will appear here during the live session.
        </p>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            color: "#d7deeb",
            maxHeight: "280px",
            overflowY: "auto",
            padding: "16px",
            borderRadius: 8,
            background: "#0f131a",
            border: "1px solid #252c37"
          }}
        >
          {transcript || "No transcript yet."}
        </pre>
      </section>

      {(error || savedMessage) && (
        <section className="panel stack">
          {error ? <p>{error}</p> : null}
          {savedMessage ? <p>{savedMessage}</p> : null}
          {downloadUrl ? (
            <a className="button" download="timecapsulor-session.webm" href={downloadUrl}>
              Download Recording
            </a>
          ) : null}
        </section>
      )}
    </div>
  );
}
