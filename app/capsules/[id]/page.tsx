type CapsuleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CapsuleDetailPage({
  params
}: CapsuleDetailPageProps) {
  const { id } = await params;

  return (
    <main className="page-shell stack">
      <div className="stack">
        <p className="muted">Capsule Detail</p>
        <h1>{id}</h1>
        <p className="muted">
          This page is where saved video playback, transcript, and session
          metadata will render in V1.
        </p>
      </div>

      <section className="panel stack">
        <h2>Expected Data</h2>
        <ul>
          <li>videoUrl</li>
          <li>createdAt</li>
          <li>durationSec</li>
          <li>transcript</li>
          <li>vapiSessionId</li>
        </ul>
      </section>
    </main>
  );
}
