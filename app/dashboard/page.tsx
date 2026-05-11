'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import { getSupabaseBrowserClient } from '@/lib/supabase'

type Status = 'ok' | 'warn' | 'bad'
type ReportRow = {
  id: string
  created_at: string
  bike_make: string | null
  bike_model: string | null
  bike_year: string | null
  bike_reg: string | null
  bike_km: string | null
  overall_status: Status | null
}

type Stats = {
  today: number
  week: number
  month: number
  total: number
}

const statusLabel: Record<Status, string> = { ok: 'OK', warn: 'Huomio', bad: 'Korjaus' }
const statusClass: Record<Status, string> = { ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad' }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Hyvää huomenta'
  if (hour < 17) return 'Hyvää päivää'
  return 'Hyvää iltaa'
}

function getStartOfTodayIso() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function getStartOfWeekIso() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  now.setDate(now.getDate() - diff)
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function getStartOfMonthIso() {
  const now = new Date()
  now.setDate(1)
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0, total: 0 })
  const [recentReports, setRecentReports] = useState<ReportRow[]>([])

  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kr_auth') !== '1') {
      router.replace('/login')
      return
    }

    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const supabase = getSupabaseBrowserClient()
        const startToday = getStartOfTodayIso()
        const startWeek = getStartOfWeekIso()
        const startMonth = getStartOfMonthIso()

        const [todayRes, weekRes, monthRes, totalRes, latestRes] = await Promise.all([
          supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', startToday),
          supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', startWeek),
          supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', startMonth),
          supabase.from('reports').select('*', { count: 'exact', head: true }),
          supabase
            .from('reports')
            .select('id, created_at, bike_make, bike_model, bike_year, bike_reg, bike_km, overall_status')
            .order('created_at', { ascending: false })
            .limit(3),
        ])

        if (todayRes.error || weekRes.error || monthRes.error || totalRes.error || latestRes.error) {
          throw new Error('dashboard fetch failed')
        }

        if (!cancelled) {
          setStats({
            today: todayRes.count || 0,
            week: weekRes.count || 0,
            month: monthRes.count || 0,
            total: totalRes.count || 0,
          })
          setRecentReports((latestRes.data || []) as ReportRow[])
        }
      } catch {
        if (!cancelled) setError('Dashboardin tiedot eivät latautuneet.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <>
      <Header />
      <main style={{ padding: '20px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: '#f3f4f6', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            {getGreeting()} 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0, textTransform: 'capitalize' }}>{todayLabel}</p>
        </div>

        <Link href="/raportti/uusi" className="btn-primary" style={{ marginBottom: 10, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Uusi kuntoraportti
        </Link>
        <Link href="/raportit" className="btn-secondary" style={{ marginBottom: 24, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Kaikki raportit
        </Link>

        <div className="section-label">Yhteenveto</div>
        {error && <div className="card" style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            { num: stats.today, label: 'Tänään' },
            { num: stats.week, label: 'Tällä viikolla' },
            { num: stats.month, label: 'Tässä kuussa' },
            { num: stats.total, label: 'Yhteensä' },
          ].map((item) => (
            <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ color: '#f97316', fontSize: 24, fontWeight: 800, margin: '0 0 2px' }}>{item.num}</div>
              <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="section-label">Viimeisimmät raportit</div>
        {loading && <div className="card">Ladataan raportteja...</div>}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentReports.map((r) => {
              const status = (r.overall_status || 'warn') as Status
              const bike = `${r.bike_make || 'Tuntematon'} ${r.bike_model || ''}`.trim()
              const dateText = new Date(r.created_at).toLocaleDateString('fi-FI')
              return (
                <Link key={r.id} href={`/raportit/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: '#f97316',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#f3f4f6',
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {bike} · {r.bike_year || '—'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>
                        {r.bike_reg || '—'} · {r.bike_km ? Number(r.bike_km).toLocaleString('fi-FI') : '—'} km · {dateText}
                      </div>
                    </div>
                    <span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span>
                  </div>
                </Link>
              )
            })}
            {!error && recentReports.length === 0 && <div className="card">Ei raportteja vielä.</div>}
          </div>
        )}
      </main>
      <div className="bottom-nav-spacer" />
      <BottomNav />
    </>
  )
}
