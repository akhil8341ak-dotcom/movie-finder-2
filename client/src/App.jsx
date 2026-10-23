import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSpotlight from './components/HeroSpotlight.jsx';
import CollectionRail from './components/CollectionRail.jsx';
import GarudaAssistant from './components/GarudaAssistant.jsx';
import MovieModal from './components/MovieModal.jsx';
import ExploreView from './components/ExploreView.jsx';
import WatchlistView from './components/WatchlistView.jsx';
import Footer from './components/Footer.jsx';
import { fetchHomepageCollections } from './api.js';
import { Sparkles, Film, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [garudaOpen, setGarudaOpen] = useState(false);
  const [garudaPrompt, setGarudaPrompt] = useState('');

  // Watchlist persisted in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('moviefinder_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not read watchlist from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('moviefinder_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Could not save watchlist to localStorage:', e);
    }
  }, [watchlist]);

  const toggleWatchlist = (movie) => {
    if (!movie || !movie.id) return;
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [movie, ...prev];
      }
    });
  };

  const clearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      setWatchlist([]);
    }
  };

  // Load Homepage data
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchHomepageCollections()
      .then((data) => {
        if (!isCancelled) {
          setHomepageData(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage:', err);
        if (!isCancelled) {
          setError('Unable to connect to MovieFinder server. Please check your connection.');
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const openGarudaWithPrompt = (prompt) => {
    setGarudaPrompt(prompt);
    setGarudaOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080b] text-[#f3f4f6]">
      {/* Top Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenGaruda={() => {
          setGarudaPrompt('');
          setGarudaOpen(true);
        }}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div>
            {loading ? (
              <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
                <div className="w-full aspect-[21/9] skeleton rounded-2xl" />
                <div className="space-y-4">
                  <div className="h-6 w-48 skeleton rounded" />
                  <div className="flex gap-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-[190px] aspect-[2/3] skeleton rounded-xl flex-none" />
                    ))}
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  Connection Error
                </h2>
                <p className="text-sm text-zinc-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-gold text-xs !py-2.5 !px-5 mx-auto"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              homepageData && (
                <div>
                  {/* Hero Spotlight */}
                  <HeroSpotlight
                    movies={
                      homepageData.collections?.find((c) => c.id === 'trending')?.items || [
                        homepageData.hero
                      ]
                    }
                    onSelectMovie={setSelectedMovie}
                    onOpenGarudaWithPrompt={openGarudaWithPrompt}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                  />

                  {/* Garuda's Curated Picks Feature Bar */}
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/20 backdrop-blur-md">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-400/20">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white font-['Outfit']">
                              Garuda's Multilingual Discovery Prompts
                            </h2>
                            <p className="text-xs text-zinc-400">
                              Instant AI movie recommendations in Telugu, Hindi, English, and South Indian cinema
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openGarudaWithPrompt('')}
                          className="btn-gold text-xs !py-2 !px-4 self-start md:self-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-black" />
                          <span>Chat with Garuda</span>
                        </button>
                      </div>

                      {/* Quick Prompt Chips */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openGarudaWithPrompt('Suggest a good Telugu suspense thriller movie with plot twists')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          🔥 Telugu Thrillers
                        </button>
                        <button
                          onClick={() => openGarudaWithPrompt('Mood off undi, something feel-good and heartwarming suggest cheyyi')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          ✨ Mood Off? Feel-Good Picks
                        </button>
                        <button
                          onClick={() => openGarudaWithPrompt('Hindi me 12th Fail jaisi inspiring aur emotional movie batao')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          💡 Inspiring Hindi Stories
                        </button>
                        <button
                          onClick={() => openGarudaWithPrompt('Recommend a mind-bending sci-fi movie like Interstellar or Inception')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          🪐 Mind-Bending Sci-Fi
                        </button>
                        <button
                          onClick={() => openGarudaWithPrompt('Suggest realistic Malayalam cinema like Manjummel Boys or Kumbalangi Nights')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          🌴 Malayalam Masterpieces
                        </button>
                        <button
                          onClick={() => openGarudaWithPrompt('Suggest a gripping Tamil crime thriller like Maharaja or Vikram')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-amber-300 border border-amber-400/30 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          ⚡ Tamil Action & Crime
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Movie Collections Rails (~40-60 discoverable entries) */}
                  <div className="space-y-6 pt-2">
                    {homepageData.collections?.map((col) => (
                      <CollectionRail
                        key={col.id}
                        title={col.title}
                        description={col.description}
                        movies={col.items}
                        onSelectMovie={setSelectedMovie}
                        watchlist={watchlist}
                        onToggleWatchlist={toggleWatchlist}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* VIEW 2: EXPLORE & SEARCH */}
        {currentView === 'explore' && (
          <ExploreView
            onSelectMovie={setSelectedMovie}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
          />
        )}

        {/* VIEW 3: WATCHLIST */}
        {currentView === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onSelectMovie={setSelectedMovie}
            onToggleWatchlist={toggleWatchlist}
            onClearWatchlist={clearWatchlist}
            onNavigateExplore={() => setCurrentView('explore')}
          />
        )}
      </main>

      {/* Garuda AI Assistant Drawer */}
      <GarudaAssistant
        isOpen={garudaOpen}
        onClose={() => setGarudaOpen(false)}
        initialPrompt={garudaPrompt}
        onSelectMovie={(movie) => {
          setSelectedMovie(movie);
        }}
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
      />

      {/* Detailed Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onOpenGarudaWithPrompt={openGarudaWithPrompt}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
          onSelectMovie={setSelectedMovie}
        />
      )}

      {/* Global Footer */}
      <Footer
        onOpenGaruda={() => {
          setGarudaPrompt('');
          setGarudaOpen(true);
        }}
      />
    </div>
  );
}
