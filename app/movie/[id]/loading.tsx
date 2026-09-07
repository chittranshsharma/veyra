import { DetailHeroSkeleton, RowSkeleton } from "@/components/ui/Skeleton";

export default function MovieLoading() {
  return (
    <main>
      <DetailHeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 space-y-10">
        <RowSkeleton title="Cast" />
        <RowSkeleton title="You Might Also Like" />
      </div>
    </main>
  );
}
