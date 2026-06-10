'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import RaporttiNakyma, { type ReportRecord } from '@/components/ui/RaporttiNakyma'
import { getSupabaseBrowserClient } from '@/lib/supabase'

export default function RaporttiDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<ReportRecord | null>(null)
  const [waUrl, setWaUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kr_auth') !== '1') {
      router.replace('/login')
      return
    }

    let cancelled = false

    async function loadReport() {
      if (!params?.id) return
      setLoading(true)
      setError('')
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error: dbError } = await supabase
          .from('reports')
          .select('*')
          .eq('id', params.id)
          .single()

        if (dbError || !data) throw new Error('not-found')
        if (!cancelled) setReport(data as ReportRecord)
      } catch {
        if (!cancelled) setError('Raportin haku epäonnistui.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadReport()

    return () => {
      cancelled = true
    }
  }, [params?.id, router])

  async function resendReport() {
    if (!report?.id) return
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/raportti/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Uudelleenlähetys epäonnistui')
      if (typeof payload?.waUrl === 'string') setWaUrl(payload.waUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Uudelleenlähetys epäonnistui')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <Header title={report?.bike_reg || 'Raportti'} backHref="/raportit" />
      <main style={{ padding: '20px 16px' }}>
        {loading && <div className="card">Ladataan raporttia...</div>}
        {!loading && error && <div className="card" style={{ color: '#f87171' }}>{error}</div>}

        {!loading && report && (
          <>
            <RaporttiNakyma report={report} />

            <button onClick={resendReport} className="btn-primary" disabled={resending}>
              {resending ? 'Lähetetään uudelleen...' : 'Lähetä raportti uudelleen'}
            </button>

            {waUrl && (
              <button
                onClick={() => window.open(waUrl, '_blank', 'noopener,noreferrer')}
                style={{
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 18px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  marginTop: 10,
                }}
              >
                Lähetä WhatsApp-viesti
              </button>
            )}
          </>
        )}
      </main>
      <div className="bottom-nav-spacer" />
      <BottomNav />
    </>
  )
}
