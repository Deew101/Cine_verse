import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  movies: Movie[] | undefined;
  loading?: boolean;
  numbered?: boolean;
}

export const ContentRail = ({ title, subtitle, movies, loading, numbered }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amt = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amt : amt, behavior: "smooth" });
  };

  return (
    <section className="group/rail relative py-6 animate-fade-in">
      <div className="container mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-display text-2xl tracking-wider md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll("left")}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground/70 backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground/70 backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "rail-scroll container flex gap-4 overflow-x-auto pb-4",
          numbered && "pl-10 sm:pl-14"
        )}
      >
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] w-[160px] flex-shrink-0 animate-pulse rounded-lg bg-muted sm:w-[180px] md:w-[200px]"
            />
          ))}
        {movies?.map((m, i) => (
          <MovieCard key={`${m.id}-${i}`} movie={m} index={numbered ? i : undefined} />
        ))}
      </div>
    </section>
  );
};
