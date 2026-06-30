import Link from "next/link";

export default function BlogCTA() {
  return (
    <div className="blog-cta-container">
      <div className="blog-cta-glow"></div>
      <div className="blog-cta-content">
        <span className="blog-cta-badge">Ready for faster PRs?</span>
        <h3 className="blog-cta-title">Stop manual code reviews. Ship with confidence.</h3>
        <p className="blog-cta-desc">
          BugLens is an AI senior reviewer for GitHub PRs that catches bugs, vulnerabilities, and style violations before your team does. 
          Join the waitlist for our private beta today.
        </p>
        <div className="blog-cta-actions">
          <Link href="/login" className="btn-primary">
            Start for Free
          </Link>
          <Link href="/pricing/" className="btn-ghost" style={{ background: "transparent" }}>
            View Pricing →
          </Link>
        </div>
      </div>
    </div>
  );
}
