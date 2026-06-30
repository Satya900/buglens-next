export default function Newsletter() {
  return (
    <section className="section" id="updates">
      <div className="nl-box">
        <div className="nl-title">Follow the build</div>
        <p className="nl-sub">New post every week. No spam - just honest engineering notes from building BugLens in public.</p>
        <form className="nl-row">
          <input className="nl-input" type="email" placeholder="you@company.com" aria-label="Email address" />
          <button className="nl-btn" type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
