import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: 'Privacy Policy | BugLens',
  description: 'How BugLens collects, uses, and protects your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      intro="BugLens is built by developers for developers. This policy explains exactly what data we collect, why, and how we protect it. No legalese walls — plain English."
    >
      <LegalSection title="1. Who we are">
        BugLens (<strong>buglens.app</strong>) is an AI-powered code review tool built and operated by Satyabrata Mohanty. You can reach us at{' '}
        <a href="mailto:satyatechgeek@gmail.com" className="legal-link">satyatechgeek@gmail.com</a>.
      </LegalSection>

      <LegalSection title="2. What we collect">
        <strong>When you sign in via GitHub OAuth:</strong>
        <ul>
          <li>Your GitHub username, display name, and email address</li>
          <li>A GitHub installation token (encrypted at rest) used to post reviews on your behalf</li>
        </ul>
        <strong>When BugLens reviews a pull request:</strong>
        <ul>
          <li>The PR diff (changed lines only) — sent to our AI analysis provider for review. We do not store full file contents.</li>
          <li>PR metadata: title, number, author, repo name, URL</li>
          <li>Review output: findings, severity scores, suggested fixes — stored in our database tied to your account</li>
        </ul>
        <strong>When you use the dashboard:</strong>
        <ul>
          <li>Usage count (how many reviews you've run this month)</li>
          <li>Lessons you add to the Knowledge Base</li>
          <li>Settings and preferences you configure</li>
        </ul>
        <strong>When you subscribe:</strong>
        <ul>
          <li>Payment is processed by DodoPayments. We never see or store your card number.</li>
          <li>We store your subscription tier, billing status, and transaction IDs.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your data">
        <ul>
          <li>To run AI code reviews on your pull requests</li>
          <li>To display your review history and analytics in the dashboard</li>
          <li>To send you review summary emails (you can disable this in Settings)</li>
          <li>To enforce usage limits based on your subscription tier</li>
          <li>To improve BugLens — we may analyse aggregated, anonymised review patterns to make detection better</li>
        </ul>
        We do not sell your data. We do not use your code or PR content for training AI models.
      </LegalSection>

      <LegalSection title="4. Third-party services">
        <ul>
          <li><strong>Supabase</strong> — database and authentication hosting (EU/US servers)</li>
          <li><strong>AI analysis provider</strong> — PR diffs are sent for analysis. Subject to the provider's data processing terms.</li>
          <li><strong>DodoPayments</strong> — payment processing. Subject to DodoPayments' privacy policy.</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Render</strong> — backend hosting</li>
          <li><strong>Vercel</strong> — frontend hosting</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Data retention">
        <ul>
          <li>Review records are kept for as long as your account is active</li>
          <li>If you delete your account, all your data is permanently removed within 30 days</li>
          <li>PR diffs are not retained by us after analysis completes</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Your rights">
        You can at any time:
        <ul>
          <li>Export your data — email us and we'll send a JSON export within 7 days</li>
          <li>Delete your account — via Settings → Danger Zone, or by emailing us</li>
          <li>Opt out of email notifications — toggle in Settings → Notifications</li>
          <li>Revoke GitHub App access — via GitHub → Settings → Applications</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Security">
        GitHub installation tokens are encrypted using AES-256-GCM before storage. We use HTTPS everywhere. See our <a href="/security" className="legal-link">Security page</a> for full details.
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        If we make material changes, we'll update the date at the top of this page and notify active users by email. Continued use after the change constitutes acceptance.
      </LegalSection>

      <LegalSection title="9. Contact">
        Questions? Email <a href="mailto:satyatechgeek@gmail.com" className="legal-link">satyatechgeek@gmail.com</a>. We respond within 48 hours.
      </LegalSection>
    </LegalPage>
  )
}
