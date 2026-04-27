import { Link } from "react-router-dom";
import { Play, Info, Star } from "lucide-react";
import { Movie, backdropUrl } from "@/lib/tmdb";

interface Props {
  movie: Movie | undefined;
}

export const Hero = ({ movie }: Props) => {
  if (!movie) {
    return (
      <div className="relative h-[80vh] min-h-[500px] w-full animate-pulse bg-card" />
    );
  }

  const title = movie.title || movie.name || "";
  const type = movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);

  return (
    <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
      <img
        src={backdropUrl(movie.backdrop_path, "original")}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover animate-fade-in"
      />
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-hero-side" />

      <div className="container relative flex h-full flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-2xl animate-slide-in">
          <div className="mb-4 flex items-center gap-3 text-sm">
            <span className="rounded-sm bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/40">
              ★ Featured
            </span>
            <span className="flex items-center gap-1 text-foreground/80">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {movie.vote_average.toFixed(1)}
            </span>
            {year && <span className="text-muted-foreground">• {year}</span>}
          </div>

          <h1 className="text-display text-5xl leading-none tracking-wide md:text-7xl lg:text-8xl">
            {title}
          </h1>

          <p className="mt-6 line-clamp-3 max-w-xl text-base text-foreground/80 md:text-lg">
            {movie.overview}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/title/${type}/${movie.id}`}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3 font-semibold text-primary-foreground shadow-gold transition-all hover:scale-105 hover:shadow-elevated"
            >
              <Play className="h-5 w-5 fill-current" />
              Watch Now
            </Link>
            <Link
              to={`/title/${type}/${movie.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3 font-semibold text-foreground backdrop-blur-md transition-all hover:border-primary/60 hover:bg-card"
            >
              <Info className="h-5 w-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
