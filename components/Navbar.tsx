import Link from "next/link";
import BugLensMark from "@/components/BugLensMark";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav>
      <Link className="nav-logo" href="/" aria-label="BugLens home">
        <BugLensMark />
        buglens.app
      </Link>
      <ul className="nav-links">
        <li><Link href="/#features">Features</Link></li>
        <li><Link href="/blog/">Blog</Link></li>
        <li><Link href="/pricing/">Pricing</Link></li>
        <li><Link href="/oss-program">OSS Program</Link></li>
        <li><Link href="/changelog">Changelog</Link></li>
        <li><Link href="/for-agents" className="nav-agents-link">For Agents <span className="nav-agents-badge">New</span></Link></li>
      </ul>
      {user ? (
        <div className="nav-profile-group">
          <Link href="/dashboard" className="nav-link profile-link">Dashboard</Link>
          <form action={signOut}>
            <button className="nav-cta" type="submit">Log Out</button>
          </form>
        </div>
      ) : (
        <a href="/login" className="nav-cta">Get started</a>
      )}
    </nav>
  );
}
