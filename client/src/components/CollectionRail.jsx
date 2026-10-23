import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';

export default function CollectionRail({
  title,
  description,
  movies = [],
  onSelectMovie,
  watchlist = [],
  onToggleWatchlist
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 350);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative py-4 group">
      {/* Header */}
      <div className="flex items-end justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
            <span className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              {movies.length}
            </span>
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Scroll Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-white/10 transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-zinc-900/80 text-white hover:bg-zinc-800 hover:border-amber-400/40'
                : 'bg-zinc-900/30 text-zinc-600 border-white/5 cursor-not-allowed'
            }`}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-white/10 transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-zinc-900/80 text-white hover:bg-zinc-800 hover:border-amber-400/40'
                : 'bg-zinc-900/30 text-zinc-600 border-white/5 cursor-not-allowed'
            }`}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rail Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2"
        >
          {movies.map((movie) => {
            const isWatchlisted = watchlist.some((w) => w.id === movie.id);
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                isWatchlisted={isWatchlisted}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
