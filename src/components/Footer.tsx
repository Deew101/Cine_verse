import { Film, Github } from "lucide-react";

export const Footer = () => (
  <footer className="mt-20 border-t border-border/40 bg-card/40">
    <div className="container py-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" strokeWidth={2.5} />
          <span className="text-display text-xl tracking-wider">
            CINE<span className="text-primary">VERSE</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          A premium streaming experience. Powered by TMDb.
        </p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Movie data © TMDb
        </a>
      </div>
    </div>
  </footer>
);
