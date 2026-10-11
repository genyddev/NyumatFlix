export type PosterMotif = "orbit" | "ridge" | "signal" | "archive" | "city" | "line";

export type DemoMovie = Readonly<{
  slug: string;
  title: string;
  tagline: string;
  year: number;
  durationMinutes: number;
  ageRating: string;
  genres: readonly string[];
  synopsis: string;
  accent: string;
  shadow: string;
  motif: PosterMotif;
}>;

export const demoMovies = [
  {
    slug: "kryqezimi-i-henes",
    title: "Kryqëzimi i Hënës",
    tagline: "Çdo rrugë lë një dritë pas.",
    year: 2026,
    durationMinutes: 104,
    ageRating: "12+",
    genres: ["Dramë", "Mister"],
    synopsis: "Një hartografe kthehet në qytetin e saj malor dhe zbulon një hartë nate që duket se ndryshon sa herë merret një vendim i ri.",
    accent: "#f4b45f",
    shadow: "#6f2f40",
    motif: "orbit",
  },
  {
    slug: "harta-e-heshtur",
    title: "Harta e Heshtur",
    tagline: "Disa vende gjenden vetëm kur humbet.",
    year: 2025,
    durationMinutes: 96,
    ageRating: "10+",
    genres: ["Aventurë", "Dramë"],
    synopsis: "Dy motra ndjekin shënimet e papërfunduara të gjyshit dhe udhëtojnë drejt një lugine që mungon në çdo hartë zyrtare.",
    accent: "#83c7b8",
    shadow: "#173b45",
    motif: "ridge",
  },
  {
    slug: "sinjali-i-mengjesit",
    title: "Sinjali i Mëngjesit",
    tagline: "Një zë i largët. Një qytet zgjuar.",
    year: 2026,
    durationMinutes: 111,
    ageRating: "12+",
    genres: ["Fantashkencë", "Mister"],
    synopsis: "Një teknike radioje kap një transmetim që parashikon ngjarjet e qytetit vetëm shtatë minuta para se të ndodhin.",
    accent: "#f26d78",
    shadow: "#381c45",
    motif: "signal",
  },
  {
    slug: "arkivi-i-eres",
    title: "Arkivi i Erës",
    tagline: "Kujtimet nuk rrinë gjithmonë në letër.",
    year: 2024,
    durationMinutes: 89,
    ageRating: "Të gjithë",
    genres: ["Dramë", "Familjar"],
    synopsis: "Një restauruese librash regjistron historitë e një ishulli para stuhisë së fundit dhe gjen një rrëfim që i përket familjes së saj.",
    accent: "#d9c28b",
    shadow: "#3c4a49",
    motif: "archive",
  },
  {
    slug: "dritat-e-qytetit-te-humbur",
    title: "Dritat e Qytetit të Humbur",
    tagline: "Nata mban mend atë që dita harron.",
    year: 2025,
    durationMinutes: 118,
    ageRating: "14+",
    genres: ["Thriller", "Dramë"],
    synopsis: "Një fotografe nate vëren se një lagje e tërë shfaqet vetëm në negativët e saj dhe vendos ta gjejë para agimit.",
    accent: "#f0ca55",
    shadow: "#18224a",
    motif: "city",
  },
  {
    slug: "vija-e-kalter",
    title: "Vija e Kaltër",
    tagline: "Deti ndan brigjet, jo premtimet.",
    year: 2023,
    durationMinutes: 101,
    ageRating: "10+",
    genres: ["Romancë", "Dramë"],
    synopsis: "Dy arkitektë në brigje të kundërta ndërtojnë ura të vogla për komunitetet e tyre dhe zbulojnë se planet e tyre takohen në mes.",
    accent: "#61bce8",
    shadow: "#18345a",
    motif: "line",
  },
] as const satisfies readonly DemoMovie[];

export const featuredMovie = demoMovies[0];

export const catalogueRows = [
  { title: "Të përzgjedhurat", slugs: ["kryqezimi-i-henes", "sinjali-i-mengjesit", "dritat-e-qytetit-te-humbur"] },
  { title: "Histori për t’u zbuluar", slugs: ["harta-e-heshtur", "arkivi-i-eres", "vija-e-kalter"] },
] as const;

export function getDemoMovie(slug: string): DemoMovie | undefined {
  return demoMovies.find((movie) => movie.slug === slug);
}

export function getMoviesBySlug(slugs: readonly string[]): readonly DemoMovie[] {
  return slugs.map(getDemoMovie).filter((movie): movie is DemoMovie => movie !== undefined);
}

export function searchDemoMovies(query: string): readonly DemoMovie[] {
  const needle = query.trim().toLocaleLowerCase("sq");
  if (!needle) return demoMovies;
  return demoMovies.filter((movie) =>
    [movie.title, movie.tagline, movie.synopsis, ...movie.genres]
      .join(" ")
      .toLocaleLowerCase("sq")
      .includes(needle),
  );
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}o ${remainder}m`;
}
