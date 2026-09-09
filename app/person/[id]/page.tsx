import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tmdb, tmdbImage } from "@/lib/tmdb/client";
import { Row } from "@/components/movie/Row";
import { MapPin, Calendar, Film, Tv } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await tmdb.personDetails(Number(id));
    return {
      title: person.name,
      description: person.biography?.slice(0, 160) ?? `View ${person.name}'s filmography on Veyra.`,
    };
  } catch {
    return { title: "Person" };
  }
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;

  let person;
  try {
    person = await tmdb.personDetails(Number(id));
  } catch {
    notFound();
  }

  const profileUrl = tmdbImage(person.profile_path, "w500");

  // Sort combined credits by popularity descending
  const allCast = (person.combined_credits?.cast ?? [])
    .filter((c) => c.poster_path)
    .sort((a, b) => b.popularity - a.popularity);

  const knownFor = allCast.slice(0, 12);

  // Full filmography sorted by year
  const movies = allCast
    .filter((c) => c.media_type === "movie" || (!c.media_type && c.title))
    .sort((a, b) => {
      const aYear = a.release_date ?? a.first_air_date ?? "0";
      const bYear = b.release_date ?? b.first_air_date ?? "0";
      return bYear.localeCompare(aYear);
    });

  const tvShows = allCast
    .filter((c) => c.media_type === "tv" || (!c.media_type && c.name && !c.title))
    .sort((a, b) => {
      const aYear = a.first_air_date ?? a.release_date ?? "0";
      const bYear = b.first_air_date ?? b.release_date ?? "0";
      return bYear.localeCompare(aYear);
    });

  const formattedBirthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Blurred backdrop from profile photo */}
        {profileUrl && (
          <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden opacity-15">
            <Image
              src={profileUrl}
              alt=""
              fill
              className="object-cover blur-3xl scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            {/* Profile photo */}
            <div className="shrink-0">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={person.name}
                  width={200}
                  height={300}
                  className="rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-[300px] w-[200px] items-center justify-center rounded-2xl bg-surface2 text-muted">
                  No photo
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {person.known_for_department}
                </p>
                <h1 className="gradient-heading mt-1 font-display text-4xl font-bold sm:text-5xl">
                  {person.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted">
                {formattedBirthday && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formattedBirthday}
                  </span>
                )}
                {person.place_of_birth && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {person.place_of_birth}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Film size={14} />
                  {movies.length} movie{movies.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tv size={14} />
                  {tvShows.length} TV show{tvShows.length !== 1 ? "s" : ""}
                </span>
              </div>

              {person.biography && (
                <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base line-clamp-6">
                  {person.biography}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Known For rail */}
      {knownFor.length > 0 && (
        <div className="mt-4">
          <Row title="Known For" items={knownFor} />
        </div>
      )}

      {/* Movies filmography */}
      {movies.length > 0 && (
        <div className="mt-10">
          <Row title="🎬 Movies" items={movies} defaultMediaType="movie" />
        </div>
      )}

      {/* TV Shows filmography */}
      {tvShows.length > 0 && (
        <div className="mt-10">
          <Row title="📺 TV Shows" items={tvShows} defaultMediaType="tv" />
        </div>
      )}
    </main>
  );
}
