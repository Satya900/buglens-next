import { createClient } from "@/utils/supabase/server";

export default async function ClosingCTA() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="closing-cta">
      <div className="closing-cta-eyebrow">{"// start today"}</div>
      <h2 className="closing-cta-title">
        Your next prod bug is already<br />
        in an <em>open PR.</em>
      </h2>
      <p className="closing-cta-sub">
        BugLens finds it before your team merges. Install in 60 seconds. No config files. No CI changes.
      </p>
      {user ? (
        <a className="btn-primary" href="/dashboard">Go to Dashboard</a>
      ) : (
        <a className="btn-primary" href="/login">Start reviewing →</a>
      )}
    </div>
  );
}
