export interface NetworkItem {
  id: number;
  label: string;
  badge: string;
  tagline: string;
}

export const TV_NETWORKS: NetworkItem[] = [
  { id: 49, label: "HBO / Max", badge: "HBO", tagline: "Prestige Television" },
  { id: 213, label: "Netflix", badge: "NETFLIX", tagline: "Global Originals" },
  { id: 2552, label: "Apple TV+", badge: "Apple TV+", tagline: "High-Concept Sci-Fi & Drama" },
  { id: 2739, label: "Disney+", badge: "Disney+", tagline: "Franchises & Animation" },
  { id: 1024, label: "Prime Video", badge: "Prime", tagline: "Blockbuster Series" },
  { id: 88, label: "FX", badge: "FX", tagline: "Edgy Masterpieces" },
  { id: 4330, label: "Paramount+", badge: "Paramount+", tagline: "Expansive Universes" },
];

export const MOVIE_STUDIOS: NetworkItem[] = [
  { id: 41077, label: "A24", badge: "A24", tagline: "Auteur & Cult Classics" },
  { id: 174, label: "Warner Bros.", badge: "WB", tagline: "Epic Cinematic Worlds" },
  { id: 420, label: "Marvel Studios", badge: "Marvel", tagline: "Superheroes & MCU" },
  { id: 33, label: "Universal", badge: "Universal", tagline: "Blockbusters & Thrillers" },
  { id: 4, label: "Paramount", badge: "Paramount", tagline: "Iconic Franchises" },
  { id: 5, label: "Columbia Pictures", badge: "Columbia", tagline: "Legendary Cinema" },
];
