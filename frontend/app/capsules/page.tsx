import Link from "next/link";
import { seedCapsules } from "@/lib/seed-capsules";

export default function CapsulesPage() {
  return (
    <main className="page-shell stack library-shell">
      <div className="stack library-hero">
        <p className="eyebrow">Capsule Library</p>
        <h1>Saved Capsules</h1>
        <p className="muted library-copy">
          These are preserved conversation artifacts: voice, memory, and future
          replay collected into one place.
        </p>
        <div className="actions">
          <Link className="button" href="/capsules/graph">
            Open Memory Graph
          </Link>
        </div>
      </div>

      <div className="library-grid">
        {seedCapsules.map((capsule) => (
          <Link
            key={capsule.id}
            className="panel capsule-card"
            href={`/capsules/${capsule.id}`}
          >
            <div className="capsule-card-top">
              <span className="capsule-theme">{capsule.theme}</span>
              <span className="capsule-duration">{capsule.durationSec}s</span>
            </div>
            <strong className="capsule-title">{capsule.title}</strong>
            <p className="muted capsule-summary">{capsule.summary}</p>
            <div className="capsule-card-meta">
              <span>{new Date(capsule.createdAt).toLocaleString()}</span>
              <span>Open memory</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
