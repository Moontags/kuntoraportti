import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import RaporttiNakyma from '@/components/ui/RaporttiNakyma'
import { esimerkkiraportti } from '@/lib/esimerkkiraportti'

export const metadata: Metadata = {
  title: 'Esimerkkiraportti — Kuntoraportti',
  description: 'Esimerkki MP-Logistiikan moottoripyörän kuntoraportista.',
}

export default function EsimerkkiRaporttiSivu() {
  return (
    <>
      <Header
        rightElement={
          <Link
            href="/login"
            style={{
              color: '#9ca3af',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Kirjaudu sisään →
          </Link>
        }
      />

      {/* Infobanneri — kertoo että kyseessä on esimerkki, ei oikea raportti */}
      <div
        style={{
          background: '#1a1a2e',
          color: '#9ca3af',
          textAlign: 'center',
          padding: '10px 16px',
          fontSize: 14,
          borderBottom: '1px solid #2d2d2d',
        }}
      >
        📋 Tämä on esimerkki raportista — oikea raportti lähetetään sinulle kuljetuksen jälkeen
      </div>

      <main style={{ padding: '20px 16px' }}>
        <RaporttiNakyma report={esimerkkiraportti} />
      </main>
    </>
  )
}
