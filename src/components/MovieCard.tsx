import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Movie, posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface Props {
  movie: Movie;
  index?: number;
  className?: string;
}

export const MovieCard = ({ movie, index, className }: Props) => {
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const type = movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie";

  return (
    <Link
      to={`/title/${type}/${movie.id}`}
      className={cn(
        "group relative block w-[160px] flex-shrink-0 sm:w-[180px] md:w-[200px]",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:scale-[1.06] hover:z-10",
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-poster ring-1 ring-border/40 transition-shadow duration-500 group-hover:shadow-elevated group-hover:ring-primary/40">
        <img
          src={posterUrl(movie.poster_path, "w342")}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {typeof index === "number" && (
          <span className="text-display absolute -left-2 -top-2 select-none text-[110px] leading-none text-primary/20 mix-blend-screen drop-shadow-[0_0_25px_hsl(var(--primary)/0.4)]">
            {index + 1}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-2 text-xs text-foreground/90">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
            {year && <span className="text-muted-foreground">• {year}</span>}
          </div>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary">
        {title}
      </h3>
    </Link>
  );
};
