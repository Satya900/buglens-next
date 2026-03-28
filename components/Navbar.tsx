import BugLensMark from "@/components/BugLensMark";

export default function Navbar() {
  return (
    <nav>
      <a className="nav-logo" href="#top" aria-label="BugLens home">
        <BugLensMark />
        buglens.app
      </a>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#updates">Updates</a></li>
        <li><a href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
      <a className="nav-cta" href="#updates">Early access -&gt;</a>
    </nav>
  );
}
