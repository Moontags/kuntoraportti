'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'

// ─── Types ───────────────────────────────────────────────
type Status3 = 'ok' | 'low' | 'added'
type Status2 = 'ok' | 'worn'
type StatusOk = 'ok' | 'check'
type FuelType = 'bensiini' | 'sähkö' | 'diesel' | 'muu'
type InspectionType = 'nouto' | 'luovutus' | 'molemmat'
type OverallStatus = 'ok' | 'warn' | 'bad'

interface PhotoItem {
  id: string
  file: File
  preview: string
  caption: string
}

interface FormData {
  customerName: string
  customerPhone: string
  customerEmail: string
  inspectionType: InspectionType
  bikeMake: string
  bikeModel: string
  bikeYear: string
  bikeColor: string
  bikeReg: string
  bikeVin: string
  bikeKm: string
  bikeFuel: FuelType
  startOk: boolean
  gearsOk: boolean
  clutchOk: boolean
  throttleOk: boolean
  testDriven: boolean
  startNotes: string
  oilLevel: Status3
  coolantLevel: Status3
  brakeFrontLevel: Status2
  brakeRearLevel: Status2
  fluidNotes: string
  tireFrontBar: string
  tireRearBar: string
  tireFrontMm: string
  tireRearMm: string
  tireNotes: string
  brakePadFront: Status2
  brakePadRear: Status2
  brakeNotes: string
  chainCondition: Status2
  chainLubed: boolean
  chainNotes: string
  springsFront: StatusOk
  springsRear: StatusOk
  cables: StatusOk
  battery: StatusOk
  mechanicsNotes: string
  lightFront: boolean
  lightRear: boolean
  indicators: boolean
  dashboard: boolean
  horn: boolean
  lightsNotes: string
  overallStatus: OverallStatus
  overallNotes: string
  inspectorSignature: string
}

const EMPTY: FormData = {
  customerName: '', customerPhone: '', customerEmail: '',
  inspectionType: 'molemmat',
  bikeMake: '', bikeModel: '', bikeYear: '', bikeColor: '',
  bikeReg: '', bikeVin: '', bikeKm: '', bikeFuel: 'bensiini',
  startOk: true, gearsOk: true, clutchOk: true, throttleOk: true, testDriven: false, startNotes: '',
  oilLevel: 'ok', coolantLevel: 'ok', brakeFrontLevel: 'ok', brakeRearLevel: 'ok', fluidNotes: '',
  tireFrontBar: '', tireRearBar: '', tireFrontMm: '', tireRearMm: '', tireNotes: '',
  brakePadFront: 'ok', brakePadRear: 'ok', brakeNotes: '',
  chainCondition: 'ok', chainLubed: true, chainNotes: '',
  springsFront: 'ok', springsRear: 'ok', cables: 'ok', battery: 'ok', mechanicsNotes: '',
  lightFront: true, lightRear: true, indicators: true, dashboard: true, horn: true, lightsNotes: '',
  overallStatus: 'ok', overallNotes: '', inspectorSignature: 'MP-Logistiikka',
}

const STEPS = ['Asiakas', 'Pyörä', 'Tarkastus', 'Kuvat & Arvio']

