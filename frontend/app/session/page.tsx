import { getVapiConfig } from "@/lib/vapi";

export default function SessionPage() {
  const config = getVapiConfig();

  return (
    <main className="page-shell stack">
      <div className="stack">
        <p className="muted">Session</p>
        <h1>Live Capsule Session</h1>
        <p className="muted">
          This page is the frontend handoff for Vapi, webcam recording, and
          local session save flow.
        </p>
      </div>

      <section className="panel stack">
        <h2>Frontend Responsibilities</h2>
        <ul>
          <li>Start a Vapi call with the configured assistant.</li>
          <li>Request webcam and mic access in the browser.</li>
          <li>Record media with MediaRecorder during the call.</li>
          <li>Upload the recording when the session ends.</li>
          <li>Store local capsule metadata for replay later.</li>
        </ul>
      </section>

      <section className="panel stack">
        <h2>Vapi Config</h2>
        <div className="meta-grid">
          <div>
            <strong>Public key</strong>
            <p className="muted">{config.publicKey || "Missing"}</p>
          </div>
          <div>
            <strong>Assistant ID</strong>
            <p className="muted">{config.assistantId || "Missing"}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
