import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ContentRail } from "@/components/ContentRail";
import { Footer } from "@/components/Footer";

const Index = () => {
  const trending = useQuery({ queryKey: ["trending"], queryFn: tmdbApi.trending });
  const popular = useQuery({ queryKey: ["popular"], queryFn: tmdbApi.popularMovies });
  const topRated = useQuery({ queryKey: ["topRated"], queryFn: tmdbApi.topRated });
  const tv = useQuery({ queryKey: ["popularTV"], queryFn: tmdbApi.popularTV });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: tmdbApi.upcoming });
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: tmdbApi.nowPlaying });

  const heroMovie = trending.data?.results?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero movie={heroMovie} />

        <div className="relative -mt-24 space-y-2 pb-10">
          <ContentRail
            title="Trending Now"
            subtitle="What everyone's watching this week"
            movies={trending.data?.results?.slice(1)}
            loading={trending.isLoading}
          />
          <ContentRail
            title="Top 10 Movies"
            subtitle="The highest-rated films of all time"
            movies={topRated.data?.results?.slice(0, 10)}
            loading={topRated.isLoading}
            numbered
          />
          <ContentRail title="Popular Movies" movies={popular.data?.results} loading={popular.isLoading} />
          <ContentRail title="Popular Series" movies={tv.data?.results} loading={tv.isLoading} />
          <ContentRail title="Now Playing" movies={nowPlaying.data?.results} loading={nowPlaying.isLoading} />
          <ContentRail title="Coming Soon" movies={upcoming.data?.results} loading={upcoming.isLoading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
