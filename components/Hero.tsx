import { createClient } from "@/utils/supabase/server";

export default async function Hero() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <section className="hero" id="top">
      <div className="badge">
        <span className="badge-dot"></span>
        Now in development - shipping Q3 2026
      </div>
      <h1 className="hero-title">Your AI<br /><em>senior reviewer</em><br />never sleeps</h1>
      <p className="hero-sub">BugLens reviews every pull request before your team does - catching bugs, vulnerabilities, and style violations using your own codebase as context.</p>
      <div className="hero-actions">
        {user ? (
          <a className="btn-primary" href="/dashboard">Go to Dashboard</a>
        ) : (
          <a className="btn-primary" href="/login">Get early access</a>
        )}
        <a className="btn-ghost" href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer">View on GitHub -&gt;</a>
      </div>
    </section>
  );
}
