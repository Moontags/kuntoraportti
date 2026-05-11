'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import { getSupabaseBrowserClient } from '@/lib/supabase'

type Status = 'ok' | 'warn' | 'bad'
type Filter = 'all' | Status

type ReportRow = {
  id: string
  created_at: string
  bike_make: string | null
  bike_model: string | null
  bike_year: string | null
  bike_reg: string | null
  bike_km: string | null
  overall_status: Status | null
  customer_name: string | null
}

const statusLabel: Record<Status, string> = { ok: 'OK', warn: 'Huomio', bad: 'Korjaus' }
const statusClass: Record<Status, string> = { ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad' }

export default function RaportitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [reports, setReports] = useState<ReportRow[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kr_auth') !== '1') {
      router.replace('/login')
      return
    }

    let cancelled = false

    async function loadReports() {
      setLoading(true)
      setError('')
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error: dbError } = await supabase
          .from('reports')
          .select('id, created_at, bike_make, bike_model, bike_year, bike_reg, bike_km, overall_status, customer_name')
          .order('created_at', { ascending: false })
          .limit(50)

        if (dbError) throw dbError
        if (!cancelled) setReports((data || []) as ReportRow[])
      } catch {
        if (!cancelled) setError('Raporttien haku epäonnistui.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadReports()

    return () => {
      cancelled = true
    }
  }, [router])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return reports.filter((report) => {
      const status = (report.overall_status || 'warn') as Status
      if (filter !== 'all' && status !== filter) return false

      if (!normalized) return true
      const reg = (report.bike_reg || '').toLowerCase()
      const customer = (report.customer_name || '').toLowerCase()
      return reg.includes(normalized) || customer.includes(normalized)
    })
  }, [filter, query, reports])

  const filterButtons: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Kaikki' },
    { key: 'ok', label: 'OK' },
    { key: 'warn', label: 'Huomio' },
    { key: 'bad', label: 'Korjaus' },
  ]

  return (
    <>
      <Header title="Raportit" />
      <main style={{ padding: '20px 16px' }}>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <svg
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Hae rekisterinumerolla tai asiakkaalla..."
            style={{ paddingLeft: 38 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {filterButtons.map((button) => {
            const active = filter === button.key
            return (
              <button
                key={button.key}
                onClick={() => setFilter(button.key)}
                style={{
                  background: active ? 'rgba(249,115,22,0.15)' : '#1a1a1a',
                  border: `1px solid ${active ? '#f97316' : '#2d2d2d'}`,
                  color: active ? '#f97316' : '#9ca3af',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {button.label}
              </button>
            )
          })}
        </div>

        <div className="section-label">{filtered.length} raporttia</div>

        {loading && <div className="card">Ladataan raportteja...</div>}
        {!loading && error && <div className="card" style={{ color: '#f87171' }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((r) => {
              const status = (r.overall_status || 'warn') as Status
              const dateText = new Date(r.created_at).toLocaleDateString('fi-FI')
              const bikeLabel = `${r.bike_make || 'Tuntematon'} ${r.bike_model || ''}`.trim()
              const km = r.bike_km ? Number(r.bike_km).toLocaleString('fi-FI') : '—'

              return (
                <Link key={r.id} href={`/raportit/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
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
                          marginBottom: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {bikeLabel} · {r.bike_year || '—'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 1 }}>{r.customer_name || '—'}</div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>
                        {r.bike_reg || '—'} · {km} km · {dateText}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}

            {filtered.length === 0 && <div className="card">Ei raportteja valitulla suodatuksella.</div>}
          </div>
        )}
      </main>
      <div className="bottom-nav-spacer" />
      <BottomNav />
    </>
  )
}
