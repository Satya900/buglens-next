import Link from "next/link";
import BugLensMark from "@/components/BugLensMark";

export default function Navbar() {
  return (
    <nav>
      <Link className="nav-logo" href="/" aria-label="BugLens home">
        <BugLensMark />
        buglens.app
      </Link>
      <ul className="nav-links">
        <li><Link href="/#features">Features</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/#updates">Updates</Link></li>
        <li><a href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
      <Link className="nav-cta" href="/#updates">Early access -&gt;</Link>
    </nav>
  );
}
