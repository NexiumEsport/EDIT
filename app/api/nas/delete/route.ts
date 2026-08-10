import { deleteFromNasFolder } from '@/lib/nas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { filePath } = await req.json()

  if (typeof filePath !== 'string') {
    return NextResponse.json({ error: 'Parametre filePath manquant' }, { status: 400 })
  }

  try {
    await deleteFromNasFolder(filePath)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}