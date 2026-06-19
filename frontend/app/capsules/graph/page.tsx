import Link from "next/link";
import { seedCapsules } from "@/lib/seed-capsules";

const clusterLabels: Record<string, string> = {
  founder: "Founder memory thread",
  family: "Family memory thread",
  lab: "Preservation experiments"
};

export default function CapsuleGraphPage() {
  return (
    <main className="page-shell stack graph-shell">
      <div className="stack graph-hero">
        <p className="eyebrow">Memory Graph</p>
        <h1>Capsules As Living Notes</h1>
        <p className="muted library-copy">
          Every saved session becomes a node in a growing memory network. Over
          time, preserved voices, family stories, and future-self messages form
          an Obsidian-like graph of who someone was.
        </p>
      </div>

      <section className="panel graph-panel stack">
        <div className="graph-toolbar">
          <span className="graph-toolbar-label">View</span>
          <div className="graph-toolbar-items">
            <span className="graph-toolbar-pill">All capsules</span>
            <span className="graph-toolbar-pill">Family clusters</span>
            <span className="graph-toolbar-pill">Future-self links</span>
          </div>
        </div>

        <div className="graph-canvas">
          <svg
            aria-hidden="true"
            className="graph-lines"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {seedCapsules.flatMap((capsule) =>
              capsule.links.map((targetId) => {
                const target = seedCapsules.find((item) => item.id === targetId);

                if (!target) {
                  return null;
                }

                return (
                  <line
                    key={`${capsule.id}-${targetId}`}
                    x1={capsule.x}
                    x2={target.x}
                    y1={capsule.y}
                    y2={target.y}
                  />
                );
              })
            )}
          </svg>

          {seedCapsules.map((capsule) => (
            <Link
              key={capsule.id}
              className={`graph-node graph-node-${capsule.cluster}`}
              href={`/capsules/${capsule.id}`}
              style={{
                left: `${capsule.x}%`,
                top: `${capsule.y}%`
              }}
            >
              <span className="graph-node-dot" />
              <span className="graph-node-label">{capsule.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="graph-ledger">
        {Object.entries(clusterLabels).map(([cluster, label]) => (
          <div key={cluster} className="panel graph-ledger-card">
            <p className="eyebrow">{label}</p>
            <div className="stack">
              {seedCapsules
                .filter((capsule) => capsule.cluster === cluster)
                .map((capsule) => (
                  <Link
                    key={capsule.id}
                    className="graph-ledger-item"
                    href={`/capsules/${capsule.id}`}
                  >
                    <strong>{capsule.title}</strong>
                    <span className="muted">{capsule.summary}</span>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
