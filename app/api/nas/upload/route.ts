import { uploadToNasFolder } from '@/lib/nas/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const folderPath = form.get('folderPath')
  const file = form.get('file')

  if (typeof folderPath !== 'string' || !(file instanceof File)) {
    return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
  }

  try {
    await uploadToNasFolder(folderPath, file)
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}