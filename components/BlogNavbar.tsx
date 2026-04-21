import Link from "next/link";
import BugLensMark from "@/components/BugLensMark";

export default function BlogNavbar() {
  return (
    <header className="blog-nav-shell">
      <nav className="blog-nav">
        <Link className="blog-nav-logo" href="/" aria-label="BugLens home">
          <BugLensMark />
          <span>BugLens</span>
        </Link>

        <div className="blog-nav-links" aria-label="Blog navigation">
          <Link href="/">Product</Link>
          <Link href="/blog/">Journal</Link>
          <a
            href="https://github.com/Satya900"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        <Link className="blog-nav-cta" href="/login">
          Start for Free
        </Link>
      </nav>
    </header>
  );
}
