import { createNasFolder } from '@/lib/nas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { folderPath, folderName } = await req.json()

  if (typeof folderPath !== 'string' || typeof folderName !== 'string' || folderName.trim() === '') {
    return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
  }

  try {
    await createNasFolder(folderPath, folderName)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}