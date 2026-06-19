import { SessionStudio } from "@/components/session-studio";

export default function SessionPage() {
  return (
    <main className="page-shell stack">
      <div className="stack">
        <p className="muted">Session</p>
        <h1>Live Capsule Session</h1>
        <p className="muted">
          Start a browser session, talk directly with Vapi, and record webcam
          video for the final capsule upload.
        </p>
      </div>
      <SessionStudio />
    </main>
  );
}
