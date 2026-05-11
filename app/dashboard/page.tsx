'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'

const mockReports = [
  { id: '1', bike: 'Honda CB650R', year: 2021, reg: 'ABC-123', km: 14230, status: 'ok', date: 'Tänään 09:14' },
  { id: '2', bike: 'Yamaha MT-07', year: 2019, reg: 'XYZ-456', km: 32100, status: 'warn', date: 'Eilen 15:42' },
  { id: '3', bike: 'Kawasaki Z900', year: 2022, reg: 'DEF-789', km: 8540, status: 'bad', date: 'Eilen 11:05' },
]
const statusLabel: Record<string, string> = { ok: 'OK', warn: 'Huomio', bad: 'Korjaus' }
const statusClass: Record<string, string> = { ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad' }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Hyvää huomenta'
  if (h < 17) return 'Hyvää päivää'
  return 'Hyvää iltaa'
}

export default function DashboardPage() {
  const router = useRouter()
  const [today] = useState(() => new Date().toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' }))

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('kr_auth')) {
      router.replace('/login')
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
          <p style={{ color: '#6b7280', fontSize: 13, margin: 0, textTransform: 'capitalize' }}>{today}</p>
        </div>

        <Link href="/raportti/uusi" className="btn-primary" style={{ marginBottom: 10, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Uusi kuntoraportti
        </Link>
        <Link href="/raportit" className="btn-secondary" style={{ marginBottom: 24, textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Kaikki raportit
        </Link>

        <div className="section-label">Yhteenveto</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            { num: '3', label: 'Tänään' },
            { num: '12', label: 'Tällä viikolla' },
            { num: '47', label: 'Tässä kuussa' },
            { num: '124', label: 'Yhteensä' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ color: '#f97316', fontSize: 24, fontWeight: 800, margin: '0 0 2px' }}>{s.num}</div>
              <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="section-label">Viimeisimmät raportit</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockReports.map(r => (
            <Link key={r.id} href={`/raportit/${r.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, background: '#f97316', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f3f4f6', fontSize: 13, fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.bike} · {r.year}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 11 }}>
                    {r.reg} · {r.km.toLocaleString('fi-FI')} km · {r.date}
                  </div>
                </div>
                <span className={`badge ${statusClass[r.status]}`}>{statusLabel[r.status]}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <div className="bottom-nav-spacer" />
      <BottomNav />
    </>
  )
}
