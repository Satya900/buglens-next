'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BugLensMark from '@/components/BugLensMark'
import './Sidebar.css'

const CORE_NAV = [
  {
    label: 'Dashboard', path: '/dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    label: 'Repositories', path: '/repos',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  },
  {
    label: 'AI Reviews', path: '/reviews',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  },
  {
    label: 'Analytics', path: '/analytics',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-4"/></svg>
  },
  {
    label: 'Knowledge Base', path: '/knowledge',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  },
]

const ACCOUNT_NAV = [
  {
    label: 'Settings', path: '/settings',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  },
  {
    label: 'Billing', path: '/billing',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  },
]

export function Sidebar({ userEmail, userPlan }: { userEmail?: string; userPlan?: string }) {
  const pathname = usePathname()
  if (pathname === '/onboarding') return null

  const initials = (userEmail || 'U').charAt(0).toUpperCase()
  const displayPlan = (userPlan || 'Free').charAt(0).toUpperCase() + (userPlan || 'Free').slice(1).toLowerCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link href="/dashboard" className="sidebar-logo">
          <BugLensMark size={30} />
          <span className="sidebar-logo-text" style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--green)' }}>
            BugLens
          </span>
        </Link>

        <nav className="nav-container">
          <div className="nav-section">
            <span className="nav-section-label">Main</span>
            <div className="nav-group">
              {CORE_NAV.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-section">
            <span className="nav-section-label">Account</span>
            <div className="nav-group">
              {ACCOUNT_NAV.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <span className="user-name" title={userEmail}>{userEmail}</span>
            <span className="user-plan">{displayPlan} Plan</span>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn-logout">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
