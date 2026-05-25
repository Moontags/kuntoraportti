import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
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

    const inlineAttachments: { filename: string; content: Buffer; contentType: string; cid: string }[] = []
    let bgCid: string | null = null
    try {
      const bgPath = path.join(process.cwd(), 'public', 'images', 'bg_bike.jpg')
      const bgBuffer = readFileSync(bgPath)
      bgCid = 'bg-bike@kuntoraportti'
      inlineAttachments.push({
        filename: 'bg_bike.jpg',
        content: bgBuffer,
        contentType: 'image/jpeg',
        cid: bgCid,
      })
    } catch {
      // ohitetaan
    }

    const bgUrl = bgCid ? `cid:${bgCid}` : ''
    const bgAttr = bgUrl ? ` background="${bgUrl}"` : ''
    const bodyBg = bgUrl
      ? `background:#0a0a0a url('${bgUrl}') center center / cover no-repeat fixed`
      : 'background:#0a0a0a'
    const wrapperBg = bgUrl
      ? `background:#0a0a0a url('${bgUrl}') center center / cover no-repeat`
      : 'background:#0a0a0a'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;${bodyBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"${bgAttr} style="${wrapperBg}">
    <tr><td align="center" style="padding:0">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:rgba(10,10,10,0.78);color:#f3f4f6">
        <tr><td style="background:rgba(17,17,17,0.85);padding:24px;border-bottom:3px solid #f97316;text-align:center">
          <h1 style="color:#f3f4f6;font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-0.3px">Kuntoraportti (uudelleenlähetys)</h1>
          <p style="color:#9ca3af;font-size:13px;margin:0">MP-Logistiikka · Moottoripyörän tarkastusraportti</p>
        </td></tr>

        <tr><td style="padding:20px 24px;background:rgba(26,26,26,0.6);color:#e5e7eb;font-size:14px;line-height:1.6">
          <p style="margin:0 0 12px">Hei ${data.customer_name || 'asiakas'},</p>
          <p style="margin:0 0 14px">Kuntoraportti pyörälle ${data.bike_make || ''} ${data.bike_model || ''} (${data.bike_reg || '—'}) on lähetetty uudelleen.</p>
          <p style="margin:0 0 14px">Tarkastuksen tulos: <strong style="color:#f97316">${statusLabel[data.overall_status || 'warn']}</strong></p>
          <p style="margin:0 0 14px">Km-lukema: ${data.bike_km || '—'}</p>
          <p style="margin:0 0 14px">Tarkastaja: ${data.inspector || 'MP-Logistiikka'}</p>
          ${data.overall_notes ? `<p style="margin:0 0 14px">Huomiot: ${data.overall_notes.replace(/\n/g, '<br>')}</p>` : ''}
          ${(data.photo_urls || []).length > 0 ? `<p style="margin:0 0 14px">Kuvat:</p><ul style="margin:0;padding-left:20px">${(data.photo_urls || []).map((url) => `<li style="margin-bottom:4px"><a href="${url}" style="color:#f97316;word-break:break-all">${url}</a></li>`).join('')}</ul>` : ''}
        </td></tr>

        <tr><td style="background:rgba(17,17,17,0.85);padding:20px 24px;text-align:center;border-top:1px solid #1e1e1e">
          <p style="color:#9ca3af;font-size:12px;margin:0">MP-Logistiikka · info@mp-logistiikka.fi</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    await transporter.sendMail({
      from: `"MP-Logistiikka Kuntoraportti" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.customer_email,
      cc: process.env.SMTP_USER,
      subject: `Kuntoraportti (uudelleenlähetys) – ${data.bike_make || ''} ${data.bike_model || ''} (${data.bike_reg || ''})`,
      html,
      attachments: inlineAttachments,
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
