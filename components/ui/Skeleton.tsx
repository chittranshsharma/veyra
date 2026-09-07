import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx("skeleton", className)} />;
}

export function PosterSkeleton() {
  return (
    <div className="w-[160px] shrink-0 sm:w-[180px]">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <div className="mt-2 space-y-1.5 px-1">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function RowSkeleton({ title }: { title?: string }) {
  return (
    <section className="space-y-3">
      {title && (
        <div className="px-4 sm:px-8">
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
      )}
      <div className="flex gap-3 overflow-hidden px-4 sm:px-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <PosterSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] w-full bg-surface">
      <div className="absolute bottom-12 left-4 space-y-4 sm:left-8">
        <Skeleton className="h-12 w-64 rounded-lg sm:h-16 sm:w-96" />
        <Skeleton className="h-4 w-80 rounded sm:w-[28rem]" />
        <Skeleton className="h-4 w-64 rounded" />
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function DetailHeroSkeleton() {
  return (
    <div className="relative h-[60vh] w-full bg-surface">
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-8">
        <div className="flex gap-6">
          <Skeleton className="hidden h-72 w-48 shrink-0 rounded-2xl sm:block" />
          <div className="space-y-3 pt-8">
            <Skeleton className="h-10 w-72 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-full max-w-xl rounded" />
            <Skeleton className="h-4 w-3/4 max-w-xl rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
