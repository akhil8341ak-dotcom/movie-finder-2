import React from 'react';
import { Bookmark, Film, Trash2, Compass } from 'lucide-react';
import MovieCard from './MovieCard.jsx';

export default function WatchlistView({
  watchlist = [],
  onSelectMovie,
  onToggleWatchlist,
  onClearWatchlist,
  onNavigateExplore
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
              Your Watchlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-black">
              {watchlist.length} saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Films you intend to watch. Saved locally in your browser.
          </p>
        </div>

        {watchlist.length > 0 && (
          <button
            onClick={onClearWatchlist}
            className="btn-secondary text-xs !py-2 !px-3.5 !text-red-400 hover:!bg-red-500/10 border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Watchlist</span>
          </button>
        )}
      </div>

      {/* Grid of Saved Movies */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map((movie) => (
            <div key={movie.id} className="w-full flex justify-center">
              <MovieCard
                movie={movie}
                isWatchlisted={true}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 glass-card rounded-2xl border border-white/5 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white font-['Outfit']">
            Your Watchlist is empty
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any movie card or ask Garuda for tailored recommendations to start building your personalized list.
          </p>
          <button
            onClick={onNavigateExplore}
            className="btn-gold text-xs sm:text-sm !py-2.5 !px-5 mx-auto mt-2"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Movies Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
