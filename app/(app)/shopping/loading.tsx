export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="h-7 w-40 animate-pulse rounded bg-[var(--color-border)]" />
      <div className="card mt-6 h-16 animate-pulse p-4" />
      <div className="mt-4 space-y-2">
        <div className="card h-12 animate-pulse" />
        <div className="card h-12 animate-pulse" />
        <div className="card h-12 animate-pulse" />
      </div>
    </div>
  )
}