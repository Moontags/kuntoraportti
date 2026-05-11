import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import nodemailer from 'nodemailer'
import { getSupabaseAdminClient } from '@/lib/supabase'

type ReportPayload = {
  customerName: string
  customerPhone: string
  customerEmail: string
  inspectionType: string
  bikeMake: string
  bikeModel: string
  bikeYear: string
  bikeColor: string
  bikeReg: string
  bikeVin: string
  bikeKm: string
  bikeFuel: string
  startOk: boolean
  gearsOk: boolean
  clutchOk: boolean
  throttleOk: boolean
  testDriven: boolean
  startNotes: string
  oilLevel: string
  coolantLevel: string
  brakeFrontLevel: string
  brakeRearLevel: string
  fluidNotes: string
  tireFrontBar: string
  tireRearBar: string
  tireFrontMm: string
  tireRearMm: string
  tireNotes: string
  brakePadFront: string
  brakePadRear: string
  brakeNotes: string
  chainCondition: string
  chainLubed: boolean
  chainNotes: string
  springsFront: string
  springsRear: string
  cables: string
  battery: string
  mechanicsNotes: string
  lightFront: boolean
  lightRear: boolean
  indicators: boolean
  dashboard: boolean
  horn: boolean
  lightsNotes: string
  overallStatus: 'ok' | 'warn' | 'bad'
  overallNotes: string
  inspectorSignature: string
}

type PhotoInput = {
  file: File
  caption: string
  buffer: Buffer
  contentType: string
}

function normalizePhoneForWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('358')) return digits
  if (digits.startsWith('0')) return `358${digits.slice(1)}`
  return digits
}

