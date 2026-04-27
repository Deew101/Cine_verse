import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { tmdbApi } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const SORTS = [
  { id: "popularity.desc", label: "Trending" },
  { id: "vote_average.desc", label: "Top Rated" },
  { id: "release_date.desc", label: "Newest" },
  { id: "revenue.desc", label: "Highest Grossing" },
];

const Browse = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const genre = params.get("genre") || "";
  const sort = params.get("sort") === "top" ? "vote_average.desc" : params.get("sort") || "popularity.desc";

  const genres = useQuery({ queryKey: ["genres"], queryFn: tmdbApi.movieGenres });

  const search = useQuery({
    queryKey: ["search", q],
    queryFn: () => tmdbApi.search(q),
    enabled: !!q,
  });

  const discover = useQuery({
    queryKey: ["discover", { genre, sort }],
    queryFn: () =>
      tmdbApi.discover({
        sort_by: sort,
        with_genres: genre,
        "vote_count.gte": 100,
      }),
    enabled: !q,
  });

  const results = useMemo(
    () => (q ? search.data?.results?.filter((r: any) => r.media_type !== "person") : discover.data?.results) || [],
    [q, search.data, discover.data]
  );

  const updateParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-28">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-display text-5xl tracking-wider md:text-6xl">
            {q ? <>Results for <span className="gradient-text-gold">"{q}"</span></> : "Browse"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {q ? `${results.length} titles found` : "Discover your next favorite film"}
          </p>
        </div>

        {!q && (
          <>
            {/* Sort */}
            <div className="mb-4 flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateParam("sort", s.id)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                    sort === s.id
                      ? "border-primary bg-primary text-primary-foreground shadow-gold"
                      : "border-border/60 bg-card/40 text-foreground/80 hover:border-primary/50"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Genres */}
            <div className="mb-10 flex flex-wrap gap-2">
              <button
                onClick={() => updateParam("genre", "")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  !genre ? "border-primary text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"
                )}
              >
                All Genres
              </button>
              {genres.data?.genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => updateParam("genre", String(g.id))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    genre === String(g.id)
                      ? "border-primary text-primary"
                      : "border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(search.isLoading || discover.isLoading) &&
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-card" />
            ))}
          {results.map((m: any) => (
            <div key={m.id} className="flex justify-center">
              <MovieCard movie={m} />
            </div>
          ))}
        </div>

        {!search.isLoading && !discover.isLoading && results.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">No results found.</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
