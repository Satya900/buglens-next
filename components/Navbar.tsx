export default function Navbar() {
  return (
    <nav>
      <a className="nav-logo" href="#top" aria-label="BugLens home">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="9" r="5" />
          <circle cx="9" cy="9" r="2" fill="currentColor" stroke="none" />
          <line x1="13" y1="13" x2="18" y2="18" strokeLinecap="round" strokeWidth="2" />
          <circle cx="6.5" cy="2" r="1" fill="currentColor" stroke="none" />
          <circle cx="11.5" cy="2" r="1" fill="currentColor" stroke="none" />
          <line x1="6.5" y1="3" x2="7.5" y2="5.5" strokeLinecap="round" strokeWidth="1" />
          <line x1="11.5" y1="3" x2="10.5" y2="5.5" strokeLinecap="round" strokeWidth="1" />
        </svg>
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
