import Link from 'next/link'

interface HeaderProps {
  title?: string
  backHref?: string
  rightElement?: React.ReactNode
}

export default function Header({ title, backHref, rightElement }: HeaderProps) {
  return (
    <header style={{
      background: 'rgba(17,17,17,0.7)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      borderBottom: '1px solid rgba(45,45,45,0.6)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {backHref && (
          <Link href={backHref} style={{ color: '#f97316', display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
        )}
        {!backHref && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: '#f97316', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px' }}>KUNTORAPORTTI</div>
              <div style={{ color: '#f97316', fontSize: 9, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>MP-Logistiikka</div>
            </div>
          </div>
        )}
        {backHref && title && (
          <span style={{ color: '#f3f4f6', fontSize: 16, fontWeight: 700 }}>{title}</span>
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  )
}
