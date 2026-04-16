// lib/sheets.ts – Google Sheets data fetcher for RESV Dashboard

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1FOp8T6YvD1qg6XXnCg7RJopHG_uOAr8A74q2tFu26HA'
const API_KEY  = process.env.NEXT_PUBLIC_SHEET_API_KEY || ''
const BASE     = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`

export type LeadRow = {
  lead_id: string; phone: string; name: string; source: string
  platform: string; category: string; status: string; score: number
  final_score: number; radar_intent: string; radar_urgency: string
  journey_step: string; created_at: string; is_radar: boolean
  budget_signal: string; travel_group: string; stars_preference: string
  pax_hint: number; lead_type: string; preferred_channel: string
}

export type DailyReport = {
  report_date: string; total_leads: number; hot_leads: number
  warm_leads: number; cold_leads: number; avg_score: number
  from_radar: number; from_whatsapp: number; delivery_rate: number
  bookings: number; lead_to_booking_rate: number; insights: string
  posts_published: number; articles_published: number
}

export type SocialPost = {
  topic_id: string; topic: string; content_type: string
  ar_title: string; status: string; content_score: number
  platforms: string; published_at: string; success_rate: number
  image_url: string; generated_at: string
}

export type SalesTask = {
  task_id: string; lead_name: string; phone: string; priority: string
  task_type: string; status: string; lead_score: number; created_at: string
  sla_minutes: number; action_required: string; category: string
}

export type Article = {
  article_id: string; title_ar: string; category: string; status: string
  word_count: number; readability_score: number; published_at: string
  page_url: string; views: number; focus_keyword: string
}

async function fetchSheet(range: string): Promise<string[][]> {
  const url = `${BASE}/${range}?key=${API_KEY}&valueRenderOption=UNFORMATTED_VALUE`
  try {
    const r = await fetch(url, { next: { revalidate: 300 } })
    if (!r.ok) return []
    const d = await r.json()
    return d.values || []
  } catch { return [] }
}

function rowsToObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map(row => {
    const obj: Record<string, unknown> = {}
    headers.forEach((h, i) => { obj[h] = row[i] ?? '' })
    return obj as T
  })
}

export async function getLeads(limit = 200): Promise<LeadRow[]> {
  const rows = await fetchSheet('leads!A:BZ')
  return rowsToObjects<LeadRow>(rows).slice(-limit)
}

export async function getDailyReports(limit = 30): Promise<DailyReport[]> {
  const rows = await fetchSheet('daily_reports!A:AB')
  return rowsToObjects<DailyReport>(rows).slice(-limit)
}

export async function getSocialPosts(limit = 50): Promise<SocialPost[]> {
  const rows = await fetchSheet('social_posts!A:AM')
  return rowsToObjects<SocialPost>(rows).slice(-limit)
}

export async function getSalesTasks(limit = 100): Promise<SalesTask[]> {
  const rows = await fetchSheet('sales_tasks!A:AD')
  return rowsToObjects<SalesTask>(rows).slice(-limit)
}

export async function getArticles(limit = 50): Promise<Article[]> {
  const rows = await fetchSheet('articles!A:AD')
  return rowsToObjects<Article>(rows).slice(-limit)
}

// ── Computed KPIs ──────────────────────────────────────────────────────────
export async function getDashboardKPIs() {
  const [leads, reports, tasks, posts, articles] = await Promise.all([
    getLeads(500), getDailyReports(7), getSalesTasks(200),
    getSocialPosts(100), getArticles(50),
  ])

  const today = new Date().toISOString().split('T')[0]
  const todayLeads  = leads.filter(l => l.created_at?.startsWith(today))
  const hotLeads    = leads.filter(l => l.category === 'HOT')
  const warmLeads   = leads.filter(l => l.category === 'WARM')
  const openTasks   = tasks.filter(t => t.status === 'open')
  const urgentTasks = tasks.filter(t => t.status === 'open' && t.priority === 'urgent')
  const pubPosts    = posts.filter(p => p.status === 'published')
  const pubArticles = articles.filter(a => a.status === 'published')

  const lastReport  = reports[reports.length - 1] || {} as DailyReport
  const weekLeads   = leads.filter(l => {
    const d = new Date(l.created_at || '')
    return (Date.now() - d.getTime()) < 7 * 86400000
  })

  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (Number(l.final_score) || 0), 0) / leads.length)
    : 0

  return {
    totalLeads:      leads.length,
    todayLeads:      todayLeads.length,
    hotLeads:        hotLeads.length,
    warmLeads:       warmLeads.length,
    avgScore,
    openTasks:       openTasks.length,
    urgentTasks:     urgentTasks.length,
    publishedPosts:  pubPosts.length,
    publishedArticles: pubArticles.length,
    bookings:        Number(lastReport.bookings) || 0,
    conversionRate:  Number(lastReport.lead_to_booking_rate) || 0,
    deliveryRate:    Number(lastReport.delivery_rate) || 0,
    weekLeads:       weekLeads.length,
    lastInsights:    lastReport.insights || '',
    recentReports:   reports.slice(-14),
    platformBreakdown: getPlatformBreakdown(leads),
    intentBreakdown:   getIntentBreakdown(leads),
    sourceBreakdown:   getSourceBreakdown(leads),
  }
}

function getPlatformBreakdown(leads: LeadRow[]) {
  const m: Record<string, number> = {}
  leads.forEach(l => {
    const p = l.platform || 'Unknown'
    m[p] = (m[p] || 0) + 1
  })
  return Object.entries(m).map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value).slice(0, 6)
}

function getIntentBreakdown(leads: LeadRow[]) {
  const m: Record<string, number> = {}
  leads.forEach(l => {
    const i = l.radar_intent || 'unknown'
    m[i] = (m[i] || 0) + 1
  })
  return Object.entries(m).map(([name, value]) => ({ name, value }))
}

function getSourceBreakdown(leads: LeadRow[]) {
  const m: Record<string, number> = {}
  leads.forEach(l => {
    const s = (l.source || 'Unknown').replace('Radar_','').replace('_Comments','').replace('_Groups','')
    m[s] = (m[s] || 0) + 1
  })
  return Object.entries(m).map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value).slice(0, 8)
}

// Mock data for demo (when no API key)
export function getMockKPIs() {
  const today = new Date().toISOString().split('T')[0]
  return {
    totalLeads: 847, todayLeads: 23, hotLeads: 68, warmLeads: 234,
    avgScore: 61, openTasks: 12, urgentTasks: 3,
    publishedPosts: 156, publishedArticles: 42,
    bookings: 31, conversionRate: 3.7, deliveryRate: 94.2,
    weekLeads: 142, lastInsights: 'أداء ممتاز اليوم – 23 عميل جديد، 68% من HOT leads تفاعلوا خلال ساعة. نوصي بزيادة محتوى فيسبوك بنسبة 20%.',
    recentReports: Array.from({length: 14}, (_, i) => ({
      report_date: new Date(Date.now() - (13-i)*86400000).toISOString().split('T')[0],
      total_leads: 40 + Math.floor(Math.random()*40),
      hot_leads: 5 + Math.floor(Math.random()*20),
      warm_leads: 15 + Math.floor(Math.random()*25),
      cold_leads: 5 + Math.floor(Math.random()*15),
      bookings: 1 + Math.floor(Math.random()*6),
      delivery_rate: 88 + Math.random()*10,
      posts_published: 2 + Math.floor(Math.random()*4),
    })),
    platformBreakdown: [
      {name:'Facebook',value:312},{name:'Instagram',value:198},
      {name:'TikTok',value:156},{name:'X/Twitter',value:98},
      {name:'WhatsApp',value:67},{name:'Telegram',value:16},
    ],
    intentBreakdown: [
      {name:'booking_ready',value:180},{name:'booking_research',value:234},
      {name:'travel_planning',value:156},{name:'info_seeking',value:178},
      {name:'complaint_competitor',value:99},
    ],
    sourceBreakdown: [
      {name:'FB Groups',value:287},{name:'FB Comments',value:156},
      {name:'Instagram',value:198},{name:'TikTok',value:143},
      {name:'Twitter',value:63},{name:'WhatsApp',value:67},{name:'Form',value:32},
    ],
  }
}
