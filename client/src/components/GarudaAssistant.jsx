import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Star,
  Bookmark,
  Info,
  Globe,
  Film,
  AlertCircle
} from 'lucide-react';
import { sendGarudaMessage, fetchGarudaStarters } from '../api.js';
import MoviePoster from './MoviePoster.jsx';

export default function GarudaAssistant({
  isOpen,
  onClose,
  initialPrompt = '',
  onSelectMovie,
  watchlist = [],
  onToggleWatchlist
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starters, setStarters] = useState([]);
  const [sessionContext, setSessionContext] = useState({});
  const [languagePreference, setLanguagePreference] = useState('auto');
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load starter prompts
  useEffect(() => {
    fetchGarudaStarters().then((data) => {
      if (data && data.length > 0) setStarters(data);
    });
  }, []);

  // Handle opening with an initial prompt (e.g. from Hero or Movie Details)
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && initialPrompt.trim()) {
        handleSend(initialPrompt.trim());
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, initialPrompt]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;

    const userMessage = { role: 'user', text: text.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await sendGarudaMessage({
        message: text.trim(),
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        sessionContext,
        languagePreference
      });

      const garudaMessage = {
        role: 'garuda',
        text: response.reply,
        movies: response.movies || [],
        intent: response.intent || {}
      };

      setMessages([...newHistory, garudaMessage]);
      setSessionContext(response.sessionContext || {});
    } catch (err) {
      console.error('[Garuda Error]:', err);
      setError('Unable to reach Garuda right now. Please check connection or retry.');
      setMessages([
        ...newHistory,
        {
          role: 'garuda',
          text: 'I ran into a temporary issue connecting to the recommendation service. Please try asking again!',
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setSessionContext({});
    setError(null);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:w-[500px] md:w-[560px] h-full flex flex-col glass-modal border-l border-white/10 shadow-2xl overflow-hidden">
        
        {/* Assistant Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 garuda-glow">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-['Outfit']">
                  Garuda AI
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Multilingual
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Telugu • Hindi • English • Tamil • Kannada • Malayalam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer transition-colors"
              title="Start New Chat"
              aria-label="Start New Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer transition-colors"
              title="Close Garuda"
              aria-label="Close Garuda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Preference Bar */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Preferred Language:</span>
          </div>
          <select
            value={languagePreference}
            onChange={(e) => setLanguagePreference(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-md text-zinc-200 text-xs px-2 py-1 outline-none focus:border-amber-400"
          >
            <option value="auto">Auto-detect (Recommended)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="en">English</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Welcome Screen when messages are empty */}
          {messages.length === 0 && (
            <div className="py-6 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit'] mb-1">
                  Namaskaram! I am Garuda.
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Ask me in your preferred language or transliteration. I retrieve real, verified movies and explain recommendations!
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="text-left space-y-2 pt-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  Suggested Prompts:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {starters.map((starter) => (
                    <button
                      key={starter.id}
                      onClick={() => handleSend(starter.query)}
                      className="text-left p-3 rounded-xl bg-zinc-900/70 border border-white/5 hover:border-amber-400/40 hover:bg-zinc-800/80 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-300">
                          {starter.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {starter.language}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 group-hover:text-white transition-colors">
                        "{starter.query}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              } animate-fade-in`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-400 text-black font-medium rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-950/60 text-red-200 border border-red-800/40 rounded-tl-none'
                    : 'bg-zinc-900/90 text-zinc-200 border border-white/10 rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}
              </div>

              {/* Verified Movie Cards inside Garuda Response */}
              {msg.movies && msg.movies.length > 0 && (
                <div className="w-full mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-1">
                    <Film className="w-3.5 h-3.5" />
                    <span>Verified Catalogue Matches:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.movies.map((movie) => {
                      const isWatchlisted = watchlist.some((w) => w.id === movie.id);
                      return (
                        <div
                          key={movie.id}
                          onClick={() => onSelectMovie && onSelectMovie(movie)}
                          className="flex gap-2.5 p-2 rounded-xl bg-zinc-950/80 border border-white/10 hover:border-amber-400/50 hover:bg-zinc-900 transition-all cursor-pointer group"
                        >
                          <div className="w-14 h-20 rounded-lg overflow-hidden flex-none bg-zinc-800">
                            <MoviePoster
                              movie={movie}
                              aspect="aspect-[2/3]"
                              showFallbackTitle={false}
                              className="w-full h-full group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div>
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                {movie.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                <span>{movie.release_year}</span>
                                <span>•</span>
                                <span className="uppercase text-amber-400 font-semibold">
                                  {movie.original_language}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              {movie.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {movie.vote_average}
                                </span>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleWatchlist && onToggleWatchlist(movie);
                                }}
                                className={`p-1 rounded-md text-[11px] border cursor-pointer ${
                                  isWatchlisted
                                    ? 'bg-amber-400 text-black border-amber-300'
                                    : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-white'
                                }`}
                                title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                              >
                                <Bookmark className={`w-3 h-3 ${isWatchlisted ? 'fill-black' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 max-w-[80%] animate-fade-in">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                Garuda is analyzing & retrieving verified movies...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Follow-up Chips (shown when conversation is active) */}
        {messages.length > 0 && !loading && (
          <div className="px-4 py-2 border-t border-white/5 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase flex-none">
              Quick Follow-ups:
            </span>
            <button
              onClick={() => handleSend('Show me something newer')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 flex-none cursor-pointer transition-colors"
            >
              ✨ Something Newer
            </button>
            <button
              onClick={() => handleSend('Only Telugu movies')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 flex-none cursor-pointer transition-colors"
            >
              🎯 Only Telugu
            </button>
            <button
              onClick={() => handleSend('Suggest top rated only')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 flex-none cursor-pointer transition-colors"
            >
              ⭐ Top Rated (8.0+)
            </button>
            <button
              onClick={() => handleSend('Mood off undi, feel-good kavali')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 flex-none cursor-pointer transition-colors"
            >
              💛 Feel-Good Mood
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-white/10 bg-zinc-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in Telugu, Hindi, English... (e.g., 'Naaku manchi thriller suggest cheyyi')"
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-400 transition-colors"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                input.trim() && !loading
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 hover:scale-105'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-zinc-500 text-center mt-2">
            Garuda verifies records with TMDB catalogue • Zero hallucinated titles
          </p>
        </div>

      </div>
    </div>
  );
}
