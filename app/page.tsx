'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import {
  Users, TrendingUp, Flame, Zap, BarChart2, Globe,
  MessageSquare, BookOpen, CheckCircle, AlertTriangle,
  Phone, Target, Clock, ChevronRight, RefreshCw,
  Moon, Star, MapPin, Calendar, Activity
} from 'lucide-react'
import { getMockKPIs } from '@/lib/sheets'

// ── Palette ───────────────────────────────────────────────────────────────
const GOLD   = '#d4a843'
const GOLD2  = '#e8c46a'
const HARAM  = '#2d5f9a'
const EMBER  = '#ef4444'
const AMBER  = '#f59e0b'
const TEAL   = '#14b8a6'
const VIOLET = '#8b5cf6'
const PEARL  = '#f8f4ef'

const PLATFORM_COLORS: Record<string,string> = {
  Facebook:'#1877f2', Instagram:'#e1306c', TikTok:'#ff0050',
  'X/Twitter':'#1da1f2', WhatsApp:'#25d366', Telegram:'#2ca5e0',
}
const INTENT_COLORS: Record<string,string> = {
  booking_ready:'#ef4444', booking_research:'#f59e0b',
  travel_planning:'#8b5cf6', info_seeking:'#14b8a6',
  complaint_competitor:'#d4a843',
}

// ── Small helpers ─────────────────────────────────────────────────────────
function n(v: unknown, decimals = 0): string {
  const num = Number(v) || 0
  return num.toLocaleString('ar-SA', { maximumFractionDigits: decimals })
}
function pct(v: unknown): string { return `${Number(v).toFixed(1)}%` }

