/**
 * Minimal markdown → HTML renderer for BugLens finding messages.
 * Handles: **bold**, `inline code`, newlines.
 * No external deps — keeps the bundle tiny.
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''

  return text
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // `inline code`
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--mono);font-size:0.9em;background:var(--surface2,rgba(255,255,255,0.06));padding:1px 5px;border-radius:3px;color:var(--green,#22c55e)">$1</code>')
    // newlines → <br>
    .replace(/\n/g, '<br>')
}
