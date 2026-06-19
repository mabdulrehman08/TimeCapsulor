"use client";

import type { CSSProperties } from "react";
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
  const sessionOpenRef = useRef(false);
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

  function closeCameraPreview() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
    sessionOpenRef.current = true;
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
        if (
          sessionOpenRef.current &&
          message.type === "transcript" &&
          message.transcript
        ) {
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
    sessionOpenRef.current = false;

    const stopPromise = new Promise<Blob>((resolve) => {
      const recorder = recorderRef.current!;

      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: "video/webm" }));
      };
    });

    recorderRef.current.stop();
    vapiRef.current?.stop?.();
    vapiRef.current = null;
    closeCameraPreview();

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
      recorderRef.current = null;

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
          "Capsule closed. Upload is not connected yet, so download the recording locally for now."
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

  const primaryLabel =
    state === "live"
      ? "Close Capsule"
      : state === "saved"
        ? "Start New Capsule"
        : "Start Capsule";

  async function handlePrimaryAction() {
    if (state === "live") {
      await stopSession();
      return;
    }

    await startSession();
  }

  const transcriptPreview = transcript
    ? transcript.split("\n").slice(-2).join(" ")
    : "Live transcript moments will appear here.";

  return (
    <div className="stack session-shell">
      <section className="panel session-panel session-top-panel stack">
        <div className="session-top-copy">
          <p className="eyebrow">Live Capsule</p>
          <h2>Record The Moment</h2>
          <p className="muted">
            Talk naturally. Vapi handles the voice conversation while the browser
            preserves the video capsule.
          </p>
        </div>
        <video
          className="session-video"
          ref={videoRef}
          autoPlay
          muted
          playsInline
        />
        <div className="session-wave-field" aria-hidden="true">
          {Array.from({ length: 54 }).map((_, index) => (
            <span
              key={index}
              className="session-wave-dot"
              style={
                {
                  "--dot-delay": `${(index % 9) * 0.12}s`,
                  "--dot-row": `${Math.floor(index / 9)}`,
                  "--dot-col": `${index % 9}`
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="session-control-row">
          <button
            className="button primary session-primary-button"
            disabled={isBusy || !config.assistantId}
            onClick={handlePrimaryAction}
          >
            {primaryLabel}
          </button>
          <div className="session-inline-status">
            <span className="status-chip">{state}</span>
            <span className="session-inline-time">{durationSec}s</span>
          </div>
        </div>

        <div className="session-meta-strip">
          <span className="session-meta-item">
            Vapi: {config.publicKey ? "Configured" : "Missing"}
          </span>
          <span className="session-meta-item">
            Assistant: {config.assistantId ? "Configured" : "Missing"}
          </span>
          <span className="session-meta-item">Video: Browser capture</span>
        </div>

        <div className="transcript-preview-card">
          <span className="transcript-preview-label">Transcript Preview</span>
          <p className="transcript-preview-text">{transcriptPreview}</p>
        </div>

        {state === "saved" ? (
          <p className="session-note">Capsule closed. Camera preview stopped.</p>
        ) : null}
      </section>

      {(error || savedMessage) && (
        <section className="panel session-panel session-feedback stack">
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
