'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const correct = process.env.NEXT_PUBLIC_APP_PASSWORD || 'kuntoraportti2024'
    if (password === correct) {
      sessionStorage.setItem('kr_auth', '1')
      router.push('/dashboard')
    } else {
      setError('Väärä salasana. Yritä uudelleen.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 72, height: 72, background: '#f97316', borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
          </svg>
        </div>
        <h1 style={{ color: '#f3f4f6', fontSize: 26, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
          Kuntoraportti
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>MP-Logistiikka · Tarkastussovellus</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
            SALASANA
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Syötä salasana"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <div style={{
            background: 'rgba(127,29,29,0.4)', border: '1px solid #7f1d1d',
            borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13,
          }}>
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Kirjaudutaan...' : (
            <>
              Kirjaudu sisään
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          )}
        </button>
      </form>
      <p style={{ color: '#374151', fontSize: 11, textAlign: 'center', marginTop: 40 }}>
        © 2024 MP-Logistiikka · info@mp-logistiikka.fi
      </p>
    </main>
  )
}
