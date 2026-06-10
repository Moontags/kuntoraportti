import type { ReportRecord } from '@/components/ui/RaporttiNakyma'

// Kovakoodattu esimerkkiraportti julkista /esimerkki-sivua varten.
// Vastaa täsmälleen oikean raportin (Supabase `reports`) datarakennetta,
// jotta sama RaporttiNakyma-komponentti renderöi sen muutoksitta.
export const esimerkkiraportti: ReportRecord = {
  id: 'esimerkki',
  created_at: '2025-05-20T10:30:00Z',
  customer_name: 'Matti Meikäläinen',
  customer_phone: '+358 40 123 4567',
  customer_email: 'matti.meikalainen@example.com',
  inspection_type: 'Kuljetuksen vastaanottotarkastus',
  bike_make: 'KTM',
  bike_model: '890 Duke',
  bike_year: '2022',
  bike_color: 'Oranssi / musta',
  bike_reg: 'ABC-123',
  bike_vin: 'VBKKTM404NM123456',
  bike_km: '12 450',
  bike_fuel: '1/2 tankki',
  overall_status: 'warn',
  overall_notes:
    'Moottoripyörä vastaanotettu pääosin hyvässä kunnossa. Takarenkaan kuluminen ja tankin pintanaarmut dokumentoitu ennen kuljetusta. Ei vaikuta ajokuntoon, mutta suositellaan takarenkaan vaihtoa lähiaikoina.',
  inspector: 'MP-Logistiikka — Tarkastaja',
  inspection_data: {
    // Ajolähto
    startOk: true,
    gearsOk: true,
    clutchOk: true,
    throttleOk: true,
    testDriven: true,
    startNotes: 'Käynnistyi normaalisti, koeajo suoritettu n. 2 km.',
    // Nesteet
    oilLevel: 'OK',
    coolantLevel: 'OK',
    brakeFrontLevel: 'OK',
    brakeRearLevel: 'OK',
    fluidNotes: 'Kaikki nestetasot normaalit.',
    // Renkaat & paine
    tireFrontBar: '2.4',
    tireRearBar: '2.6',
    tireFrontMm: '4.5',
    tireRearMm: '2.0',
    tireNotes: 'Takarenkaan urasyvyys vähissä, suositellaan vaihtoa pian.',
    // Jarrupalat
    brakePadFront: 'Hyvä (~70%)',
    brakePadRear: 'Hyvä (~60%)',
    brakeNotes: 'Jarrut toimivat moitteettomasti.',
    // Ketju & voitelu
    chainCondition: 'Hyvä',
    chainLubed: true,
    chainNotes: 'Ketju kiristetty ja voideltu tarkastuksessa.',
    // Mekaniikka
    springsFront: 'OK',
    springsRear: 'OK',
    cables: 'OK',
    battery: 'OK (12.6 V)',
    mechanicsNotes: 'Ei havaittuja vikoja.',
    // Valot & sähköt
    lightFront: true,
    lightRear: true,
    indicators: true,
    dashboard: true,
    horn: true,
    lightsNotes: 'Kaikki valot ja sähköt toiminnassa.',
  },
  photo_urls: null,
  photo_captions: null,
}
