import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Film, LogOut, UserCog, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, activeProfile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/browse?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
    }
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium tracking-wide transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-foreground/80"
    );

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/50" : "bg-gradient-to-b from-background/90 to-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="h-7 w-7 text-primary transition-transform group-hover:scale-110" strokeWidth={2.5} />
          <span className="text-display text-2xl tracking-wider">
            CINE<span className="text-primary">VERSE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/browse" className={linkCls}>Browse</NavLink>
          <NavLink to="/browse?type=tv" className={linkCls}>TV Shows</NavLink>
          <NavLink to="/browse?sort=top" className={linkCls}>Top Rated</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <form onSubmit={onSubmit} className="flex items-center">
            <div
              className={cn(
                "flex items-center overflow-hidden rounded-full border transition-all duration-300",
                searchOpen
                  ? "w-56 border-primary/60 bg-background/80 px-3"
                  : "w-10 border-transparent bg-transparent"
              )}
            >
              <button
                type="button"
                onClick={() => setSearchOpen((s) => !s)}
                className="grid h-10 w-10 place-items-center text-foreground/80 hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Titles, people…"
                className={cn(
                  "h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60",
                  searchOpen ? "block" : "hidden"
                )}
              />
            </div>
          </form>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <img
                    src={getAvatar(activeProfile?.avatar_url, 0)}
                    alt={activeProfile?.name ?? "Profile"}
                    className="h-9 w-9 rounded-lg border border-border/60 transition-transform group-hover:scale-105"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{activeProfile?.name ?? "No profile"}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profiles")}>
                  <Users className="h-4 w-4" /> Switch profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profiles")}>
                  <UserCog className="h-4 w-4" /> Manage profiles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut().then(() => navigate("/auth"))}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")} size="sm" className="rounded-full font-semibold">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
