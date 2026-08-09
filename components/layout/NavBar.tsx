'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

export default function NavBar() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
        {isDashboard ? (
          <span className="font-[var(--font-display)] text-lg font-semibold">EDIT</span>
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          >
            ← Accueil
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className="btn-danger text-sm">
            Déconnexion
          </button>
        </form>
      </div>
    </nav>
  )
}