import React from 'react';
import { Film, Sparkles, Heart } from 'lucide-react';

export default function Footer({ onOpenGaruda }) {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07080b] py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Mission */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center">
              <Film className="w-4 h-4 text-black" />
            </div>
            <span className="text-base font-bold text-white font-['Outfit']">
              Movie<span className="text-amber-400">Finder</span>
            </span>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              Discovery Engine
            </span>
          </div>

          <p className="text-xs text-zinc-400 max-w-md">
            Cinematic movie discovery celebrating Indian regional cinema (Telugu, Hindi, Tamil, Malayalam, Kannada) & world cinema, guided by Garuda AI.
          </p>
        </div>

        {/* Garuda Callout */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Garuda AI Assistant</p>
            <p className="text-[11px] text-zinc-400">Natural multilingual recommendations</p>
          </div>
          <button
            onClick={onOpenGaruda}
            className="btn-gold !py-1.5 !px-3 text-xs ml-2 cursor-pointer"
          >
            Ask Now
          </button>
        </div>

        {/* TMDB Attribution & Disclaimer */}
        <div className="text-center md:text-right space-y-1 text-[11px] text-zinc-500 max-w-xs">
          <p>
            Movie data and images provided by <strong className="text-zinc-300">TMDB</strong>.
          </p>
          <p>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p className="pt-1 text-zinc-600">
            Designed for ₹0 software cost • Ready for Render deployment
          </p>
        </div>
      </div>
    </footer>
  );
}
