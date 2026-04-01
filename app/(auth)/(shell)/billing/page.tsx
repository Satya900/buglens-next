import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch billing data from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, current_usage, usage_limit')
    .eq('id', user.id)
    .single()

  // Fetch transaction history
  // Fetch transaction history
  const { data: transactions } = await supabase
    .from('billing_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const tier = (profile?.subscription_tier || 'FREE').toUpperCase()
  
  // Calculate usage from real reviews
  const { count: usageCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const usageLimit = tier === 'PRO' ? Infinity : 50
  const isUnlimited = usageLimit === Infinity
  const usagePercent = isUnlimited ? 0 : Math.min(100, ((usageCount || 0) / usageLimit) * 100)

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Management</p>
          <h1 className="page-heading">Plan & Billing</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Plan Analysis */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Current Usage</span>
              <span className={`badge-${tier === 'PRO' ? 'green' : 'dim'}`} style={{ fontSize: 10 }}>{tier} PLAN</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Monthly Reviews</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                  {usageCount} / <span style={{ color: isUnlimited ? 'var(--green)' : 'var(--text)' }}>
                    {isUnlimited ? 'Unlimited' : usageLimit}
                  </span>
                  {!isUnlimited && <span style={{ color: 'var(--text-dim)', fontWeight: 400, marginLeft: 4 }}>reviews used</span>}
                </span>
              </div>
              
              {!isUnlimited ? (
                <>
                  <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 10, overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${usagePercent}%`, height: '100%', background: 'var(--green)', boxShadow: '0 0 10px var(--green-glow)' }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                    Usage resets on the 1st of every month. 🗓️
                  </p>
                </>
              ) : (
                <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(34,197,94,0.05)', border: '1px solid var(--green-muted)', color: 'var(--green)', fontSize: 11, textAlign: 'center' }}>
                  ⭐ 🛡️ **Pro Account Impact**: You have zero limits on AI analysis tonight.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ border: tier === 'FREE' ? '1px solid var(--green-muted)' : '1px solid var(--border)' }}>
              <div className="card-header">
                <span className="card-title">Free</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>COMMUNITY</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>$0<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['50 Reviews / month', 'Standard AI Engine', 'Public Repositories', 'Standard Support'].map(f => (
                    <li key={f} style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--green-muted)', background: 'linear-gradient(to bottom right, var(--surface), rgba(34,197,94,0.03))' }}>
              <div className="card-header">
                <span className="card-title" style={{ color: 'var(--green)' }}>Pro</span>
                <span className="badge-green" style={{ fontSize: 9 }}>POPULAR</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>$19<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['Unlimited Reviews', 'Priority AI Models', 'Private Repositories', 'Security Audits', 'Priority Support'].map(f => (
                    <li key={f} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href={`/api/checkout/polar?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`} 
                  data-polar-checkout
                  className="btn-primary" 
                  style={{ width: '100%', fontSize: 12, display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Billing Portal</span></div>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: '1rem' }}>Manage your payment methods and download invoices.</p>
              <button className="btn-secondary" style={{ width: '100%', fontSize: 11 }}>Customer Portal ↗</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Recent Invoices</span></div>
            <div style={{ padding: 0 }}>
              {transactions && transactions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {transactions.slice(0, 5).map((t: any) => (
                    <div key={t.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{t.id.slice(0, 8)}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>${t.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
                  No invoices found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
