// Polar removed — use /api/checkout/dodo
import { redirect } from 'next/navigation'
export async function GET() { redirect('/billing') }
