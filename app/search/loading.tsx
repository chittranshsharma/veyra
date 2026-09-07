import { RowSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-7xl min-h-screen px-4 py-8 sm:px-8">
      <Skeleton className="mb-6 h-9 w-24 rounded-lg" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <div className="mt-2 space-y-1.5 px-1">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
