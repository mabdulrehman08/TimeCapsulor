type CapsuleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CapsuleDetailPage({
  params
}: CapsuleDetailPageProps) {
  const { id } = await params;

  return (
    <main className="page-shell stack detail-shell">
      <div className="stack detail-hero">
        <p className="eyebrow">Capsule Detail</p>
        <h1>{id}</h1>
        <p className="muted">
          This preserved session becomes the replay surface for a person-shaped
          memory artifact.
        </p>
      </div>

      <section className="detail-grid">
        <div className="panel detail-player">
          <div className="detail-video-shell">
            <div className="detail-video-placeholder">Replay Surface</div>
          </div>
          <div className="detail-player-meta">
            <div>
              <span className="detail-label">Created</span>
              <strong>June 19, 2026</strong>
            </div>
            <div>
              <span className="detail-label">Duration</span>
              <strong>07:00</strong>
            </div>
            <div>
              <span className="detail-label">Mode</span>
              <strong>Voice + video capsule</strong>
            </div>
          </div>
        </div>

        <aside className="stack">
          <section className="panel detail-side-card">
            <p className="eyebrow">Key Memory</p>
            <h2>What this capsule holds</h2>
            <ul className="detail-list">
              <li>Recorded Vapi conversation</li>
              <li>Preserved webcam session</li>
              <li>Transcript and recall moments</li>
              <li>Future clone / relative conversation path</li>
            </ul>
          </section>

          <section className="panel detail-side-card detail-quote-card">
            <p className="eyebrow">Future Experience</p>
            <p className="detail-quote">
              Later this page becomes the place where a user or family member can
              return to a preserved voice and continue the memory.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
