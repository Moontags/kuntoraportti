export type Status = 'ok' | 'warn' | 'bad'

export type ReportRecord = {
  id: string
  created_at: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  inspection_type: string | null
  bike_make: string | null
  bike_model: string | null
  bike_year: string | null
  bike_color: string | null
  bike_reg: string | null
  bike_vin: string | null
  bike_km: string | null
  bike_fuel: string | null
  inspection_data: Record<string, unknown> | null
  overall_status: Status | null
  overall_notes: string | null
  inspector: string | null
  photo_urls: string[] | null
  photo_captions: string[] | null
}

export const statusConfig: Record<Status, { label: string; bg: string; color: string }> = {
  ok: { label: '✅ Ajokunnossa', bg: '#14532d', color: '#4ade80' },
  warn: { label: '⚠️ Huomioita', bg: '#78350f', color: '#fbbf24' },
  bad: { label: '❌ Ei ajokunnossa', bg: '#7f1d1d', color: '#f87171' },
}

function readInspectionBoolean(data: Record<string, unknown> | null, key: string) {
  return Boolean(data?.[key])
}

function readInspectionText(data: Record<string, unknown> | null, key: string) {
  const value = data?.[key]
  return typeof value === 'string' ? value : ''
}

export default function RaporttiNakyma({ report }: { report: ReportRecord }) {
  const status: Status = (report.overall_status || 'warn') as Status
  const inspectionData = report.inspection_data || null

  return (
    <>
      <div
        style={{
          background: statusConfig[status].bg,
          borderRadius: 12,
          padding: '16px',
          textAlign: 'center',
          marginBottom: 14,
          border: '1px solid #2d2d2d',
        }}
      >
        <div style={{ color: statusConfig[status].color, fontSize: 20, fontWeight: 800 }}>{statusConfig[status].label}</div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Pyörän tiedot</div>
        <div style={{ color: '#f3f4f6', fontSize: 14, marginBottom: 4 }}>
          {(report.bike_make || '—')} {(report.bike_model || '')} · {report.bike_year || '—'}
        </div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Rekisteri: {report.bike_reg || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Km: {report.bike_km || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Väri: {report.bike_color || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>VIN: {report.bike_vin || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Polttoaine: {report.bike_fuel || '—'}</div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Asiakkaan tiedot</div>
        <div style={{ color: '#f3f4f6', fontSize: 14 }}>{report.customer_name || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>{report.customer_phone || '—'}</div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>{report.customer_email || '—'}</div>
        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
          {report.inspection_type || '—'} · {new Date(report.created_at).toLocaleString('fi-FI')}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Ajolähto</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Käynnistys: {readInspectionBoolean(inspectionData, 'startOk') ? '✅ OK' : '❌ Ongelma'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Vaihteet: {readInspectionBoolean(inspectionData, 'gearsOk') ? '✅ OK' : '❌ Ongelma'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Kytkin: {readInspectionBoolean(inspectionData, 'clutchOk') ? '✅ OK' : '❌ Ongelma'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Kaasu: {readInspectionBoolean(inspectionData, 'throttleOk') ? '✅ OK' : '❌ Ongelma'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Koeajo: {readInspectionBoolean(inspectionData, 'testDriven') ? '✅ Suoritettu' : '— Ei suoritettu'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'startNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Nesteet</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Öljy: {readInspectionText(inspectionData, 'oilLevel') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Jäähdytysneste: {readInspectionText(inspectionData, 'coolantLevel') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Jarruneste etu: {readInspectionText(inspectionData, 'brakeFrontLevel') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Jarruneste taka: {readInspectionText(inspectionData, 'brakeRearLevel') || '—'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'fluidNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Renkaat & paine</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Etu paine: {readInspectionText(inspectionData, 'tireFrontBar') || '—'} bar</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Taka paine: {readInspectionText(inspectionData, 'tireRearBar') || '—'} bar</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Etu urasyvyys: {readInspectionText(inspectionData, 'tireFrontMm') || '—'} mm</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Taka urasyvyys: {readInspectionText(inspectionData, 'tireRearMm') || '—'} mm</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'tireNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Jarrupalat</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Etu: {readInspectionText(inspectionData, 'brakePadFront') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Taka: {readInspectionText(inspectionData, 'brakePadRear') || '—'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'brakeNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Ketju & voitelu</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Kunto: {readInspectionText(inspectionData, 'chainCondition') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Voideltu: {readInspectionBoolean(inspectionData, 'chainLubed') ? 'Kyllä' : 'Ei'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'chainNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Mekaniikka</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Jouset etu: {readInspectionText(inspectionData, 'springsFront') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Jouset taka: {readInspectionText(inspectionData, 'springsRear') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Vaijerit & kaapelit: {readInspectionText(inspectionData, 'cables') || '—'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Akku: {readInspectionText(inspectionData, 'battery') || '—'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'mechanicsNotes') || '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Valot & sähköt</div>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Etuvalot: {readInspectionBoolean(inspectionData, 'lightFront') ? '✅ OK' : '❌ Ei toimi'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Takavalot: {readInspectionBoolean(inspectionData, 'lightRear') ? '✅ OK' : '❌ Ei toimi'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Vilkut: {readInspectionBoolean(inspectionData, 'indicators') ? '✅ OK' : '❌ Ei toimi'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Mittaristo: {readInspectionBoolean(inspectionData, 'dashboard') ? '✅ OK' : '❌ Huomio'}</div>
          <div style={{ color: '#e5e7eb', fontSize: 13 }}>Äänimerkki: {readInspectionBoolean(inspectionData, 'horn') ? '✅ OK' : '❌ Ei toimi'}</div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Huomiot: {readInspectionText(inspectionData, 'lightsNotes') || '—'}</div>
        </div>
      </div>

      {(report.photo_urls || []).length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-label">Kuvat</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(report.photo_urls || []).map((url, i) => (
              <div key={url + i} style={{ border: '1px solid #2d2d2d', borderRadius: 8, overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Raporttikuva" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                {(report.photo_captions || [])[i] && (
                  <div style={{ padding: '6px 8px', color: '#9ca3af', fontSize: 12 }}>{(report.photo_captions || [])[i]}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-label">Yhteenveto</div>
        <p style={{ color: '#e5e7eb', fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
          {report.overall_notes || 'Ei lisähuomioita'}
        </p>
        <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Tarkastaja: {report.inspector || 'MP-Logistiikka'}</p>
      </div>
    </>
  )
}
