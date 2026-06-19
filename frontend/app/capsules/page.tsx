import Link from "next/link";

const seedCapsules = [
  {
    id: "sample-capsule",
    title: "Capsule - 2026-06-19",
    createdAt: "2026-06-19T12:00:00.000Z",
    durationSec: 420
  }
];

export default function CapsulesPage() {
  return (
    <main className="page-shell stack">
      <div className="stack">
        <p className="muted">Library</p>
        <h1>Saved Capsules</h1>
      </div>

      <div className="stack">
        {seedCapsules.map((capsule) => (
          <Link
            key={capsule.id}
            className="panel stack"
            href={`/capsules/${capsule.id}`}
          >
            <strong>{capsule.title}</strong>
            <span className="muted">
              {new Date(capsule.createdAt).toLocaleString()}
            </span>
            <span className="muted">{capsule.durationSec}s</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
