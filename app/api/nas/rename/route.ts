import { renameNasItem } from '@/lib/nas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { path, newName } = await req.json()

  if (typeof path !== 'string' || typeof newName !== 'string' || newName.trim() === '') {
    return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
  }

  try {
    await renameNasItem(path, newName)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}