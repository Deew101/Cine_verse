import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Calendar, Clock, ArrowLeft } from "lucide-react";
import { tmdbApi, backdropUrl, posterUrl } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const Title = () => {
  const { type, id } = useParams<{ type: "movie" | "tv"; id: string }>();
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["details", type, id],
    queryFn: () => tmdbApi.details(type as "movie" | "tv", Number(id)),
    enabled: !!id && !!type,
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-[70vh] animate-pulse bg-card" />
      </div>
    );
  }

  const title = data.title || data.name || "";
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const trailer = data.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  const cast = data.credits?.cast?.slice(0, 8) || [];
  const similar = data.similar?.results?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <section className="relative h-[80vh] min-h-[500px] w-full overflow-hidden">
        <img
          src={backdropUrl(data.backdrop_path)}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-hero-side" />

        <div className="container relative flex h-full items-end pb-12">
          <Link
            to="/browse"
            className="absolute left-6 top-24 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="grid w-full gap-8 md:grid-cols-[260px,1fr]">
            <img
              src={posterUrl(data.poster_path, "w500")}
              alt={title}
              className="hidden w-[260px] rounded-xl shadow-elevated ring-1 ring-border/40 md:block animate-slide-in"
            />
            <div className="max-w-3xl animate-slide-in">
              {data.tagline && (
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-primary/90">
                  {data.tagline}
                </p>
              )}
              <h1 className="text-display text-5xl leading-none tracking-wide md:text-7xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-bold">{data.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({data.vote_count.toLocaleString()})</span>
                </span>
                {year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" /> {year}
                  </span>
                )}
                {data.runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" /> {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-border/60 bg-card/60 px-3 py-0.5 text-xs text-foreground/80 backdrop-blur"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">
                {data.overview}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {trailer && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3 font-semibold text-primary-foreground shadow-gold transition-all hover:scale-105"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cast */}
      {cast.length > 0 && (
        <section className="container py-12">
          <h2 className="text-display mb-6 text-3xl tracking-wider">Top Cast</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {cast.map((c) => (
              <div key={c.id} className="text-center">
                <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-muted shadow-poster ring-1 ring-border/40">
                  <img
                    src={posterUrl(c.profile_path, "w200")}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium">{c.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{c.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <section className="container pb-16">
          <h2 className="text-display mb-6 text-3xl tracking-wider">More Like This</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {similar.map((m) => (
              <div key={m.id} className="flex justify-center">
                <MovieCard movie={{ ...m, media_type: type }} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />

      {/* Trailer Modal */}
      {trailerOpen && trailer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-elevated ring-1 ring-primary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={trailer.name}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <button
            onClick={() => setTrailerOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-card px-4 py-2 text-sm font-medium ring-1 ring-border hover:bg-primary hover:text-primary-foreground"
          >
            Close ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Title;
