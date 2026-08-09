export default function Loading() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
      <div className="h-10 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="h-32 bg-gray-100 rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-16 animate-pulse bg-gray-100" />
        ))}
      </div>
    </div>
  );
}