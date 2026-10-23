import React, { useState } from 'react';
import { Film } from 'lucide-react';

export default function MoviePoster({
  movie,
  className = '',
  aspect = 'aspect-[2/3]',
  showFallbackTitle = true,
  loading = 'lazy'
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const title = movie?.title || 'Unknown Title';
  const year = movie?.release_year || (movie?.release_date ? movie.release_date.split('-')[0] : '');
  const lang = (movie?.original_language || 'en').toUpperCase();
  const genre = movie?.genres?.[0] || '';

  const posterUrl = movie?.poster_url;

  // Render stylized fallback when URL is missing or load failed
  if (!posterUrl || hasError) {
    return (
      <div
        className={`relative w-full ${aspect} bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-3 flex flex-col justify-between items-center text-center select-none border border-white/5 overflow-hidden ${className}`}
        aria-label={`Artwork for ${title}`}
      >
        {/* Subtle backdrop pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

        {/* Top Badges */}
        <div className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-400 relative z-10">
          <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 uppercase">
            {lang}
          </span>
          {year && (
            <span className="text-zinc-500">
              {year}
            </span>
          )}
        </div>

        {/* Center Cinematic Icon */}
        <div className="relative z-10 flex flex-col items-center my-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-2 shadow-inner">
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          {genre && (
            <span className="text-[10px] font-medium text-amber-300/80 uppercase tracking-wider">
              {genre}
            </span>
          )}
        </div>

        {/* Bottom Title */}
        {showFallbackTitle && (
          <div className="w-full relative z-10">
            <p className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-tight">
              {title}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspect} overflow-hidden bg-zinc-900 ${className}`}>
      {/* Background skeleton while image loads to prevent layout shift */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      <img
        src={posterUrl}
        alt={title}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
