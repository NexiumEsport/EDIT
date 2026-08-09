export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-32 animate-pulse bg-gray-100" />
        ))}
      </div>
    </div>
  );
}