import React from 'react';
import { Star, Bookmark, Calendar } from 'lucide-react';
import MoviePoster from './MoviePoster.jsx';

export default function MovieCard({
  movie,
  onSelect,
  isWatchlisted = false,
  onToggleWatchlist
}) {
  if (!movie) return null;

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (onToggleWatchlist) onToggleWatchlist(movie);
  };

  const languageLabels = {
    te: 'Telugu',
    hi: 'Hindi',
    ta: 'Tamil',
    ml: 'Malayalam',
    kn: 'Kannada',
    en: 'English'
  };

  const langCode = (movie.original_language || 'en').toLowerCase();
  const langDisplay = languageLabels[langCode] || langCode.toUpperCase();

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      className="group relative flex-none w-[160px] sm:w-[190px] md:w-[210px] rounded-xl overflow-hidden glass-card cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/70 hover:border-amber-400/40 select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect && onSelect(movie);
        }
      }}
      aria-label={`View details for ${movie.title}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <MoviePoster
          movie={movie}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for card depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-semibold shadow-md z-10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average}</span>
          </div>
        )}

        {/* Language Badge */}
        <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-wider z-10">
          {langDisplay}
        </div>

        {/* Watchlist Toggle Button */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer z-10 ${
            isWatchlisted
              ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30'
              : 'bg-black/60 text-zinc-300 border-white/20 hover:text-white hover:bg-black/90'
          }`}
          title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Movie Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            {movie.release_year || 'N/A'}
          </span>
          <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-[80px] text-right">
            {(movie.genres && movie.genres[0]) || 'Feature'}
          </span>
        </div>
      </div>
    </div>
  );
}
