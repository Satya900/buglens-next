export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="legal-page">
      <p className="legal-updated">Last updated: {updated}</p>
      <h1 className="legal-title">{title}</h1>
      <p className="legal-intro">{intro}</p>
      {children}
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2 className="legal-section-title">{title}</h2>
      <div className="legal-section-body">{children}</div>
    </section>
  );
}
