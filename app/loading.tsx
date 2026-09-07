import { HeroSkeleton, RowSkeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-background pb-16">
      <HeroSkeleton />
      <div className="mt-8 space-y-10">
        <RowSkeleton title="Trending This Week" />
        <RowSkeleton title="Popular Movies" />
        <RowSkeleton title="Popular TV Shows" />
      </div>
    </main>
  );
}
