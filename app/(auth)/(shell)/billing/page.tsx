import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch billing data from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, current_usage, usage_limit, email')
    .eq('id', user.id)
    .single()

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

  const isSuccessRedirect = success === 'true' && tier !== 'PRO'

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="page-title">Management</p>
          <h1 className="page-heading">Plan & Billing</h1>
        </div>
      </div>

      {isSuccessRedirect && (
        <div style={{ 
          background: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid var(--green)', 
          borderRadius: 12, 
          padding: '1.5rem', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: 24 }}>✨</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>Payment Successful!</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>We are currently processing your upgrade. Your dashboard will reflect **PRO** status in moments...</p>
          </div>
          <div className="loader-small" />
          <script dangerouslySetInnerHTML={{ __html: `
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          `}} />
        </div>
      )}

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

            <div className="card" style={{ border: tier === 'PRO' ? '1px solid var(--green-muted)' : '1px solid var(--border)', background: tier === 'PRO' ? 'linear-gradient(to bottom right, var(--surface), rgba(34,197,94,0.03))' : 'var(--surface)' }}>
              <div className="card-header">
                <span className="card-title" style={{ color: tier === 'PRO' ? 'var(--green)' : 'var(--text)' }}>Pro</span>
                <span className="badge-green" style={{ fontSize: 9 }}>POPULAR</span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem' }}>$19<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>/mo</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['Unlimited Reviews', 'Priority AI Models', 'Private Repositories', 'Security Audits', 'Priority Support'].map(f => (
                    <li key={f} style={{ fontSize: 12, color: tier === 'PRO' ? 'var(--text)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--green)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {tier === 'PRO' ? (
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: 8, 
                    border: '1px solid var(--green)', 
                    color: 'var(--green)', 
                    textAlign: 'center', 
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    Currently Active
                  </div>
                ) : (
                  <Link 
                    href={`/api/checkout/polar?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`} 
                    data-polar-checkout
                    className="btn-primary" 
                    style={{ width: '100%', fontSize: 12, display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Billing Portal</span></div>
            <div style={{ padding: '1rem' }}>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: '1rem' }}>Manage your payment methods and download invoices.</p>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: 11 }}
                onClick={() => window.open('https://polar.sh/settings', '_blank')}
              >
                Customer Portal ↗
              </button>
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        .loader-small {
          width: 20px;
          height: 20px;
          border: 2px solid var(--green-muted);
          border-top: 2px solid var(--green);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
