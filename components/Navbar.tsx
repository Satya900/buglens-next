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
        <li><Link href="/#updates">Updates</Link></li>
        <li><a href="https://github.com/Satya900" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
      {user ? (
        <div className="nav-profile-group">
          <Link href="/profile" className="nav-link profile-link">Profile</Link>
          <form action={signOut}>
            <button className="nav-cta" type="submit">Log Out</button>
          </form>
        </div>
      ) : (
        <Link className="nav-cta" href="/login">Sign In -&gt;</Link>
      )}
    </nav>
  );
}
