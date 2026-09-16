import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";

// Language code to human-readable name & flag mapping
const LANGUAGE_NAMES: Record<string, { name: string; flag: string }> = {
  eng: { name: "English", flag: "🇺🇸" },
  spa: { name: "Spanish", flag: "🇪🇸" },
  fre: { name: "French", flag: "🇫🇷" },
  ger: { name: "German", flag: "🇩🇪" },
  ita: { name: "Italian", flag: "🇮🇹" },
  por: { name: "Portuguese", flag: "🇵🇹" },
  pob: { name: "Portuguese (BR)", flag: "🇧🇷" },
  hin: { name: "Hindi", flag: "🇮🇳" },
  ara: { name: "Arabic", flag: "🇸🇦" },
  rus: { name: "Russian", flag: "🇷🇺" },
  chi: { name: "Chinese", flag: "🇨🇳" },
  jpn: { name: "Japanese", flag: "🇯🇵" },
  kor: { name: "Korean", flag: "🇰🇷" },
  tur: { name: "Turkish", flag: "🇹🇷" },
  pol: { name: "Polish", flag: "🇵🇱" },
  dut: { name: "Dutch", flag: "🇳🇱" },
  swe: { name: "Swedish", flag: "🇸🇪" },
  ind: { name: "Indonesian", flag: "🇮🇩" },
  vie: { name: "Vietnamese", flag: "🇻🇳" },
  tha: { name: "Thai", flag: "🇹🇭" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tmdbId = searchParams.get("tmdbId");
  const mediaType = searchParams.get("mediaType") || "movie";
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!tmdbId) {
    return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
  }

  try {
    // 1. Resolve IMDb ID from TMDB
    let imdbId: string | undefined;

    if (mediaType === "movie") {
      const details = await tmdb.movieDetails(tmdbId);
      imdbId = (details as any).imdb_id;
    } else {
      const details = await tmdb.tvDetails(tmdbId);
      // tvDetails includes external_ids
      const ext = (details as any).external_ids;
      imdbId = ext?.imdb_id;
    }

    if (!imdbId) {
      return NextResponse.json({ subtitles: [], message: "No IMDb ID found" });
    }

    // 2. Query OpenSubtitles via public community engine
    const queryPath =
      mediaType === "movie"
        ? `movie/${imdbId}.json`
        : `series/${imdbId}:${season || 1}:${episode || 1}.json`;

    const subRes = await fetch(`https://opensubtitles-v3.strem.io/subtitles/${queryPath}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!subRes.ok) {
      return NextResponse.json({ subtitles: [] });
    }

    const data = await subRes.json();
    const rawSubs: any[] = data.subtitles || [];

    // 3. Format and deduplicate subtitles by language
    const subtitles = rawSubs.map((sub) => {
      const langCode = sub.lang?.toLowerCase() || "eng";
      const langMeta = LANGUAGE_NAMES[langCode] || {
        name: langCode.toUpperCase(),
        flag: "🌐",
      };

      return {
        id: sub.id || String(Math.random()),
        lang: langCode,
        label: `${langMeta.flag} ${langMeta.name}`,
        fileName: sub.subtitleFileName || `${langMeta.name}.srt`,
        release: sub.movieReleaseName || sub.releaseGroup || "",
        url: sub.url,
      };
    });

    // Prioritize English first, then Spanish, then others
    subtitles.sort((a, b) => {
      if (a.lang === "eng" && b.lang !== "eng") return -1;
      if (b.lang === "eng" && a.lang !== "eng") return 1;
      return a.label.localeCompare(b.label);
    });

    return NextResponse.json({ subtitles });
  } catch (err: any) {
    console.error("Failed to fetch subtitles:", err.message);
    return NextResponse.json({ subtitles: [], error: err.message }, { status: 500 });
  }
}
