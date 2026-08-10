import { listNasFolder } from '@/lib/nas/client'
import Link from 'next/link'
import NasUploadButton from '@/components/nas/NasUploadButton'
import NasDeleteButton from '@/components/nas/NasDeleteButton'

const CATEGORIES = [
  { label: 'Photo', path: '/Maison/Photo', icon: '📷' },
  { label: 'Film', path: '/Maison/film', icon: '🎬' },
  { label: 'Document', path: '/Maison/Document', icon: '📄' },
]

export default async function FilesPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>
}) {
  const { path } = await searchParams

  if (!path) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <h1 className="text-xl font-semibold sm:text-2xl">📁 Fichiers</h1>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.path}
              href={`/files?path=${encodeURIComponent(cat.path)}`}
              className="card flex flex-col items-center gap-2 p-4"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  let files: Awaited<ReturnType<typeof listNasFolder>> = []
  let error: string | null = null

  try {
    files = await listNasFolder(path)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Erreur inconnue'
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <Link href="/files" className="text-sm text-indigo-600">← Retour</Link>

      <div className="flex items-center justify-between gap-2">
        <h1 className="truncate text-xl font-semibold sm:text-2xl">{path}</h1>
        <NasUploadButton folderPath={path} />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-1">
        {files.map((f) => (
          <div key={f.path} className="card flex items-center gap-3 p-3">
            <span>{f.isdir ? '📁' : '📄'}</span>
            {f.isdir ? (
              <Link href={`/files?path=${encodeURIComponent(f.path)}`} className="flex-1">
                {f.name}
              </Link>
            ) : (
              <a href={`/api/nas/download?path=${encodeURIComponent(f.path)}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-indigo-600 hover:underline">
                {f.name}
              </a>
            )}
            {f.size !== undefined && <span className="text-xs text-gray-400">{Math.round(f.size / 1024)} Ko</span>}
            {!f.isdir && <NasDeleteButton filePath={f.path} />}
          </div>
        ))}
      </div>
    </div>
  )
}