import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Star, Film, Loader2 } from 'lucide-react';
import { searchMovies, discoverMovies, fetchGenres } from '../api.js';
import MovieCard from './MovieCard.jsx';

export default function ExploreView({
  onSelectMovie,
  watchlist = [],
  onToggleWatchlist
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [genres, setGenres] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Load available genres
  useEffect(() => {
    fetchGenres().then((g) => {
      if (Array.isArray(g)) setGenres(g);
    });
  }, []);

  // Fetch results based on search or discovery filters
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    async function loadResults() {
      try {
        if (debouncedQuery.trim()) {
          const searchData = await searchMovies(debouncedQuery);
          if (!isCancelled) setResults(searchData);
        } else {
          const discoverData = await discoverMovies({
            language: selectedLanguage || undefined,
            genre: selectedGenre || undefined,
            minRating: minRating || undefined,
            sortBy
          });
          if (!isCancelled) setResults(discoverData);
        }
      } catch (err) {
        console.error('[Explore] Fetch error:', err);
        if (!isCancelled) setResults([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadResults();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, selectedLanguage, selectedGenre, minRating, sortBy]);

  const handleResetFilters = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedLanguage('');
    setSelectedGenre('');
    setMinRating('');
    setSortBy('popularity.desc');
  };

  const languages = [
    { code: '', label: 'All Languages' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'ml', label: 'Malayalam (മലയാളം)' },
    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
          Explore & Search Films
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Search real movie titles or filter verified catalogues by language, genre, and ratings.
        </p>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 space-y-4 mb-8">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, or cast (e.g. 'RRR', '12th Fail', 'Interstellar')..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-amber-400 transition-colors"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 animate-spin" />
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Language Select */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 outline-none focus:border-amber-400"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Genre Select */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 outline-none focus:border-amber-400"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Min Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 outline-none focus:border-amber-400"
            >
              <option value="">Any Rating</option>
              <option value="7.0">7.0+ Good</option>
              <option value="7.5">7.5+ Very Good</option>
              <option value="8.0">8.0+ Masterpiece</option>
              <option value="8.5">8.5+ Legendary</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-200 outline-none focus:border-amber-400"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Newest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {(selectedLanguage || selectedGenre || minRating || query) && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-zinc-400">
              Active filters applied
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 bg-transparent border-none cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          {query ? `Search Results for "${query}"` : 'Discovered Films'}
        </h2>
        <span className="text-xs text-zinc-400">
          {results.length} titles found
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((movie) => (
            <div key={movie.id} className="w-full flex justify-center">
              <MovieCard
                movie={movie}
                isWatchlisted={watchlist.some((w) => w.id === movie.id)}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 glass-card rounded-2xl border border-white/5">
          <Film className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            No movies matched your current filters
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting another language, or resetting the rating filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-secondary text-xs !py-2 !px-4 mx-auto mt-2"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
