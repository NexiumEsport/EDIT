'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/lib/actions/settings'

export default function PasswordForm() {
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await changePassword(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Mot de passe mis à jour.' })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {message && (
        <p className={message.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-green-600'}>
          {message.text}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Nouveau mot de passe</label>
        <input
          type="password"
          name="new_password"
          minLength={6}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Confirmer le mot de passe</label>
        <input
          type="password"
          name="confirm_password"
          minLength={6}
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? 'Mise à jour...' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}