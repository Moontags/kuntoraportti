import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSupabaseAdminClient } from '@/lib/supabase'

type ReportRow = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  inspection_type: string | null
  bike_make: string | null
  bike_model: string | null
  bike_reg: string | null
  bike_km: string | null
  overall_status: 'ok' | 'warn' | 'bad' | null
  overall_notes: string | null
  inspector: string | null
  created_at: string
  photo_urls: string[] | null
}

function normalizePhoneForWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('358')) return digits
  if (digits.startsWith('0')) return `358${digits.slice(1)}`
  return digits
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const reportId = typeof body?.reportId === 'string' ? body.reportId : ''
    if (!reportId) {
      return NextResponse.json({ error: 'reportId puuttuu' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single<ReportRow>()

    if (error || !data) {
      return NextResponse.json({ error: 'Raporttia ei löytynyt' }, { status: 404 })
    }

    if (!data.customer_email) {
      return NextResponse.json({ error: 'Asiakkaan sähköposti puuttuu raportilta' }, { status: 400 })
    }

    const statusLabel: Record<string, string> = {
      ok: '✅ Ajokunnossa',
      warn: '⚠️ Huomioita',
      bad: '❌ Ei ajokunnossa',
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'posti.zoner.fi',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#111111;color:#f3f4f6">
    <div style="background:#0a0a0a;padding:24px;border-bottom:3px solid #f97316;text-align:center">
      <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px">Kuntoraportti (uudelleenlähetys)</h1>
      <p style="color:#6b7280;font-size:13px;margin:0">MP-Logistiikka · Moottoripyörän tarkastusraportti</p>
    </div>

    <div style="padding:20px 24px">
      <p style="margin:0 0 12px">Hei ${data.customer_name || 'asiakas'},</p>
      <p style="margin:0 0 14px">Kuntoraportti pyörälle ${data.bike_make || ''} ${data.bike_model || ''} (${data.bike_reg || '—'}) on lähetetty uudelleen.</p>
      <p style="margin:0 0 14px">Tarkastuksen tulos: <strong>${statusLabel[data.overall_status || 'warn']}</strong></p>
      <p style="margin:0 0 14px">Km-lukema: ${data.bike_km || '—'}</p>
      <p style="margin:0 0 14px">Tarkastaja: ${data.inspector || 'MP-Logistiikka'}</p>
      ${data.overall_notes ? `<p style="margin:0 0 14px">Huomiot: ${data.overall_notes.replace(/\n/g, '<br>')}</p>` : ''}
      ${(data.photo_urls || []).length > 0 ? `<p style="margin:0 0 14px">Kuvat:</p><ul>${(data.photo_urls || []).map((url) => `<li><a href="${url}" style="color:#f97316">${url}</a></li>`).join('')}</ul>` : ''}
    </div>

    <div style="background:#0a0a0a;padding:20px 24px;text-align:center;border-top:1px solid #1e1e1e">
      <p style="color:#6b7280;font-size:12px;margin:0">MP-Logistiikka · info@mplogistiikka.fi</p>
    </div>
  </div>
</body>
</html>`

    await transporter.sendMail({
      from: `"MP-Logistiikka Kuntoraportti" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customer_email,
      cc: process.env.SMTP_USER,
      subject: `Kuntoraportti (uudelleenlähetys) – ${data.bike_make || ''} ${data.bike_model || ''} (${data.bike_reg || ''})`,
      html,
    })

    const waText = encodeURIComponent(
      `Hei ${data.customer_name || 'asiakas'}! 👋\n\nKuntoraportti pyörällesi ${data.bike_make || ''} ${data.bike_model || ''} (${data.bike_reg || ''}) on lähetetty uudelleen sähköpostiin ${data.customer_email}.\n\n– MP-Logistiikka`
    )

    const waUrl = data.customer_phone
      ? `https://wa.me/${normalizePhoneForWhatsapp(data.customer_phone)}?text=${waText}`
      : ''

    return NextResponse.json({ success: true, waUrl })
  } catch (err) {
    console.error('Raportti resend API error:', err)
    return NextResponse.json({ error: 'Uudelleenlähetys epäonnistui' }, { status: 500 })
  }
}
