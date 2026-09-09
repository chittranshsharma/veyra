export default function PersonLoading() {
  return (
    <main className="min-h-screen pb-20">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Photo skeleton */}
          <div className="skeleton h-[300px] w-[200px] shrink-0 rounded-2xl" />
          {/* Info skeleton */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-10 w-64 rounded-lg" />
            <div className="flex gap-4">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-28 rounded" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full max-w-xl rounded" />
              <div className="skeleton h-4 w-5/6 max-w-xl rounded" />
              <div className="skeleton h-4 w-4/6 max-w-xl rounded" />
              <div className="skeleton h-4 w-3/6 max-w-xl rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Rail skeletons */}
      {[0, 1].map((r) => (
        <section key={r} className="mt-10 space-y-3">
          <div className="skeleton mx-4 h-7 w-40 rounded-lg sm:mx-8" />
          <div className="flex gap-3 px-4 sm:px-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0">
                <div className="skeleton h-[240px] w-[160px] rounded-xl sm:w-[180px]" />
                <div className="skeleton mt-2 h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
