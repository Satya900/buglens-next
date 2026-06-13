import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'BugLens <noreply@buglens.app>'
const DASHBOARD_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace('localhost:3000', 'buglens.app') || 'https://buglens.app'

export async function sendOSSWelcomeEmail({
  toEmail,
  name,
  repoName,
}: {
  toEmail: string
  name: string
  repoName: string
}) {
  try {
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      subject: '🎉 You\'re in — BugLens OSS Program approved',
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0d1510; color: #e8f0e9; padding: 32px; border-radius: 8px; border: 1px solid #1a2e1c;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 13px; color: #22c55e; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">BugLens OSS Program</span>
          </div>

          <h1 style="font-size: 24px; font-weight: 700; color: #e8f0e9; margin: 0 0 8px 0;">
            Welcome to Pro, ${name || 'friend'} 🚀
          </h1>
          <p style="color: #6b8f6e; font-size: 13px; margin: 0 0 28px 0;">${repoName}</p>

          <div style="background: #111a13; border: 1px solid #1e3320; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #e8f0e9;">
              Your OSS application has been approved. Your account has been upgraded to <strong style="color: #22c55e;">Pro — unlimited PR reviews</strong>.
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #a0b8a2; font-size: 13px; line-height: 1.8;">
              <li>Unlimited AI PR reviews</li>
              <li>All language support (JS, TS, Python, Go, Rust)</li>
              <li>Knowledge Base — upload your coding standards</li>
              <li>Full review history &amp; analytics</li>
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <p style="font-size: 13px; color: #6b8f6e; margin: 0 0 16px 0;">Get started in 2 minutes:</p>
            <ol style="margin: 0; padding-left: 20px; color: #a0b8a2; font-size: 13px; line-height: 2;">
              <li>Go to your dashboard → <strong>Repos</strong></li>
              <li>Connect your GitHub repo</li>
              <li>Open a pull request — BugLens will review it automatically</li>
            </ol>
          </div>

          <a href="${DASHBOARD_URL}/dashboard"
             style="display: inline-block; background: #22c55e; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 700; margin-bottom: 28px;">
            Go to Dashboard →
          </a>

          <p style="font-size: 12px; color: #3d5e40; margin: 0;">
            Questions? Reply to this email anytime.<br />
            — Satyabrata, founder of BugLens
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (err: any) {
    console.error('OSS welcome email failed:', err.message)
    return { error: err.message }
  }
}
