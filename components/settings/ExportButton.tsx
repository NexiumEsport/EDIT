'use client'

import { useTransition } from 'react'
import { exportUserData } from '@/lib/actions/settings'

export default function ExportButton() {
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    startTransition(async () => {
      const json = await exportUserData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nexia-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <button
      onClick={handleExport}
      disabled={isPending}
      className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
    >
      {isPending ? 'Export en cours...' : 'Exporter mes données (JSON)'}
    </button>
  )
}