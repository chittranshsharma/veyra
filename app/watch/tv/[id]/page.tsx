import WatchTVPage, { generateMetadata as generateTVMetadata } from "./[season]/[episode]/page";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return generateTVMetadata({
    params: Promise.resolve({ id, season: "1", episode: "1" }),
  });
}

export default async function WatchTVDefaultPage({ params }: Props) {
  const { id } = await params;
  return WatchTVPage({
    params: Promise.resolve({ id, season: "1", episode: "1" }),
  });
}
