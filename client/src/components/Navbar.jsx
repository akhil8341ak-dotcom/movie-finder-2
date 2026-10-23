import React, { useState } from 'react';
import { Film, Sparkles, Bookmark, Compass, Search, Menu, X } from 'lucide-react';

export default function Navbar({
  currentView,
  onNavigate,
  onOpenGaruda,
  watchlistCount = 0
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 group text-left cursor-pointer border-none bg-transparent"
          aria-label="MovieFinder Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                Movie<span className="text-amber-400">Finder</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block -mt-0.5">
              Powered by <span className="text-amber-300 font-medium">Garuda</span>
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNav('home')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
              currentView === 'home'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('explore')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer border-none ${
              currentView === 'explore'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore & Search
          </button>

          <button
            onClick={() => handleNav('watchlist')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors relative cursor-pointer border-none ${
              currentView === 'watchlist'
                ? 'bg-white/10 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Watchlist
            {watchlistCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-400 text-black">
                {watchlistCount}
              </span>
            )}
          </button>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGaruda}
            className="btn-gold text-xs sm:text-sm font-semibold !py-2.5 !px-4 garuda-glow"
            title="Open Garuda Multilingual AI Movie Assistant"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>Ask Garuda</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-modal border-t border-white/10 px-4 pt-3 pb-6 flex flex-col gap-2 animate-fade-in">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium border-none cursor-pointer ${
              currentView === 'home' ? 'bg-amber-400/10 text-amber-300' : 'text-zinc-300 bg-transparent'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('explore')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 border-none cursor-pointer ${
              currentView === 'explore' ? 'bg-amber-400/10 text-amber-300' : 'text-zinc-300 bg-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore & Search
          </button>
          <button
            onClick={() => handleNav('watchlist')}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between border-none cursor-pointer ${
              currentView === 'watchlist' ? 'bg-amber-400/10 text-amber-300' : 'text-zinc-300 bg-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4" />
              Watchlist
            </span>
            {watchlistCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-black">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
