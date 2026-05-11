'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Etusivu', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { href: '/raportit', label: 'Raportit', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { href: '/raportti/uusi', label: 'Uusi', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ), special: true },
  { href: '/profiili', label: 'Profiili', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '480px',
      background: '#0a0a0a',
      borderTop: '1px solid #2d2d2d',
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {navItems.map(item => {
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '10px 0 6px', textDecoration: 'none',
            color: active ? '#f97316' : '#4b5563',
            transition: 'color 0.15s',
          }}>
            {item.special ? (
              <div style={{
                width: 44, height: 44, background: '#f97316', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: -20, boxShadow: '0 0 0 4px #0a0a0a',
              }}>
                {item.icon}
              </div>
            ) : item.icon}
            {!item.special && (
              <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