// ── Components ────────────────────────────────────────────────────────────
function MetricCard({
  title, value, sub, icon: Icon, accent = 'gold', delta, suffix = ''
}: {
  title: string; value: string|number; sub?: string
  icon: React.ElementType; accent?: string; delta?: number; suffix?: string
}) {
  const colors: Record<string,string> = {
    gold:'#d4a843', red:'#ef4444', blue:'#3b82f6',
    green:'#10b981', purple:'#8b5cf6', teal:'#14b8a6',
  }
  const c = colors[accent] || colors.gold
  return (
    <div className={`metric-card ${accent} glass-card relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ background: `${c}18` }}>
          <Icon size={18} style={{ color: c }} />
        </div>
        {delta !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: delta >= 0 ? '#10b98122' : '#ef444422',
                     color: delta >= 0 ? '#34d399' : '#f87171' }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: PEARL, fontFamily: 'JetBrains Mono' }}>
        {value}{suffix}
      </div>
      <div className="text-xs font-medium text-[#f8f4ef99] ar">{title}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: `${c}99` }}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-base font-bold ar" style={{ color: PEARL }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#f8f4ef60' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function Badge({ text, type }: { text: string; type: 'hot'|'warm'|'cold'|'new'|string }) {
  const map: Record<string,[string,string]> = {
    HOT: ['#ef444422','#f87171'], hot: ['#ef444422','#f87171'],
    WARM:['#f59e0b22','#fbbf24'], warm:['#f59e0b22','#fbbf24'],
    COLD:['#3b82f622','#60a5fa'], cold:['#3b82f622','#60a5fa'],
    new: ['#10b98122','#34d399'], urgent:['#ef444422','#f87171'],
    open:['#14b8a622','#2dd4bf'], booking_ready:['#ef444422','#f87171'],
    booking_research:['#f59e0b22','#fbbf24'], published:['#10b98122','#34d399'],
    ready:['#14b8a622','#2dd4bf'],
  }
  const [bg, fg] = map[text] || map[type] || ['#ffffff12','#ffffff88']
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border"
      style={{ background: bg, color: fg, borderColor: `${fg}40` }}>
      {text}
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs" style={{ minWidth: 120 }}>
      <p className="text-[#f8f4ef80] mb-2 ar">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Flow status row ───────────────────────────────────────────────────────
function FlowStatus({ name, wh, status, lastRun }: {
  name: string; wh: string; status: 'active'|'paused'|'error'; lastRun: string
}) {
  const colors = { active:'#10b981', paused:'#f59e0b', error:'#ef4444' }
  const c = colors[status]
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: c }} />
        <div>
          <div className="text-xs font-semibold ar" style={{ color: PEARL }}>{name}</div>
          <div className="text-[10px] font-mono" style={{ color: '#f8f4ef40' }}>{wh}</div>
        </div>
      </div>
      <div className="text-right">
        <Badge text={status} type={status} />
        <div className="text-[10px] font-mono mt-0.5" style={{ color: '#f8f4ef40' }}>{lastRun}</div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [kpis, setKpis] = useState<ReturnType<typeof getMockKPIs> | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview'|'leads'|'content'|'flows'>('overview')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Try real API, fall back to mock
      try {
        const res = await fetch('/api/kpis', { cache: 'no-store' })
        if (res.ok) { setKpis(await res.json()) }
        else { setKpis(getMockKPIs()) }
      } catch { setKpis(getMockKPIs()) }
      setLoading(false)
      setLastRefresh(new Date())
    }
    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !kpis) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0d0b' }}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40` }}>
          <Moon size={28} style={{ color: GOLD }} />
        </div>
        <div className="text-sm ar" style={{ color: `${PEARL}60` }}>جاري تحميل البيانات...</div>
      </div>
    </div>
  )

  const d = kpis

  return (
    <div className="min-h-screen" style={{ background: '#0f0d0b' }}>
      {/* Background pattern */}
      <div className="fixed inset-0 bg-geometric opacity-50 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,168,67,0.06) 0%, transparent 70%)' }} />

      <div className="relative">
        {/* ── Header ── */}
        <header className="sticky top-0 z-40 px-6 py-4"
          style={{ background: 'rgba(15,13,11,0.85)', backdropFilter: 'blur(16px)',
                   borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30` }}>
                <Moon size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <h1 className="text-sm font-bold gold-shimmer ar">نظام RESV – فنادق مكة المكرمة</h1>
                <p className="text-[10px] font-mono" style={{ color: '#f8f4ef40' }}>
                  لوحة التحكم المتكاملة • {lastRefresh.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: '#10b98112', border: '1px solid #10b98130' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono" style={{ color: '#34d399' }}>LIVE</span>
              </div>
              <button className="p-2 rounded-lg transition-colors hover:bg-white/5"
                onClick={() => setLastRefresh(new Date())}>
                <RefreshCw size={14} style={{ color: `${PEARL}60` }} />
              </button>
            </div>
          </div>
        </header>

        {/* ── Tab nav ── */}
        <div className="px-6 pt-4 pb-0 max-w-[1600px] mx-auto">
          <div className="flex gap-1 p-1 rounded-xl w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['overview','leads','content','flows'] as const).map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all ar"
                style={{
                  background: activeTab === tab ? `${GOLD}18` : 'transparent',
                  color: activeTab === tab ? GOLD2 : `${PEARL}60`,
                  border: activeTab === tab ? `1px solid ${GOLD}30` : '1px solid transparent',
                }}>
                {tab === 'overview' ? '📊 نظرة عامة' : tab === 'leads' ? '👥 العملاء' :
                 tab === 'content' ? '📱 المحتوى' : '⚙️ الأنظمة'}
              </button>
            ))}
          </div>
        </div>

        <main className="px-6 py-6 max-w-[1600px] mx-auto space-y-6">

          {/* ════════════════════════════════════════════════════════════
              TAB: OVERVIEW
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && <>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard title="إجمالي العملاء" value={n(d.totalLeads)} icon={Users} accent="gold" delta={12} />
              <MetricCard title="اليوم" value={n(d.todayLeads)} icon={Activity} accent="teal" delta={5} />
              <MetricCard title="HOT Leads" value={n(d.hotLeads)} icon={Flame} accent="red" delta={8} />
              <MetricCard title="متوسط الدرجة" value={n(d.avgScore)} suffix="/100" icon={Target} accent="blue" />
              <MetricCard title="حجوزات" value={n(d.bookings)} icon={CheckCircle} accent="green" delta={15} />
              <MetricCard title="معدل التحويل" value={pct(d.conversionRate)} icon={TrendingUp} accent="purple" delta={3} />
            </div>

            {/* ── Charts row ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Leads trend – spans 2 cols */}
              <div className="lg:col-span-2 glass-card p-5">
                <SectionHeader title="Leads اليومية (آخر 14 يوم)" sub="مقارنة HOT / WARM / COLD" />
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={d.recentReports} margin={{top:5,right:5,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="gHot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EMBER} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={EMBER} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gWarm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={AMBER} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={AMBER} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="report_date" tick={{fontSize:10, fill:'#f8f4ef40'}}
                      tickFormatter={v => v?.slice(5)} />
                    <YAxis tick={{fontSize:10, fill:'#f8f4ef40'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="hot_leads" name="HOT"
                      stroke={EMBER} fill="url(#gHot)" strokeWidth={2} />
                    <Area type="monotone" dataKey="warm_leads" name="WARM"
                      stroke={AMBER} fill="url(#gWarm)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Platform pie */}
              <div className="glass-card p-5">
                <SectionHeader title="توزيع المنصات" />
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={d.platformBreakdown} dataKey="value" cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65} paddingAngle={3}>
                      {d.platformBreakdown.map((entry, i) => (
                        <Cell key={i} fill={PLATFORM_COLORS[entry.name] || GOLD} opacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {d.platformBreakdown.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px]"
                      style={{ color: `${PEARL}80` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: PLATFORM_COLORS[p.name] || GOLD }} />
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono ml-auto" style={{ color: GOLD }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Second charts row ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Intent breakdown bar */}
              <div className="glass-card p-5">
                <SectionHeader title="نية العملاء (AI)" />
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={d.intentBreakdown} layout="vertical"
                    margin={{top:0,right:10,left:0,bottom:0}}>
                    <XAxis type="number" tick={{fontSize:9,fill:'#f8f4ef40'}} />
                    <YAxis type="category" dataKey="name" width={120}
                      tick={{fontSize:9,fill:'#f8f4ef60'}}
                      tickFormatter={v => v.replace('_',' ').replace('booking','حجز').replace('research','بحث')
                        .replace('planning','تخطيط').replace('info_seeking','معلومات')
                        .replace('complaint','شكوى')} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {d.intentBreakdown.map((e, i) => (
                        <Cell key={i} fill={INTENT_COLORS[e.name] || GOLD} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Source breakdown */}
              <div className="glass-card p-5">
                <SectionHeader title="مصادر العملاء" />
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={d.sourceBreakdown} margin={{top:0,right:5,left:-20,bottom:20}}>
                    <XAxis dataKey="name" tick={{fontSize:9,fill:'#f8f4ef60'}} angle={-30} textAnchor="end" />
                    <YAxis tick={{fontSize:9,fill:'#f8f4ef40'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill={GOLD} opacity={0.75} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insights card */}
              <div className="glass-card p-5 flex flex-col">
                <SectionHeader title="🤖 رؤى الذكاء الاصطناعي" sub="تحليل يومي تلقائي" />
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-sm leading-relaxed ar" style={{ color: `${PEARL}90` }}>
                    {d.lastInsights || 'لا توجد رؤى اليوم. تأكد من تشغيل Flow #9.'}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: 'الأسبوع', val: n(d.weekLeads) },
                      { label: 'التسليم', val: pct(d.deliveryRate) },
                      { label: 'منشورات', val: n(d.publishedPosts) },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-2 rounded-lg"
                        style={{ background: `${GOLD}0a`, border: `1px solid ${GOLD}1a` }}>
                        <div className="text-base font-bold font-mono" style={{ color: GOLD2 }}>{s.val}</div>
                        <div className="text-[10px] ar" style={{ color: `${PEARL}60` }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings trend */}
            <div className="glass-card p-5">
              <SectionHeader title="الحجوزات اليومية" sub="آخر 14 يوم" />
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={d.recentReports} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <XAxis dataKey="report_date" tick={{fontSize:9,fill:'#f8f4ef40'}} tickFormatter={v=>v?.slice(5)} />
                  <YAxis tick={{fontSize:9,fill:'#f8f4ef40'}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="bookings" name="حجوزات"
                    stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 3 }}
                    activeDot={{ r: 5, fill: GOLD2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>}

          {/* ════════════════════════════════════════════════════════════
              TAB: LEADS
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'leads' && <>
            <div className="grid sm:grid-cols-4 gap-3">
              <MetricCard title="إجمالي العملاء" value={n(d.totalLeads)} icon={Users} accent="gold" />
              <MetricCard title="🔥 HOT" value={n(d.hotLeads)} icon={Flame} accent="red" />
              <MetricCard title="🌟 WARM" value={n(d.warmLeads)} icon={Star} accent="purple" />
              <MetricCard title="مهام عاجلة" value={n(d.urgentTasks)} icon={AlertTriangle} accent="red" />
            </div>

            {/* Sample leads table */}
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <SectionHeader title="أحدث العملاء (HOT Leads)" sub="العملاء الأعلى جودة اليوم" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      {['الاسم','الهاتف','المنصة','الدرجة','التصنيف','النية','الإلحاح','الخطوة','الوقت'].map(h => (
                        <th key={h} className="text-right ar whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name:'أبو صالح الغامدي', phone:'+966551234567', platform:'Facebook',
                        score:92, category:'HOT', intent:'booking_ready', urgency:'immediate',
                        step:'hot_booking', time:'منذ 5 دقائق' },
                      { name:'خالد القحطاني', phone:'+966501112233', platform:'X/Twitter',
                        score:87, category:'HOT', intent:'booking_ready', urgency:'soon',
                        step:'hot_booking', time:'منذ 12 دقيقة' },
                      { name:'أم عبدالله', phone:'+966559876543', platform:'Instagram',
                        score:78, category:'HOT', intent:'booking_research', urgency:'soon',
                        step:'warm_research', time:'منذ 25 دقيقة' },
                      { name:'ناصر الحربي', phone:'غير متاح', platform:'TikTok',
                        score:61, category:'WARM', intent:'travel_planning', urgency:'planned',
                        step:'planning', time:'منذ ساعة' },
                    ].map((lead, i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="ar font-medium" style={{ color: PEARL }}>{lead.name}</td>
                        <td className="font-mono text-xs" style={{ color: TEAL }}>{lead.phone}</td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${PLATFORM_COLORS[lead.platform] || GOLD}20`,
                                     color: PLATFORM_COLORS[lead.platform] || GOLD }}>
                            {lead.platform}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-[60px]">
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${lead.score}%`,
                                  background: lead.score >= 80 ? EMBER : lead.score >= 60 ? AMBER : HARAM }} />
                            </div>
                            <span className="text-xs font-mono" style={{ color: PEARL }}>{lead.score}</span>
                          </div>
                        </td>
                        <td><Badge text={lead.category} type={lead.category.toLowerCase()} /></td>
                        <td className="text-xs ar" style={{ color: `${PEARL}80` }}>
                          {lead.intent.replace('booking_','').replace('_',' ')}
                        </td>
                        <td><Badge text={lead.urgency} type={lead.urgency === 'immediate' ? 'hot' : 'warm'} /></td>
                        <td className="text-xs font-mono" style={{ color: `${PEARL}60` }}>{lead.step}</td>
                        <td className="text-xs ar" style={{ color: `${PEARL}50` }}>{lead.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {/* ════════════════════════════════════════════════════════════
              TAB: CONTENT
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'content' && <>
            <div className="grid sm:grid-cols-4 gap-3">
              <MetricCard title="منشورات نُشرت" value={n(d.publishedPosts)} icon={Globe} accent="teal" />
              <MetricCard title="مقالات WordPress" value={n(d.publishedArticles)} icon={BookOpen} accent="blue" />
              <MetricCard title="اليوم" value={n(d.recentReports[d.recentReports.length-1]?.posts_published||0)} icon={Zap} accent="gold" />
              <MetricCard title="معدل النجاح" value="94.2" suffix="%" icon={CheckCircle} accent="green" />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Content performance */}
              <div className="glass-card p-5">
                <SectionHeader title="أداء النشر اليومي" />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={d.recentReports.slice(-7)} margin={{top:5,right:5,left:-20,bottom:0}}>
                    <XAxis dataKey="report_date" tick={{fontSize:9,fill:'#f8f4ef40'}} tickFormatter={v=>v?.slice(5)} />
                    <YAxis tick={{fontSize:9,fill:'#f8f4ef40'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="posts_published" name="منشورات سوشيال" fill={TEAL} opacity={0.8} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent articles */}
              <div className="glass-card p-5">
                <SectionHeader title="أحدث المقالات" />
                <div className="space-y-3">
                  {[
                    {title:'أفضل فنادق مكة المكرمة 2026 – دليل شامل', status:'published', words:1450, score:87},
                    {title:'كيف تختار الفندق المناسب للعمرة', status:'published', words:1200, score:82},
                    {title:'فنادق 5 نجوم قريبة من الحرم – مراجعة', status:'ready', words:1680, score:91},
                    {title:'باقات حج 2026 مع إقامة فندقية', status:'idea', words:0, score:0},
                  ].map((art, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="text-xs font-medium ar truncate" style={{color:PEARL}}>{art.title}</div>
                        <div className="text-[10px] font-mono mt-0.5" style={{color:`${PEARL}50`}}>
                          {art.words > 0 ? `${art.words} كلمة • نقاط: ${art.score}` : 'في طور التوليد'}
                        </div>
                      </div>
                      <Badge text={art.status} type={art.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social post schedule */}
            <div className="glass-card p-5">
              <SectionHeader title="جدول المنشورات – أسبوع" sub="حسب نوع المحتوى والمنصة" />
              <div className="grid grid-cols-7 gap-2">
                {['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] font-bold mb-2 ar" style={{color:`${PEARL}60`}}>{day}</div>
                    {[
                      {type:'promotional',emoji:'💰',color:'#f59e0b'},
                      {type:'educational',emoji:'📚',color:'#3b82f6'},
                      {type:'testimonial',emoji:'⭐',color:'#10b981'},
                      {type:'seasonal',emoji:'🕌',color:'#8b5cf6'},
                      {type:'b2b',emoji:'🏢',color:'#14b8a6'},
                      {type:'inspirational',emoji:'✨',color:'#d4a843'},
                      {type:'offer',emoji:'🎁',color:'#ef4444'},
                    ].slice(i,i+1).map((t,j) => (
                      <div key={j} className="aspect-square rounded-xl flex flex-col items-center justify-center text-lg"
                        style={{background:`${t.color}15`, border:`1px solid ${t.color}30`}}>
                        <span>{t.emoji}</span>
                        <span className="text-[8px] mt-1" style={{color:`${t.color}90`}}>{t.type.slice(0,4)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>}

          {/* ════════════════════════════════════════════════════════════
              TAB: FLOWS
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'flows' && <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard title="الأنظمة النشطة" value="10" suffix="/11" icon={Activity} accent="green" />
              <MetricCard title="مهام مفتوحة" value={n(d.openTasks)} icon={Clock} accent="amber" />
              <MetricCard title="مهام عاجلة" value={n(d.urgentTasks)} icon={AlertTriangle} accent="red" />
              <MetricCard title="الرسائل المُرسَلة" value={n(d.publishedPosts * 7)} icon={MessageSquare} accent="teal" />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Flows status */}
              <div className="glass-card p-5">
                <SectionHeader title="حالة الأنظمة" sub="تحديث لحظي" />
                <div>
                  {[
                    {name:'Flow #1 – Radar اصطياد العملاء', wh:'/webhook/radar-hot-lead', status:'active' as const, last:'منذ 6 ساعات'},
                    {name:'Flow #2 – Lead Capture', wh:'/webhook/lead-from-radar', status:'active' as const, last:'منذ 5 دقائق'},
                    {name:'Flow #3 – Lead Scoring', wh:'/webhook/lead-scoring-entry', status:'active' as const, last:'منذ 5 دقائق'},
                    {name:'Flow #4 – Marketing Journeys', wh:'/webhook/marketing-journey', status:'active' as const, last:'منذ 15 دقيقة'},
                    {name:'Flow #5 – Delivery Engine', wh:'/webhook/makkah-delivery-engine', status:'active' as const, last:'منذ 3 دقائق'},
                    {name:'Flow #6 – Sales Handoff', wh:'/webhook/makkah-sales-handoff', status:'active' as const, last:'منذ ساعة'},
                  ].map((f, i) => <FlowStatus key={i} {...f} />)}
                </div>
              </div>

              <div className="glass-card p-5">
                <SectionHeader title="أنظمة المحتوى" />
                <div>
                  {[
                    {name:'Flow #7 – AI Content Factory', wh:'/webhook/generate-content', status:'active' as const, last:'منذ 7 ساعات'},
                    {name:'Flow #8 – Publisher & Images', wh:'يومي 9 صباحاً', status:'active' as const, last:'منذ 9 ساعات'},
                    {name:'Flow #9 – Performance Dashboard', wh:'يومي 8 صباحاً', status:'active' as const, last:'منذ 8 ساعات'},
                    {name:'Flow #10 – WordPress Pipeline', wh:'/webhook/wp-pipeline', status:'active' as const, last:'منذ 6 ساعات'},
                    {name:'Flow WP – WordPress Publisher', wh:'/webhook/wp-publish-now', status:'active' as const, last:'منذ 10 ساعات'},
                  ].map((f, i) => <FlowStatus key={i} {...f} />)}
                </div>
              </div>
            </div>

            {/* System architecture diagram */}
            <div className="glass-card p-5">
              <SectionHeader title="خريطة تكامل الأنظمة" />
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-2 min-w-[800px] py-4 px-2">
                  {[
                    {id:'F1',label:'Radar\n(F1)',color:'#ef4444',icon:'📡'},
                    {id:'arr1',label:'→',color:'',icon:''},
                    {id:'F2',label:'Capture\n(F2)',color:'#f59e0b',icon:'📥'},
                    {id:'arr2',label:'→',color:'',icon:''},
                    {id:'F3',label:'Scoring\n(F3)',color:'#3b82f6',icon:'🎯'},
                    {id:'arr3',label:'→',color:'',icon:''},
                    {id:'F46',label:'Journey→F4\nSales→F6',color:'#10b981',icon:'🛤️'},
                    {id:'arr4',label:'→',color:'',icon:''},
                    {id:'F5',label:'Delivery\n(F5)',color:'#8b5cf6',icon:'📨'},
                  ].map((n,i) => n.id.startsWith('arr') ? (
                    <div key={i} className="text-2xl" style={{color:`${GOLD}40`}}>→</div>
                  ) : (
                    <div key={i} className="flex-1 text-center p-3 rounded-xl text-xs"
                      style={{background:`${n.color}12`,border:`1px solid ${n.color}30`,minWidth:80}}>
                      <div className="text-xl mb-1">{n.icon}</div>
                      <div className="font-mono whitespace-pre-line font-bold" style={{color:n.color,fontSize:10}}>{n.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2 min-w-[800px]">
                  {[
                    {label:'F7 Content Factory',color:'#d4a843',icon:'✍️'},
                    {label:'F8 Publisher',color:'#14b8a6',icon:'📱'},
                    {label:'F9 Dashboard',color:'#6366f1',icon:'📊'},
                    {label:'F10 WordPress',color:'#ec4899',icon:'📝'},
                    {label:'FWP Publisher',color:'#84cc16',icon:'🌐'},
                  ].map((f, i) => (
                    <div key={i} className="flex-1 text-center p-2 rounded-lg text-[10px]"
                      style={{background:`${f.color}10`,border:`1px solid ${f.color}25`}}>
                      <span className="mr-1">{f.icon}</span>
                      <span style={{color:`${f.color}cc`}}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>}

        </main>

        {/* Footer */}
        <footer className="px-6 py-4 mt-8 text-center"
          style={{ borderTop: '1px solid rgba(212,168,67,0.08)' }}>
          <p className="text-xs font-mono" style={{ color: '#f8f4ef30' }}>
            RESV Dashboard v2.0 • {new Date().getFullYear()} •{' '}
            <span style={{ color: GOLD }}>Makkah Hotel System</span> •{' '}
            آخر تحديث: {lastRefresh.toLocaleString('ar-SA', {timeZone:'Asia/Riyadh'})}
          </p>
        </footer>
      </div>
    </div>
  )
}
