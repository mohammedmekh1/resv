import { NextResponse } from 'next/server'
import { getDashboardKPIs, getMockKPIs } from '@/lib/sheets'

export const runtime = 'edge'
export const revalidate = 300

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SHEET_API_KEY
    if (!apiKey) {
      // Return mock data for demo
      return NextResponse.json(getMockKPIs())
    }
    const kpis = await getDashboardKPIs()
    return NextResponse.json(kpis, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
    })
  } catch (e) {
    console.error('KPIs API error:', e)
    return NextResponse.json(getMockKPIs())
  }
}