// ─── Step bar ─────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div style={{ padding: '14px 16px 0', background: '#0a0a0a' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? '#f97316' : active ? 'rgba(249,115,22,0.2)' : '#1a1a1a',
                  border: `2px solid ${done || active ? '#f97316' : '#2d2d2d'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: done ? '#fff' : active ? '#f97316' : '#4b5563', flexShrink: 0,
                }}>
                  {done
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : i + 1}
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: active ? '#f97316' : done ? '#9ca3af' : '#4b5563', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 4px', background: done ? '#f97316' : '#2d2d2d', marginBottom: 16 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#f97316', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

function ToggleGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
          flex: 1, padding: '10px 6px', borderRadius: 8,
          border: `1px solid ${value === o.value ? '#f97316' : '#2d2d2d'}`,
          background: value === o.value ? 'rgba(249,115,22,0.15)' : '#1a1a1a',
          color: value === o.value ? '#f97316' : '#6b7280',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}>{o.label}</button>
      ))}
    </div>
  )
}

function CheckRow({ label, checked, onChange, note }: { label: string; checked: boolean; onChange: (v: boolean) => void; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
      <div>
        <span style={{ color: '#e5e7eb', fontSize: 14 }}>{label}</span>
        {note && <span style={{ color: '#6b7280', fontSize: 11, display: 'block' }}>{note}</span>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} style={{
        width: 44, height: 26, borderRadius: 13,
        background: checked ? '#f97316' : '#2d2d2d',
        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: checked ? 21 : 3, transition: 'left 0.2s' }} />
      </button>
    </div>
  )
}

function SectionHeader({ icon, title, allOk }: { icon: string; title: string; allOk: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 700 }}>{title}</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: allOk ? '#14532d' : '#78350f', color: allOk ? '#4ade80' : '#fbbf24' }}>
        {allOk ? 'OK' : 'Huomio'}
      </span>
    </div>
  )
}

// ─── Step 1 ───────────────────────────────────────────────
function Step1({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string) => void }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#f3f4f6', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Asiakkaan tiedot</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Syötä asiakkaan yhteystiedot</p>
      </div>
      <Field label="Asiakkaan nimi" required>
        <input type="text" value={data.customerName} onChange={e => onChange('customerName', e.target.value)} placeholder="Etunimi Sukunimi" />
      </Field>
      <Field label="Puhelinnumero" required>
        <input type="tel" value={data.customerPhone} onChange={e => onChange('customerPhone', e.target.value)} placeholder="050 123 4567" inputMode="tel" />
      </Field>
      <Field label="Sähköposti" required>
        <input type="email" value={data.customerEmail} onChange={e => onChange('customerEmail', e.target.value)} placeholder="asiakas@email.fi" inputMode="email" />
        <p style={{ color: '#6b7280', fontSize: 11, margin: '5px 0 0' }}>PDF-raportti lähetetään tähän osoitteeseen</p>
      </Field>
      <Field label="Tarkastuksen tyyppi" required>
        <ToggleGroup
          options={[{ value: 'nouto', label: 'Nouto' }, { value: 'luovutus', label: 'Luovutus' }, { value: 'molemmat', label: 'Molemmat' }]}
          value={data.inspectionType} onChange={v => onChange('inspectionType', v)}
        />
      </Field>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────
function Step2({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string) => void }) {
  const makes = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Ducati', 'KTM', 'Harley-Davidson', 'Triumph', 'Royal Enfield', 'Muu']
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#f3f4f6', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Ajoneuvon tiedot</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Moottoripyörän perustiedot</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Merkki" required>
            <select value={data.bikeMake} onChange={e => onChange('bikeMake', e.target.value)}>
              <option value="">Valitse merkki</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Malli" required>
            <input type="text" value={data.bikeModel} onChange={e => onChange('bikeModel', e.target.value)} placeholder="esim. CB650R, MT-07" />
          </Field>
        </div>
        <Field label="Vuosimalli" required>
          <input type="number" value={data.bikeYear} onChange={e => onChange('bikeYear', e.target.value)} placeholder="2020" inputMode="numeric" />
        </Field>
        <Field label="Väri">
          <input type="text" value={data.bikeColor} onChange={e => onChange('bikeColor', e.target.value)} placeholder="Musta" />
        </Field>
        <Field label="Rekisterinumero" required>
          <input type="text" value={data.bikeReg} onChange={e => onChange('bikeReg', e.target.value.toUpperCase())} placeholder="ABC-123" style={{ textTransform: 'uppercase' }} />
        </Field>
        <Field label="Km-lukema" required>
          <input type="number" value={data.bikeKm} onChange={e => onChange('bikeKm', e.target.value)} placeholder="14230" inputMode="numeric" />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="VIN / Runkonumero">
            <input type="text" value={data.bikeVin} onChange={e => onChange('bikeVin', e.target.value.toUpperCase())} placeholder="17-merkkinen tunnus" style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Polttoaine">
            <ToggleGroup
              options={[{ value: 'bensiini', label: 'Bensiini' }, { value: 'sähkö', label: 'Sähkö' }, { value: 'diesel', label: 'Diesel' }, { value: 'muu', label: 'Muu' }]}
              value={data.bikeFuel} onChange={v => onChange('bikeFuel', v)}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────
function Step3({ data, onChange, onBool }: { data: FormData; onChange: (k: keyof FormData, v: string) => void; onBool: (k: keyof FormData, v: boolean) => void }) {
  const startAllOk = data.startOk && data.gearsOk && data.clutchOk && data.throttleOk
  const fluidAllOk = data.oilLevel === 'ok' && data.coolantLevel === 'ok' && data.brakeFrontLevel === 'ok' && data.brakeRearLevel === 'ok'
  const tireAllOk = Number(data.tireFrontMm || 99) >= 1.6 && Number(data.tireRearMm || 99) >= 1.6
  const brakeAllOk = data.brakePadFront === 'ok' && data.brakePadRear === 'ok'
  const chainAllOk = data.chainCondition === 'ok'
  const mechanicsAllOk = data.springsFront === 'ok' && data.springsRear === 'ok' && data.cables === 'ok' && data.battery === 'ok'
  const lightsAllOk = data.lightFront && data.lightRear && data.indicators && data.dashboard && data.horn

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#f3f4f6', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Tarkastuspisteet</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Täytä kaikki tarkastuskohdat</p>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="🚦" title="Ajolähto tarkistus" allOk={startAllOk} />
        <CheckRow label="Käynnistys" checked={data.startOk} onChange={v => onBool('startOk', v)} />
        <CheckRow label="Vaihteet" checked={data.gearsOk} onChange={v => onBool('gearsOk', v)} />
        <CheckRow label="Kytkin" checked={data.clutchOk} onChange={v => onBool('clutchOk', v)} />
        <CheckRow label="Kaasu" checked={data.throttleOk} onChange={v => onBool('throttleOk', v)} note="Ei jumiudu" />
        <CheckRow label="Koeajo suoritettu" checked={data.testDriven} onChange={v => onBool('testDriven', v)} />
        <div style={{ marginTop: 10 }}>
          <textarea value={data.startNotes} onChange={e => onChange('startNotes', e.target.value)} placeholder="Lisätiedot..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="🛢️" title="Nesteet" allOk={fluidAllOk} />
        <Field label="Öljyn määrä"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'low', label: 'Alhainen' }, { value: 'added', label: 'Lisätty' }]} value={data.oilLevel} onChange={v => onChange('oilLevel', v)} /></Field>
        <Field label="Jäähdytysneste"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'low', label: 'Alhainen' }, { value: 'added', label: 'Lisätty' }]} value={data.coolantLevel} onChange={v => onChange('coolantLevel', v)} /></Field>
        <Field label="Jarruneste etu"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'low', label: 'Alhainen' }]} value={data.brakeFrontLevel} onChange={v => onChange('brakeFrontLevel', v)} /></Field>
        <Field label="Jarruneste taka"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'low', label: 'Alhainen' }]} value={data.brakeRearLevel} onChange={v => onChange('brakeRearLevel', v)} /></Field>
        <textarea value={data.fluidNotes} onChange={e => onChange('fluidNotes', e.target.value)} placeholder="Lisätiedot nesteistä..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="⭕" title="Renkaat & paine" allOk={tireAllOk} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Etu – paine (bar)"><input type="number" value={data.tireFrontBar} onChange={e => onChange('tireFrontBar', e.target.value)} placeholder="2.2" step="0.1" inputMode="decimal" /></Field>
          <Field label="Taka – paine (bar)"><input type="number" value={data.tireRearBar} onChange={e => onChange('tireRearBar', e.target.value)} placeholder="2.5" step="0.1" inputMode="decimal" /></Field>
          <Field label="Etu – ura (mm)"><input type="number" value={data.tireFrontMm} onChange={e => onChange('tireFrontMm', e.target.value)} placeholder="3.5" step="0.5" inputMode="decimal" /></Field>
          <Field label="Taka – ura (mm)"><input type="number" value={data.tireRearMm} onChange={e => onChange('tireRearMm', e.target.value)} placeholder="3.0" step="0.5" inputMode="decimal" /></Field>
        </div>
        {(Number(data.tireFrontMm) < 1.6 || Number(data.tireRearMm) < 1.6) && (data.tireFrontMm || data.tireRearMm) && (
          <div style={{ background: 'rgba(127,29,29,0.3)', border: '1px solid #7f1d1d', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
            <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>⚠️ Urasyvyys alle 1.6mm – vaihto suositeltava</span>
          </div>
        )}
        <textarea value={data.tireNotes} onChange={e => onChange('tireNotes', e.target.value)} placeholder="Lisätiedot renkaista..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="🔴" title="Jarrupalat" allOk={brakeAllOk} />
        <Field label="Jarrupalat etu"><ToggleGroup options={[{ value: 'ok', label: 'OK (>2mm)' }, { value: 'worn', label: 'Kuluneet (<2mm)' }]} value={data.brakePadFront} onChange={v => onChange('brakePadFront', v)} /></Field>
        <Field label="Jarrupalat taka"><ToggleGroup options={[{ value: 'ok', label: 'OK (>2mm)' }, { value: 'worn', label: 'Kuluneet (<2mm)' }]} value={data.brakePadRear} onChange={v => onChange('brakePadRear', v)} /></Field>
        <textarea value={data.brakeNotes} onChange={e => onChange('brakeNotes', e.target.value)} placeholder="Lisätiedot jarruista..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="⛓️" title="Ketju & voitelu" allOk={chainAllOk} />
        <Field label="Ketjun kunto"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'worn', label: 'Kuluneet' }]} value={data.chainCondition} onChange={v => onChange('chainCondition', v)} /></Field>
        <CheckRow label="Ketju voideltu" checked={data.chainLubed} onChange={v => onBool('chainLubed', v)} />
        <div style={{ marginTop: 10 }}>
          <textarea value={data.chainNotes} onChange={e => onChange('chainNotes', e.target.value)} placeholder="Lisätiedot ketjusta..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="🔧" title="Mekaniikka" allOk={mechanicsAllOk} />
        <Field label="Jouset etu"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'check', label: 'Tarkista' }]} value={data.springsFront} onChange={v => onChange('springsFront', v)} /></Field>
        <Field label="Jouset taka"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'check', label: 'Tarkista' }]} value={data.springsRear} onChange={v => onChange('springsRear', v)} /></Field>
        <Field label="Vaijerit & kaapelit"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'check', label: 'Tarkista' }]} value={data.cables} onChange={v => onChange('cables', v)} /></Field>
        <Field label="Akku"><ToggleGroup options={[{ value: 'ok', label: 'OK' }, { value: 'check', label: 'Heikko' }]} value={data.battery} onChange={v => onChange('battery', v)} /></Field>
        <textarea value={data.mechanicsNotes} onChange={e => onChange('mechanicsNotes', e.target.value)} placeholder="Lisätiedot mekaniikasta..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <SectionHeader icon="💡" title="Valot & sähköt" allOk={lightsAllOk} />
        <CheckRow label="Etuvalot" checked={data.lightFront} onChange={v => onBool('lightFront', v)} />
        <CheckRow label="Takavalot" checked={data.lightRear} onChange={v => onBool('lightRear', v)} />
        <CheckRow label="Vilkut" checked={data.indicators} onChange={v => onBool('indicators', v)} />
        <CheckRow label="Mittaristo" checked={data.dashboard} onChange={v => onBool('dashboard', v)} note="Ei vikavalon palaa" />
        <CheckRow label="Äänimerkki" checked={data.horn} onChange={v => onBool('horn', v)} />
        <div style={{ marginTop: 10 }}>
          <textarea value={data.lightsNotes} onChange={e => onChange('lightsNotes', e.target.value)} placeholder="Lisätiedot valoista..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Kuvat & Arvio ────────────────────────────────
function Step4({ data, onChange, photos, setPhotos }: {
  data: FormData
  onChange: (k: keyof FormData, v: string) => void
  photos: PhotoItem[]
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const remaining = 10 - photos.length
    const toAdd = Array.from(files).slice(0, remaining)
    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setPhotos(prev => [...prev, {
          id: Math.random().toString(36).slice(2),
          file,
          preview: e.target?.result as string,
          caption: '',
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  function updateCaption(id: string, caption: string) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p))
  }

  const statusOptions: { value: OverallStatus; label: string; color: string; bg: string; desc: string }[] = [
    { value: 'ok', label: '✅ Ajokunnossa', color: '#4ade80', bg: '#14532d', desc: 'Ei huomioita' },
    { value: 'warn', label: '⚠️ Huomioita', color: '#fbbf24', bg: '#78350f', desc: 'Korjattavaa, mutta ajettavissa' },
    { value: 'bad', label: '❌ Ei ajokunnossa', color: '#f87171', bg: '#7f1d1d', desc: 'Vaatii välittömän huollon' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#f3f4f6', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>Kuvat & Kokonaisarvio</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Lisää kuvat ja anna lopullinen arvio</p>
      </div>

      {/* Photo upload */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 700 }}>📸 Kuvat</span>
          <span style={{ color: '#6b7280', fontSize: 12 }}>{photos.length}/10</span>
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2d2d' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => removePhoto(photo.id)} style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  color: '#fff', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
                <input
                  type="text"
                  value={photo.caption}
                  onChange={e => updateCaption(photo.id, e.target.value)}
                  placeholder="Kuvateksti..."
                  style={{ borderRadius: 0, border: 'none', borderTop: '1px solid #2d2d2d', fontSize: 12, padding: '6px 8px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {photos.length < 10 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={e => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{
              width: '100%', padding: '16px', borderRadius: 10,
              border: '2px dashed #2d2d2d', background: 'transparent',
              color: '#6b7280', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {photos.length === 0 ? 'Lisää kuvia (max 10)' : `Lisää lisää kuvia (${10 - photos.length} jäljellä)`}
            </button>
          </>
        )}
      </div>

      {/* Overall status */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ color: '#f3f4f6', fontSize: 15, fontWeight: 700 }}>🏁 Kokonaisarvio</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {statusOptions.map(opt => (
            <button key={opt.value} type="button" onClick={() => onChange('overallStatus', opt.value)} style={{
              padding: '12px 14px', borderRadius: 10,
              border: `2px solid ${data.overallStatus === opt.value ? opt.color : '#2d2d2d'}`,
              background: data.overallStatus === opt.value ? `${opt.bg}` : '#1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: data.overallStatus === opt.value ? opt.color : '#e5e7eb', fontSize: 14, fontWeight: 700 }}>{opt.label}</div>
                <div style={{ color: '#6b7280', fontSize: 11 }}>{opt.desc}</div>
              </div>
              {data.overallStatus === opt.value && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={opt.color} strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        <Field label="Yhteenveto & lisätiedot">
          <textarea
            value={data.overallNotes}
            onChange={e => onChange('overallNotes', e.target.value)}
            placeholder="Kirjoita yhteenveto tarkastuksesta, suositukset ja mahdolliset huomiot..."
            rows={4} style={{ resize: 'none', fontSize: 13 }}
          />
        </Field>

        <Field label="Tarkastaja">
          <input type="text" value={data.inspectorSignature} onChange={e => onChange('inspectorSignature', e.target.value)} placeholder="MP-Logistiikka" />
        </Field>
      </div>

      {/* Summary preview */}
      <div className="card" style={{ marginBottom: 12, background: '#0f0f0f' }}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Yhteenveto</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
          {[
            { label: 'Asiakas', value: data.customerName || '—' },
            { label: 'Rekisteri', value: data.bikeReg || '—' },
            { label: 'Pyörä', value: data.bikeMake && data.bikeModel ? `${data.bikeMake} ${data.bikeModel}` : '—' },
            { label: 'Km-lukema', value: data.bikeKm ? `${Number(data.bikeKm).toLocaleString('fi-FI')} km` : '—' },
            { label: 'Sähköposti', value: data.customerEmail || '—' },
            { label: 'Kuvat', value: `${photos.length} kpl` },
          ].map(item => (
            <div key={item.label}>
              <div style={{ color: '#4b5563', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', marginBottom: 1 }}>{item.label}</div>
              <div style={{ color: '#e5e7eb', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────
export default function UusiRaporttiPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(EMPTY)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [waUrl, setWaUrl] = useState('')
  const [reportId, setReportId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('kr_auth')) {
      router.replace('/login')
    }
  }, [router])

  function handleChange(key: keyof FormData, value: string) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function handleBool(key: keyof FormData, value: boolean) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function canNext() {
    if (step === 0) return !!(data.customerName && data.customerPhone && data.customerEmail)
    if (step === 1) return !!(data.bikeMake && data.bikeModel && data.bikeYear && data.bikeReg && data.bikeKm)
    return true
  }

  async function handleSubmit() {
    setSending(true)
    setError('')
    try {
      const formPayload = new FormData()
      formPayload.append('data', JSON.stringify(data))
      photos.forEach((p, i) => {
        formPayload.append(`photo_${i}`, p.file)
        formPayload.append(`caption_${i}`, p.caption)
      })
      formPayload.append('photoCount', String(photos.length))

      const res = await fetch('/api/raportti', { method: 'POST', body: formPayload })
      if (!res.ok) {
        let message = 'Raportin lähetys epäonnistui. Tarkista yhteys ja yritä uudelleen.'
        try {
          const payload = await res.json()
          if (payload?.error && typeof payload.error === 'string') message = payload.error
        } catch {
          // Keep fallback message if response body is not JSON.
        }
        throw new Error(message)
      }

      const payload = await res.json()
      if (typeof payload?.waUrl === 'string') setWaUrl(payload.waUrl)
      if (typeof payload?.reportId === 'string') setReportId(payload.reportId)
      setSent(true)
    } catch (e) {
      const message = e instanceof Error
        ? e.message
        : 'Raportin lähetys epäonnistui. Tarkista yhteys ja yritä uudelleen.'
      setError(message)
    } finally {
      setSending(false)
    }
  }

  // Success screen
  if (sent) {
    return (
      <>
        <Header title="Raportti lähetetty" backHref="/dashboard" />
        <main style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: '#14532d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ color: '#f3f4f6', fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Raportti lähetetty!</h2>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 8px' }}>
            PDF-raportti on lähetetty sähköpostiin:
          </p>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, margin: '0 0 32px' }}>{data.customerEmail}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 20l1.5-5.5A8.8 8.8 0 1 1 20 9.5 8.8 8.8 0 0 1 7.8 18z"/>
                </svg>
                Lähetä WhatsApp-viesti
              </button>
            )}
            <button onClick={() => { setSent(false); setData(EMPTY); setPhotos([]); setStep(0); setWaUrl(''); setReportId('') }} className="btn-primary">
              Uusi raportti
            </button>
            <button onClick={() => router.push('/dashboard')} className="btn-secondary">
              Takaisin etusivulle
            </button>
          </div>
          {reportId && (
            <p style={{ color: '#6b7280', fontSize: 11, marginTop: 12 }}>Raportti-ID: {reportId}</p>
          )}
        </main>
      </>
    )
  }

  return (
    <>
      <Header title="Uusi raportti" backHref="/dashboard" />
      <StepBar current={step} />

      <main style={{ padding: '20px 16px' }}>
        {step === 0 && <Step1 data={data} onChange={handleChange} />}
        {step === 1 && <Step2 data={data} onChange={handleChange} />}
        {step === 2 && <Step3 data={data} onChange={handleChange} onBool={handleBool} />}
        {step === 3 && <Step4 data={data} onChange={handleChange} photos={photos} setPhotos={setPhotos} />}
      </main>

      {/* Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, padding: '12px 16px',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
        background: '#111', borderTop: '1px solid #2d2d2d',
        display: 'flex', gap: 10, zIndex: 100,
      }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Takaisin
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => canNext() && setStep(s => s + 1)} className="btn-primary"
            style={{ flex: 2, opacity: canNext() ? 1 : 0.4 }} disabled={!canNext()}>
            Seuraava
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary"
            style={{ flex: 2, opacity: sending ? 0.7 : 1 }} disabled={sending}>
            {sending ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Lähetetään...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Lähetä raportti
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: 448,
          background: 'rgba(127,29,29,0.95)', border: '1px solid #7f1d1d',
          borderRadius: 10, padding: '12px 16px', zIndex: 200,
          color: '#f87171', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ height: 80 }} />
    </>
  )
}
