import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata = {
  title: 'Terms of Service | BugLens',
  description: 'Terms and conditions for using BugLens.',
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 2026"
      intro="By using BugLens you agree to these terms. We've kept them as short and clear as possible."
    >
      <LegalSection title="1. The service">
        BugLens is an AI-powered code review tool that integrates with GitHub to automatically review pull requests. It is operated by Satyabrata Mohanty (<strong>buglens.app</strong>).
      </LegalSection>

      <LegalSection title="2. Your account">
        <ul>
          <li>You must have a GitHub account to use BugLens</li>
          <li>You are responsible for all activity that occurs under your account</li>
          <li>You must not share your account or use it to serve multiple organisations on a single free plan</li>
          <li>We reserve the right to suspend accounts that violate these terms</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        You may not use BugLens to:
        <ul>
          <li>Review code that contains or generates malware, spyware, or illegal content</li>
          <li>Attempt to reverse-engineer, scrape, or extract our AI models or review engine</li>
          <li>Circumvent usage limits through multiple accounts or automation</li>
          <li>Resell or white-label BugLens as your own product without written permission</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Free tier">
        The free tier allows up to <strong>10 PR reviews per month</strong>. Reviews reset on the first of each month. Free tier is intended for individual developers evaluating BugLens — not for team or commercial use.
      </LegalSection>

      <LegalSection title="5. Paid plans">
        <ul>
          <li>Paid plans are billed monthly via DodoPayments</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>Refunds are available within 7 days of a charge if BugLens was not functional during that period — email us</li>
          <li>We may change pricing with 30 days notice to active subscribers</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. OSS Program">
        OSS Program approvals grant 6 months of Pro access. Approval is at our discretion. We reserve the right to revoke access if a project no longer meets eligibility criteria (e.g., repository becomes private or unmaintained).
      </LegalSection>

      <LegalSection title="7. Your code and data">
        <ul>
          <li>You retain full ownership of your code. BugLens accesses it only to perform reviews.</li>
          <li>We do not use your code or PR content to train AI models.</li>
          <li>PR diffs are sent to our AI analysis provider for review under their data processing terms.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Service availability">
        We aim for high availability but do not guarantee uptime. BugLens is provided "as is." We are not liable for missed reviews, incorrect findings, or any damage arising from use of the service.
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        To the maximum extent permitted by law, BugLens and its operators are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid in the 3 months prior to the claim.
      </LegalSection>

      <LegalSection title="10. Changes to terms">
        We may update these terms. Material changes will be communicated by email to active users. Continued use constitutes acceptance.
      </LegalSection>

      <LegalSection title="11. Contact">
        Questions about these terms? Email <a href="mailto:satyatechgeek@gmail.com" className="legal-link">satyatechgeek@gmail.com</a>.
      </LegalSection>
    </LegalPage>
  )
}
