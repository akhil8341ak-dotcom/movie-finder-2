

# 🎬 MovieFinder + Garuda AI

> **A modern, cinematic, high-performance movie discovery platform powered by Garuda, an AI movie assistant fluent in Indian regional languages and world cinema.**

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API_v3-01D277?logo=the-movie-database&logoColor=white)](https://www.themoviedb.org/)
[![Software Cost](https://img.shields.io/badge/Cost-₹0_Target-brightgreen)](https://render.com/)

---

## 🌟 Product Overview

**MovieFinder** is a movie-discovery web platform built to help audiences decide what to watch through rich visual rails and natural conversation. Unlike generic movie databases or chatbots, MovieFinder is built around **Garuda**, an intelligent multilingual AI movie companion designed specifically to understand Indian regional cinema nuances (Telugu, Hindi, Tamil, Malayalam, Kannada) alongside global cinema.

### Key Differentiators
1. **Garuda AI Assistant**: Not a decorative chatbot. Garuda converts user natural language and transliterated queries (e.g. *"Naaku oka manchi thriller movie suggest cheyyi"* or *"Mood off undi, something feel-good"*) into structured intent parameters, retrieves **real verified movie records**, and provides culturally resonant explanations.
2. **Zero Hallucination Guarantee**: Garuda never invents movie titles, fake ratings, or fake posters. Recommendations are validated against TMDB's catalogue or our verified backup dataset.
3. **Cinematic Design**: Deep onyx/slate theme, hero spotlight with rotating featured movies, horizontal rails with smooth touch/button scrolling, and glassmorphic modals.
4. **Resilient ₹0 Architecture**: Works 100% out-of-the-box using the built-in verified dataset even before entering API keys, and seamlessly unlocks live TMDB discovery and Gemini 2.5 Flash as soon as free keys are added in `.env`.
5. **Client-Side Watchlist**: Save and manage movies locally in the browser with duplicate prevention and zero forced sign-ups.

---

## 🚀 Features

- **Hero Spotlight**: Dynamic featured title with verified TMDB rating, backdrop, runtime, synopsis, "View Details", "Ask Garuda", and Watchlist toggle.
- **12 Curated Discovery Rails (~40–60 discoverable titles)**:
  - *Trending This Week* (Live TMDB weekly trending)
  - *Critically Acclaimed* (8.0+ verified masterpieces)
  - *Telugu Cinema Spotlight* (Tollywood epics, thrillers & dramas)
  - *Hindi Hits & Classics* (Bollywood inspiring stories & mysteries)
  - *Tamil Cinema Brilliance* (Kollywood vengeance & neo-noir)
  - *Malayalam New Wave* (Mollywood grounded storytelling & survival)
  - *Kannada Powerhouses* (Sandalwood spiritual folklore & action)
  - *Global Sci-Fi & Cinema* (Visionary mind-benders & blockbusters)
  - *Mind-Bending & Twists* (High concept thrillers)
  - *Feel-Good & Comfort Watches* (Warm, uplifting films)
  - *Edge-of-Your-Seat Thrillers* (High-stakes suspense)
  - *Garuda’s Hidden Gems* (Underrated gems)
- **Garuda AI Assistant Drawer**:
  - Multilingual support: English, Telugu, Hindi, Tamil, Malayalam, Kannada.
  - Understands transliterated text and code-switching (*"Mood off undi feel-good kavali"*).
  - Embedded interactive movie cards inside AI chat bubbles with direct modal links.
  - Multi-turn conversation context retention (*"Show me something newer"*, *"Only Telugu movies"*).
  - Quick starter prompt chips and language preference selector.
- **Explore & Filter**:
  - Live debounced search by movie title, director, or cast.
  - Filter by Language (Telugu, Hindi, English, Tamil, Malayalam, Kannada).
  - Filter by Genre (Action, Thriller, Comedy, Sci-Fi, Drama, Romance, etc.).
  - Filter by Minimum Rating (7.0+, 7.5+, 8.0+, 8.5+).
  - Sort by Popularity, Rating, or Release Date.
- **Movie Details Modal**:
  - High-res backdrops, original titles, director, cast list, release year, runtime.
  - "More Like This" similar movies rail.
  - "Ask Garuda about this film" direct deep link.
- **Local Watchlist**:
  - Add/remove titles with single-click heart/bookmark toggles.
  - Stored in browser `localStorage`.
- **Discovery Compliance & Legal**:
  - Strictly discovery-only metadata. Clear streaming disclaimer directing users to lawful authorized services.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Ultra-fast bundling, instant HMR, lightweight SPA bundle (82 kB gzipped) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Modern `@import "tailwindcss"`, custom HSL design tokens, glassmorphism |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable iconography |
| **Backend** | Node.js + Express | Single runtime, keeping API keys private, fast JSON streaming |
| **AI Integration** | Google Gemini 2.5 Flash / 1.5 Flash | Structured JSON intent extraction, multilingual reasoning, ₹0 free tier |
| **Movie Metadata** | TMDB API v3 | Comprehensive global & Indian regional metadata, high-res posters/backdrops |
| **Testing** | Node.js Test Runner (`node:test`) | Built-in zero-dependency test runner with 20 unit, E2E, and HTTP test suites |
| **Deployment** | Render Web Service / Vercel | Single unified process serving API and static SPA under ₹0 free tier |

---

## 📁 Project Structure

```
moviefinder/
├── client/                     # Frontend Single Page Application
│   ├── dist/                   # Production build output (served by Express)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top sticky navigation & brand
│   │   │   ├── HeroSpotlight.jsx   # Featured movie hero with switcher
│   │   │   ├── CollectionRail.jsx  # Horizontal scroll movie rails
│   │   │   ├── MovieCard.jsx       # Interactive movie card with badges
│   │   │   ├── MovieModal.jsx      # Full movie details with cast & similar
│   │   │   ├── GarudaAssistant.jsx # Multilingual AI chat drawer
│   │   │   ├── ExploreView.jsx     # Search & multi-filter discovery view
│   │   │   ├── WatchlistView.jsx   # Local storage watchlist management
│   │   │   └── Footer.jsx          # Attribution & technology footer
│   │   ├── api.js              # Centralized backend API client
│   │   ├── App.jsx             # Main application orchestrator
│   │   ├── index.css           # Design tokens, typography & animations
│   │   └── main.jsx            # React root entry
│   ├── index.html              # SEO metadata & Google Fonts
│   ├── package.json
│   └── vite.config.js          # Vite config with Tailwind & /api proxy
│
├── server/                     # Backend API & AI Integration
│   ├── src/
│   │   ├── services/
│   │   │   ├── dataset.js      # Verified catalogue & starter prompts
│   │   │   ├── tmdb.js         # TMDB client, schema validator & cache
│   │   │   └── gemini.js       # Structured intent parser & Garuda AI
│   │   ├── routes/
│   │   │   ├── health.js       # Health check & integration diagnostics
│   │   │   ├── movies.js       # Movie rails, search, discover & details
│   │   │   └── garuda.js       # Garuda AI chat endpoint
│   │   ├── config.js           # Environment configuration loader
│   │   └── index.js            # Express app entry & static asset server
│   ├── test/
│   │   └── api.test.js         # 20 Unit, E2E & HTTP integration tests
│   └── package.json
│
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git ignore rules protecting credentials
├── package.json                # Root package manager & workspace scripts
└── README.md                   # Complete documentation
```

---

## ⚡ Prerequisites

- **Node.js**: v18.0.0 or later (v20+ or v26 recommended)
- **npm**: v9.0.0 or later

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/moviefinder.git
cd moviefinder

# Install dependencies across root, server, and client
npm run install:all
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development

# Optional but recommended for live AI responses (free at aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional for live global catalogue (free at themoviedb.org/settings/api)
TMDB_API_KEY=your_tmdb_api_key_here
```

> **Note**: If you don't provide API keys immediately, **MovieFinder will still work completely** using its built-in verified dataset and local semantic intent parser!

### 3. Run in Development Mode

```bash
# Starts both Express backend (:5000) and Vite frontend (:3000) concurrently
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🧪 Testing & Quality Assurance

MovieFinder includes 20 comprehensive automated tests covering:
- Dataset verification and schema normalization.
- Homepage discovery collections (40–60 items).
- Search and multi-language filtering.
- Movie details with director, cast, and similar rails.
- Garuda AI English query processing.
- Garuda AI Telugu transliterated query processing (*"Naaku oka manchi thriller movie suggest cheyyi"*).
- Garuda AI Telugu mood-off query processing (*"Mood off undi, something feel-good suggest cheyyi"*).
- Garuda AI Hindi query processing (*"12th Fail jaisi inspiring movie batao"*).
- Garuda AI Tamil, Malayalam, and Kannada parsing.
- Session context retention on follow-up requests (*"Only Telugu movies"*).
- Failure modes, malformed requests, and rate-limit fallbacks.
- Live HTTP server integration tests on ephemeral ports.

Run the test suite:
```bash
npm test
```

Expected output:
```
✔ MovieFinder Core & Data Services
✔ Garuda Multilingual AI Assistant (Unit & End-to-End)
✔ Full HTTP Server Integration (Live Endpoints)
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

---

## 📦 Production Build & Deployment

### Build the Application

```bash
npm run build
```
This builds the optimized production assets into `client/dist`.

### Start the Production Server

```bash
npm start
```
The Express server will start on port `5000` (or the `PORT` environment variable) and serve both the API endpoints (`/api/*`) and the compiled frontend SPA directly.

### Deploying to Render (₹0 Cost Setup)

1. Push your repository to **GitHub**.
2. Sign in to [Render](https://render.com/) (free account).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `moviefinder-garuda`
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (0.1 CPU, 512 MB RAM at ₹0/month)
6. Add Environment Variables under **Environment**:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your free Google AI Studio key)*
   - `TMDB_API_KEY`: *(Your free TMDB Developer key)*
7. Click **Deploy Web Service**.

---

## 💰 ₹0 Budget Architecture & Limits

| Service | Free Tier Allocation | Overage / Rate Limit Behavior | Mitigation |
|---|---|---|---|
| **Render** (Hosting) | 750 free instance hours / month | Spins down after 15 min of inactivity (cold start ~30s on first load) | ₹0 cost. Keep-alive ping or standard cold-start tolerance. |
| **Google Gemini API** | 15 RPM, 1,000,000 TPM, 1,500 RPD | Returns HTTP 429 if rate limit exceeded | Garuda seamlessly falls back to the built-in local semantic parser. No crash. |
| **TMDB API** | Unlimited non-commercial requests (~40 req/10s rate limit) | Returns HTTP 429 if throttled | MovieFinder implements in-memory caching with TTL (30 min) to deduplicate requests. |
| **LocalStorage** | 5–10 MB per browser | QuotaExceededError if full | Stores compact movie IDs and metadata; handles errors gracefully. |

---

## 📜 Licensing & Attribution

- **TMDB Attribution**: This product uses the TMDB API but is not endorsed or certified by TMDB. All movie posters, backdrops, and factual metadata are sourced from The Movie Database (TMDB).
- **Discovery Disclaimer**: MovieFinder does not host, stream, or distribute video media files or torrents. It is exclusively an informational discovery platform.
- **Open Source License**: MIT License. Built for students and developers.