function pickInspectionData(data: ReportPayload) {
  return {
    startOk: data.startOk,
    gearsOk: data.gearsOk,
    clutchOk: data.clutchOk,
    throttleOk: data.throttleOk,
    testDriven: data.testDriven,
    startNotes: data.startNotes,
    oilLevel: data.oilLevel,
    coolantLevel: data.coolantLevel,
    brakeFrontLevel: data.brakeFrontLevel,
    brakeRearLevel: data.brakeRearLevel,
    fluidNotes: data.fluidNotes,
    tireFrontBar: data.tireFrontBar,
    tireRearBar: data.tireRearBar,
    tireFrontMm: data.tireFrontMm,
    tireRearMm: data.tireRearMm,
    tireNotes: data.tireNotes,
    brakePadFront: data.brakePadFront,
    brakePadRear: data.brakePadRear,
    brakeNotes: data.brakeNotes,
    chainCondition: data.chainCondition,
    chainLubed: data.chainLubed,
    chainNotes: data.chainNotes,
    springsFront: data.springsFront,
    springsRear: data.springsRear,
    cables: data.cables,
    battery: data.battery,
    mechanicsNotes: data.mechanicsNotes,
    lightFront: data.lightFront,
    lightRear: data.lightRear,
    indicators: data.indicators,
    dashboard: data.dashboard,
    horn: data.horn,
    lightsNotes: data.lightsNotes,
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const raw = form.get('data')
    if (!raw) return NextResponse.json({ error: 'No data' }, { status: 400 })

    const data = JSON.parse(raw as string) as ReportPayload
    const photoCount = Number(form.get('photoCount') || 0)

    // Kerää kuvat liitteiksi
    const attachments: { filename: string; content: Buffer; contentType: string }[] = []
    const photos: PhotoInput[] = []
    for (let i = 0; i < photoCount; i++) {
      const file = form.get(`photo_${i}`) as File | null
      const caption = form.get(`caption_${i}`) as string || ''
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const ext = file.name.split('.').pop() || 'jpg'
        attachments.push({
          filename: caption ? `${caption}.${ext}` : `kuva_${i + 1}.${ext}`,
          content: buffer,
          contentType: file.type || 'image/jpeg',
        })
        photos.push({
          file,
          caption,
          buffer,
          contentType: file.type || 'image/jpeg',
        })
      }
    }

    // SMTP – Zoner
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'posti.zoner.fi',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const statusLabel: Record<string, string> = { ok: '✅ Ajokunnossa', warn: '⚠️ Huomioita', bad: '❌ Ei ajokunnossa' }
    const statusColor: Record<string, string> = { ok: '#4ade80', warn: '#fbbf24', bad: '#f87171' }
    const levelLabel: Record<string, string> = { ok: 'OK', low: 'Alhainen', added: 'Lisätty', worn: 'Kuluneet', check: 'Tarkista' }

    const row = (label: string, value: string, highlight = false) => {
      return `<tr>
        <td style="padding:8px 12px;color:#9ca3af;font-size:13px;width:45%;border-bottom:1px solid #2d2d2d">${label}</td>
        <td style="padding:8px 12px;color:${highlight ? '#f97316' : '#f3f4f6'};font-size:13px;font-weight:${highlight ? '700' : '400'};border-bottom:1px solid #2d2d2d">${value}</td>
      </tr>`
    }

    const section = (title: string, content: string) => {
      return `
        <tr><td colspan="2" style="padding:16px 12px 8px;background:#0f0f0f">
          <span style="color:#f97316;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">${title}</span>
        </td></tr>
        ${content}
      `
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#111111">

    <!-- Header -->
    <div style="background:#0a0a0a;padding:24px;border-bottom:3px solid #f97316;text-align:center">
      <div style="display:inline-block;background:#f97316;width:48px;height:48px;border-radius:12px;line-height:48px;font-size:24px;margin-bottom:12px">🏍️</div>
      <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px">Kuntoraportti</h1>
      <p style="color:#6b7280;font-size:13px;margin:0">MP-Logistiikka · Moottoripyörän tarkastusraportti</p>
    </div>

    <!-- Status banner -->
    <div style="background:${data.overallStatus === 'ok' ? '#14532d' : data.overallStatus === 'warn' ? '#78350f' : '#7f1d1d'};padding:16px 24px;text-align:center">
      <span style="color:${statusColor[data.overallStatus] || '#fff'};font-size:18px;font-weight:800">${statusLabel[data.overallStatus] || ''}</span>
    </div>

    <!-- Content -->
    <div style="padding:0">
      <table style="width:100%;border-collapse:collapse">

        ${section('Tarkastuksen tiedot', `
          ${row('Päivämäärä', new Date().toLocaleDateString('fi-FI', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }))}
          ${row('Tarkastaja', data.inspectorSignature || 'MP-Logistiikka')}
          ${row('Tyyppi', data.inspectionType === 'nouto' ? 'Noutotarkastus' : data.inspectionType === 'luovutus' ? 'Luovutustarkastus' : 'Nouto & Luovutus')}
        `)}

        ${section('Asiakkaan tiedot', `
          ${row('Nimi', data.customerName, true)}
          ${row('Puhelin', data.customerPhone)}
          ${row('Sähköposti', data.customerEmail)}
        `)}

        ${section('Ajoneuvon tiedot', `
          ${row('Merkki & malli', `${data.bikeMake} ${data.bikeModel}`, true)}
          ${row('Vuosimalli', data.bikeYear)}
          ${row('Väri', data.bikeColor || '—')}
          ${row('Rekisterinumero', data.bikeReg, true)}
          ${row('Km-lukema', `${Number(data.bikeKm).toLocaleString('fi-FI')} km`, true)}
          ${data.bikeVin ? row('VIN', data.bikeVin) : ''}
          ${row('Polttoaine', data.bikeFuel)}
        `)}

        ${section('Ajolähto tarkistus', `
          ${row('Käynnistys', data.startOk ? '✅ OK' : '❌ Ongelma')}
          ${row('Vaihteet', data.gearsOk ? '✅ OK' : '❌ Ongelma')}
          ${row('Kytkin', data.clutchOk ? '✅ OK' : '❌ Ongelma')}
          ${row('Kaasu', data.throttleOk ? '✅ OK' : '❌ Ongelma')}
          ${row('Koeajo', data.testDriven ? '✅ Suoritettu' : '— Ei suoritettu')}
          ${data.startNotes ? row('Huomiot', data.startNotes) : ''}
        `)}

        ${section('Nesteet', `
          ${row('Öljyn määrä', levelLabel[data.oilLevel] || data.oilLevel)}
          ${row('Jäähdytysneste', levelLabel[data.coolantLevel] || data.coolantLevel)}
          ${row('Jarruneste etu', levelLabel[data.brakeFrontLevel] || data.brakeFrontLevel)}
          ${row('Jarruneste taka', levelLabel[data.brakeRearLevel] || data.brakeRearLevel)}
          ${data.fluidNotes ? row('Huomiot', data.fluidNotes) : ''}
        `)}

        ${section('Renkaat & paine', `
          ${data.tireFrontBar ? row('Etu – paine', `${data.tireFrontBar} bar`) : ''}
          ${data.tireRearBar ? row('Taka – paine', `${data.tireRearBar} bar`) : ''}
          ${data.tireFrontMm ? row('Etu – urasyvyys', `${data.tireFrontMm} mm${Number(data.tireFrontMm) < 1.6 ? ' ⚠️' : ''}`) : ''}
          ${data.tireRearMm ? row('Taka – urasyvyys', `${data.tireRearMm} mm${Number(data.tireRearMm) < 1.6 ? ' ⚠️' : ''}`) : ''}
          ${data.tireNotes ? row('Huomiot', data.tireNotes) : ''}
        `)}

        ${section('Jarrupalat', `
          ${row('Jarrupalat etu', data.brakePadFront === 'ok' ? '✅ OK (>2mm)' : '⚠️ Kuluneet (<2mm)')}
          ${row('Jarrupalat taka', data.brakePadRear === 'ok' ? '✅ OK (>2mm)' : '⚠️ Kuluneet (<2mm)')}
          ${data.brakeNotes ? row('Huomiot', data.brakeNotes) : ''}
        `)}

        ${section('Ketju & voitelu', `
          ${row('Ketjun kunto', data.chainCondition === 'ok' ? '✅ OK' : '⚠️ Kuluneet')}
          ${row('Ketju voideltu', data.chainLubed ? '✅ Kyllä' : '— Ei')}
          ${data.chainNotes ? row('Huomiot', data.chainNotes) : ''}
        `)}

        ${section('Mekaniikka', `
          ${row('Jouset etu', data.springsFront === 'ok' ? '✅ OK' : '⚠️ Tarkista')}
          ${row('Jouset taka', data.springsRear === 'ok' ? '✅ OK' : '⚠️ Tarkista')}
          ${row('Vaijerit & kaapelit', data.cables === 'ok' ? '✅ OK' : '⚠️ Tarkista')}
          ${row('Akku', data.battery === 'ok' ? '✅ OK' : '⚠️ Heikko')}
          ${data.mechanicsNotes ? row('Huomiot', data.mechanicsNotes) : ''}
        `)}

        ${section('Valot & sähköt', `
          ${row('Etuvalot', data.lightFront ? '✅ OK' : '❌ Ei toimi')}
          ${row('Takavalot', data.lightRear ? '✅ OK' : '❌ Ei toimi')}
          ${row('Vilkut', data.indicators ? '✅ OK' : '❌ Ei toimi')}
          ${row('Mittaristo', data.dashboard ? '✅ OK' : '❌ Vikavalo palaa')}
          ${row('Äänimerkki', data.horn ? '✅ OK' : '❌ Ei toimi')}
          ${data.lightsNotes ? row('Huomiot', data.lightsNotes) : ''}
        `)}

        ${data.overallNotes ? section('Yhteenveto & lisätiedot', `
          <tr><td colspan="2" style="padding:12px;color:#e5e7eb;font-size:14px;line-height:1.6;border-bottom:1px solid #2d2d2d">${data.overallNotes.replace(/\n/g, '<br>')}</td></tr>
        `) : ''}

        ${attachments.length > 0 ? section('Kuvat', `
          <tr><td colspan="2" style="padding:8px 12px;color:#9ca3af;font-size:13px;border-bottom:1px solid #2d2d2d">
            Raporttiin liitetty ${attachments.length} kuva${attachments.length > 1 ? 'a' : ''} (katso liitteet)
          </td></tr>
        `) : ''}

      </table>
    </div>

    <!-- Footer -->
    <div style="background:#0a0a0a;padding:20px 24px;text-align:center;border-top:1px solid #1e1e1e">
      <p style="color:#6b7280;font-size:12px;margin:0 0 4px">MP-Logistiikka · Moottoripyörän kuntotarkastus</p>
      <p style="color:#374151;font-size:11px;margin:0">info@mplogistiikka.fi · mp-logistiikka.fi</p>
    </div>

  </div>
</body>
</html>`

    // Lähetä asiakkaalle
    await transporter.sendMail({
      from: `"MP-Logistiikka Kuntoraportti" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customerEmail,
      cc: process.env.SMTP_USER, // kopio omaan sähköpostiin
      subject: `Kuntoraportti – ${data.bikeMake} ${data.bikeModel} (${data.bikeReg}) ${new Date().toLocaleDateString('fi-FI')}`,
      html,
      attachments,
    })

    const supabase = getSupabaseAdminClient()
    const bucket = 'raportti-kuvat'

    // Varmista bucket olemassaolo kehitysympäristössä.
    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some((b) => b.name === bucket)
    if (!exists) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucket, { public: true })
      if (createBucketError) throw createBucketError
    }

    const photoUrls: string[] = []
    const photoCaptions: string[] = []
    const safeReg = (data.bikeReg || 'ilman-rek').replace(/[^A-Za-z0-9_-]/g, '-')
    const basePath = `${new Date().toISOString().slice(0, 10)}/${safeReg}`

    for (const photo of photos) {
      const originalExt = photo.file.name.includes('.') ? photo.file.name.split('.').pop() : 'jpg'
      const fileName = `${randomUUID()}.${originalExt || 'jpg'}`
      const path = `${basePath}/${fileName}`

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, photo.buffer, {
        contentType: photo.contentType,
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
      photoUrls.push(publicData.publicUrl)
      photoCaptions.push(photo.caption || '')
    }

    const { data: insertData, error: insertError } = await supabase
      .from('reports')
      .insert({
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail,
        inspection_type: data.inspectionType,
        bike_make: data.bikeMake,
        bike_model: data.bikeModel,
        bike_year: data.bikeYear,
        bike_color: data.bikeColor,
        bike_reg: data.bikeReg,
        bike_vin: data.bikeVin,
        bike_km: data.bikeKm,
        bike_fuel: data.bikeFuel,
        inspection_data: pickInspectionData(data),
        overall_status: data.overallStatus,
        overall_notes: data.overallNotes,
        inspector: data.inspectorSignature,
        photo_urls: photoUrls,
        photo_captions: photoCaptions,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    // WhatsApp-viesti (linkki – ei suora lähetys, avataan selaimessa)
    const waText = encodeURIComponent(
      `Hei ${data.customerName}! 👋\n\nKuntoraportti moottoripyörällesi ${data.bikeMake} ${data.bikeModel} (${data.bikeReg}) on valmis.\n\nTarkastuksen tulos: ${statusLabel[data.overallStatus]}\n\nRaportti on lähetetty sähköpostiisi: ${data.customerEmail}\n\n– MP-Logistiikka`
    )
    const waUrl = `https://wa.me/${normalizePhoneForWhatsapp(data.customerPhone)}?text=${waText}`

    return NextResponse.json({ success: true, reportId: insertData.id, waUrl })

  } catch (err: unknown) {
    console.error('Raportti API error:', err)

    const errorWithCode = err as { code?: string }
    let message = 'Lähetys epäonnistui'
    if (errorWithCode?.code === 'EAUTH') {
      message = 'SMTP-kirjautuminen epäonnistui. Tarkista SMTP_USER ja SMTP_PASS.'
    } else if (errorWithCode?.code === 'ESOCKET') {
      message = 'SMTP-yhteys epäonnistui. Tarkista SMTP_HOST, SMTP_PORT ja SMTP_SECURE.'
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
