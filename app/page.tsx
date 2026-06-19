import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="stack">
          <p className="muted">V1 Hackathon Bootstrap</p>
          <h1>TimeCapsulor</h1>
          <p className="muted">
            A minimal browser app where the user talks directly with Vapi while
            webcam video is recorded and saved as a replayable capsule.
          </p>
        </div>

        <div className="actions">
          <Link className="button primary" href="/session">
            Start Capsule
          </Link>
          <Link className="button" href="/capsules">
            View Capsules
          </Link>
        </div>
      </section>
    </main>
  );
}
