import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="start-page-shell">
      <section className="hero start-layout">
        <div className="start-background" aria-hidden="true">
          <Image
            alt=""
            className="start-background-image"
            fill
            priority
            src="/images(1).jpeg"
          />
          <div className="start-background-overlay" />
        </div>

        <div className="start-main">
          <div className="stack start-copy">
            <p className="muted">Start Page</p>
            <h1>TimeCapsulor</h1>
            <p className="muted">
              Record a real conversation, preserve your voice and video, and turn
              that moment into a capsule you or your family can revisit later.
            </p>
            <p className="muted">
              Today it starts as a saved conversation. Later it can become a way
              to talk to your preserved self or hear from a relative again.
            </p>
          </div>

          <div className="actions">
            <Link className="button primary" href="/session">
              Start Capsule
            </Link>
          </div>

          <div className="hero-spacer" />
        </div>

        <aside className="start-sidebar panel">
          <p className="muted">Later</p>
          <h2>Open Capsule</h2>
          <p className="muted">
            Revisit a saved session, replay the memory, and return to a preserved
            voice or future clone flow.
          </p>
          <Link className="button sidebar-link" href="/capsules">
            Open Capsule
          </Link>
        </aside>
      </section>
    </main>
  );
}
