import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Bookmark,
  Calendar,
  Clock,
  Sparkles,
  User,
  Film,
  ShieldCheck
} from 'lucide-react';
import { fetchMovieDetails } from '../api.js';
import MovieCard from './MovieCard.jsx';
import MoviePoster from './MoviePoster.jsx';

export default function MovieModal({
  movie,
  onClose,
  onOpenGarudaWithPrompt,
  watchlist = [],
  onToggleWatchlist,
  onSelectMovie
}) {
  const [details, setDetails] = useState(movie);
  const [loading, setLoading] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    if (movie && movie.id) {
      setLoading(true);
      fetchMovieDetails(movie.id)
        .then((fullData) => {
          if (fullData) setDetails(fullData);
        })
        .catch((err) => {
          console.warn('[Modal] Could not fetch extended details:', err);
          setDetails(movie);
        })
        .finally(() => setLoading(false));
    }
  }, [movie]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const current = details || movie;
  const isWatchlisted = watchlist.some((w) => w.id === current.id);

  const handleAskGaruda = () => {
    const prompt = `Tell me more about "${current.title}" (${current.release_year}). Why is it worth watching, and what similar films do you recommend?`;
    onOpenGarudaWithPrompt(prompt);
    onClose();
  };

  const backdropSource = current.backdrop_url || current.poster_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl glass-modal rounded-2xl overflow-hidden shadow-2xl border border-white/10 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-zinc-950 overflow-hidden">
          {backdropSource && !backdropError ? (
            <img
              src={backdropSource}
              alt={current.title}
              onError={() => setBackdropError(true)}
              className="w-full h-full object-cover filter brightness-[0.7]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
              <Film className="w-20 h-20 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="px-5 sm:px-8 pb-8 -mt-16 sm:-mt-24 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Poster Card */}
            <div className="w-32 sm:w-48 flex-none rounded-xl overflow-hidden shadow-2xl border-2 border-white/15 bg-zinc-900 mx-auto sm:mx-0">
              <MoviePoster
                movie={current}
                aspect="aspect-[2/3]"
                showFallbackTitle={true}
              />
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center sm:text-left">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                {current.vote_average > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 text-black text-xs font-bold shadow-md">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    {current.vote_average} TMDB
                    {current.vote_count > 0 && (
                      <span className="text-[10px] opacity-75 font-normal">
                        ({current.vote_count})
                      </span>
                    )}
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-zinc-300 px-2.5 py-1 rounded-md bg-white/10">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {current.release_date || current.release_year}
                </span>

                {current.runtime && (
                  <span className="flex items-center gap-1 text-xs text-zinc-300 px-2.5 py-1 rounded-md bg-white/10">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {current.runtime} min
                  </span>
                )}

                <span className="text-xs uppercase font-semibold text-amber-300 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
                  {current.original_language?.toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                {current.title}
              </h2>

              {/* Original Title */}
              {current.original_title && current.original_title !== current.title && (
                <p className="text-sm font-medium text-amber-300/80 italic mt-0.5">
                  {current.original_title}
                </p>
              )}

              {/* Director & Genres */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-zinc-300">
                {current.director && (
                  <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Director: <span className="text-white font-bold">{current.director}</span>
                  </div>
                )}
                {current.genres && (
                  <div className="flex flex-wrap gap-1">
                    {current.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5">
                <button
                  onClick={handleAskGaruda}
                  className="btn-gold text-xs sm:text-sm !py-2.5 !px-5"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>Ask Garuda About This</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(current)}
                  className={`btn-secondary text-xs sm:text-sm !py-2.5 !px-4 ${
                    isWatchlisted ? '!bg-amber-400/15 !text-amber-300 !border-amber-400/40' : ''
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Synopsis
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {current.overview || 'No synopsis provided for this title.'}
            </p>
          </div>

          {/* Cast */}
          {current.cast && current.cast.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Starring Cast
              </h3>
              <div className="flex flex-wrap gap-2">
                {current.cast.map((actor) => (
                  <span
                    key={actor}
                    className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verified Metadata & Legal Notice */}
          <div className="mt-6 p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex items-start gap-3 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-200">
                Verified Discovery Record
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                MovieFinder is an independent movie discovery and recommendation guide. To stream or purchase this title lawfully, check licensed streaming platforms in your territory.
              </p>
            </div>
          </div>

          {/* Similar Recommendations */}
          {current.similar && current.similar.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                More Like This
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {current.similar.map((sim) => (
                  <div key={sim.id} className="w-[140px] flex-none">
                    <MovieCard
                      movie={sim}
                      isWatchlisted={watchlist.some((w) => w.id === sim.id)}
                      onSelect={(m) => {
                        onSelectMovie(m);
                      }}
                      onToggleWatchlist={onToggleWatchlist}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
