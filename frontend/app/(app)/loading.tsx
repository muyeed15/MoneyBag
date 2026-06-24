export default function Loading(): React.ReactElement {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-5xl mx-auto space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white px-4 h-16 flex items-center mb-4">
        <div className="space-y-1.5">
          <div className="h-2 w-16 bg-sage-mid rounded" />
          <div className="h-4 w-28 bg-sage-mid rounded" />
        </div>
      </div>

      {/* Balance card skeleton */}
      <div className="bg-sage-mid h-40 w-full rounded-xl" />

      {/* Row skeletons */}
      <div className="bg-white border border-sage-mid divide-y divide-sage-mid rounded-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-4">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-sage-mid" />
              <div className="h-2.5 w-36 bg-sage-mid" />
            </div>
            <div className="h-4 w-20 bg-sage-mid ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
