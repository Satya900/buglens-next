import Link from "next/link";
import BugLensMark from "@/components/BugLensMark";

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(34,197,94,0.1)',
      background: 'var(--surface, #0d1510)',
      padding: '3rem 2rem 2rem',
      marginTop: '4rem',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '2.5rem',
      }}>

        {/* Brand */}
        <div style={{ gridColumn: 'span 1' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 12 }}>
            <BugLensMark />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>buglens.app</span>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>
            AI code reviews for every pull request. Catches bugs before your team does.
          </p>
        </div>

        {/* Product */}
        <div>
          <p style={colHeader}>Product</p>
          <ul style={colList}>
            <li><Link href="/#features" style={linkStyle}>Features</Link></li>
            <li><Link href="/pricing" style={linkStyle}>Pricing</Link></li>
            <li><Link href="/changelog" style={linkStyle}>Changelog</Link></li>
            <li><Link href="/oss-program" style={linkStyle}>OSS Program</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <p style={colHeader}>Resources</p>
          <ul style={colList}>
            <li><Link href="/blog" style={linkStyle}>Blog</Link></li>
            <li><Link href="/security" style={linkStyle}>Security</Link></li>
            <li><a href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p style={colHeader}>Legal</p>
          <ul style={colList}>
            <li><Link href="/privacy-policy" style={linkStyle}>Privacy Policy</Link></li>
            <li><Link href="/terms" style={linkStyle}>Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1100,
        margin: '2.5rem auto 0',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-dim)',
      }}>
        <span>© 2026 BugLens. Built by <a href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', textDecoration: 'none' }}>Satyabrata Mohanty</a>.</span>
        <span>Made with ☕ for developers who ship.</span>
      </div>
    </footer>
  );
}

const colHeader: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'var(--text-dim)',
  fontFamily: 'monospace',
  marginBottom: 12,
  marginTop: 0,
};

const colList: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-muted)',
  textDecoration: 'none',
};
