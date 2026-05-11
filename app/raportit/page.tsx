'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'

const mockReports = [
  { id: '1', bike: 'Honda CB650R', year: 2021, reg: 'ABC-123', km: 14230, status: 'ok', date: '11.5.2024', customer: 'Matti Meikäläinen' },
  { id: '2', bike: 'Yamaha MT-07', year: 2019, reg: 'XYZ-456', km: 32100, status: 'warn', date: '10.5.2024', customer: 'Pekka Virtanen' },
  { id: '3', bike: 'Kawasaki Z900', year: 2022, reg: 'DEF-789', km: 8540, status: 'bad', date: '10.5.2024', customer: 'Liisa Korhonen' },
  { id: '4', bike: 'BMW R1250GS', year: 2020, reg: 'GHI-012', km: 28900, status: 'ok', date: '9.5.2024', customer: 'Timo Mäkinen' },
  { id: '5', bike: 'Ducati Monster', year: 2023, reg: 'JKL-345', km: 3200, status: 'ok', date: '8.5.2024', customer: 'Anna Salminen' },
]
const statusLabel: Record<string, string> = { ok: 'OK', warn: 'Huomio', bad: 'Korjaus' }
const statusClass: Record<string, string> = { ok: 'badge-ok', warn: 'badge-warn', bad: 'badge-bad' }

export default function RaportitPage() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('kr_auth')) {
      router.replace('/login')
    }
  }, [router])

  return (
    <>
      <Header title="Raportit" />
      <main style={{ padding: '20px 16px' }}>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" placeholder="Hae rekisterinumerolla, merkillä..." style={{ paddingLeft: 38 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {['Kaikki', 'OK', 'Huomio', 'Korjaus'].map(f => (
            <button key={f} style={{
              background: f === 'Kaikki' ? 'rgba(249,115,22,0.15)' : '#1a1a1a',
              border: `1px solid ${f === 'Kaikki' ? '#f97316' : '#2d2d2d'}`,
              color: f === 'Kaikki' ? '#f97316' : '#9ca3af',
              borderRadius: 20, padding: '6px 14px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>

        <div className="section-label">{mockReports.length} raporttia</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockReports.map(r => (
            <Link key={r.id} href={`/raportit/${r.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, background: '#f97316', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f3f4f6', fontSize: 13, fontWeight: 600, marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.bike} · {r.year}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 1 }}>{r.customer}</div>
                  <div style={{ color: '#6b7280', fontSize: 11 }}>
                    {r.reg} · {r.km.toLocaleString('fi-FI')} km · {r.date}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className={`badge ${statusClass[r.status]}`}>{statusLabel[r.status]}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
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
