import React, { useState } from 'react';
import { Star, Sparkles, Info, Bookmark, Calendar, Clock, Film } from 'lucide-react';
import MoviePoster from './MoviePoster.jsx';

export default function HeroSpotlight({
  movies = [],
  onSelectMovie,
  onOpenGarudaWithPrompt,
  watchlist = [],
  onToggleWatchlist
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backdropError, setBackdropError] = useState(false);

  if (!movies || movies.length === 0) return null;

  // Use up to 4 top movies for spotlight rotation
  const spotlightList = movies.slice(0, 4);
  const activeMovie = spotlightList[currentIndex] || spotlightList[0];

  const isWatchlisted = watchlist.some((w) => w.id === activeMovie.id);

  const handleAskGaruda = () => {
    const prompt = `Tell me more about "${activeMovie.title}" (${activeMovie.release_year}). What makes it unique, and what other films would you recommend if I love this?`;
    onOpenGarudaWithPrompt(prompt);
  };

  const backdropSource = activeMovie.backdrop_url || activeMovie.poster_url;

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-end overflow-hidden pb-12 pt-20">
      {/* Dynamic Backdrop Image or Fallback Gradient */}
      <div className="absolute inset-0 z-0 bg-[#07080b]">
        {backdropSource && !backdropError ? (
          <img
            key={backdropSource}
            src={backdropSource}
            alt={activeMovie.title}
            onError={() => setBackdropError(true)}
            className="w-full h-full object-cover object-center filter brightness-[0.65] transition-all duration-700 transform scale-105 animate-fade-in"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[#07080b] via-[#141824] to-[#1c2237] flex items-center justify-center opacity-70">
            <Film className="w-32 h-32 text-white/5" />
          </div>
        )}

        {/* Cinematic Vignette and Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080b] via-[#07080b]/70 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-fade-in" key={activeMovie.id}>
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-md bg-amber-400 text-black text-xs font-bold uppercase tracking-wider">
              Spotlight
            </span>

            {activeMovie.vote_average > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {activeMovie.vote_average} TMDB
              </span>
            )}

            <span className="flex items-center gap-1 text-xs text-zinc-300 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/5">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {activeMovie.release_year}
            </span>

            {activeMovie.runtime && (
              <span className="flex items-center gap-1 text-xs text-zinc-300 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/5">
                <Clock className="w-3 h-3 text-zinc-400" />
                {activeMovie.runtime}m
              </span>
            )}

            <span className="text-xs uppercase font-medium text-zinc-400 px-2 py-1 rounded-md bg-white/5">
              {activeMovie.original_language?.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2">
            {activeMovie.title}
          </h1>

          {/* Original Title if different */}
          {activeMovie.original_title && activeMovie.original_title !== activeMovie.title && (
            <p className="text-sm sm:text-base font-medium text-amber-300/80 mb-3 italic">
              {activeMovie.original_title}
            </p>
          )}

          {/* Genres */}
          {activeMovie.genres && activeMovie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {activeMovie.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-xs text-zinc-300 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 mb-6 leading-relaxed max-w-xl">
            {activeMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectMovie(activeMovie)}
              className="btn-gold text-sm font-semibold !py-3 !px-6"
            >
              <Info className="w-4 h-4" />
              <span>View Details</span>
            </button>

            <button
              onClick={handleAskGaruda}
              className="btn-secondary text-sm font-semibold !py-3 !px-5"
              title="Ask Garuda AI about this movie"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask Garuda</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(activeMovie)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/80'
              }`}
              title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
              aria-label="Toggle Watchlist"
            >
              <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-black' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail Spotlight Switcher */}
        {spotlightList.length > 1 && (
          <div className="flex items-center gap-3 mt-8">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Featured Picks:
            </span>
            {spotlightList.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setBackdropError(false);
                }}
                className={`group flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-white/15 border-amber-400 text-white shadow-md'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                }`}
                aria-label={`Switch spotlight to ${m.title}`}
              >
                <div className="w-8 h-10 rounded overflow-hidden bg-zinc-800 flex-none">
                  <MoviePoster
                    movie={m}
                    aspect="aspect-[2/3]"
                    showFallbackTitle={false}
                  />
                </div>
                <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                  {m.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
