import { getNasSession } from '@/lib/nas/client'
import { NextRequest, NextResponse } from 'next/server'

const NAS_URL = process.env.NAS_URL!

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path')

  if (!filePath) {
    return NextResponse.json({ error: 'Parametre path manquant' }, { status: 400 })
  }

  try {
    const sid = await getNasSession()
    const url = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(filePath)}&mode=open&_sid=${sid}`

    const nasRes = await fetch(url)

    if (!nasRes.ok || !nasRes.body) {
      return NextResponse.json({ error: 'Echec telechargement depuis le NAS' }, { status: 502 })
    }

    const contentType = nasRes.headers.get('content-type') ?? 'application/octet-stream'
    const fileName = filePath.split('/').pop() ?? 'fichier'

    return new NextResponse(nasRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}