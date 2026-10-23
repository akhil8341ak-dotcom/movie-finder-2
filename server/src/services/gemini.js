import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { discoverMovies, searchMovies, getMovieDetails } from './tmdb.js';
import { VERIFIED_MOVIES } from './dataset.js';

let genAI = null;
if (config.gemini.apiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  } catch (err) {
    console.warn('[Garuda] Failed to initialize GoogleGenerativeAI:', err.message);
  }
}

// -----------------------------------------------------------------------------
// Intent Extraction Prompts & Helpers
// -----------------------------------------------------------------------------

const SYSTEM_INSTRUCTION = `You are Garuda, an empathetic, highly knowledgeable, and culturally resonant AI movie assistant for MovieFinder.
You specialize in Indian regional cinema (Telugu, Hindi, Tamil, Malayalam, Kannada) and world cinema.

Your goal is to parse user movie discovery requests into structured intent JSON.
Always output valid JSON only. No markdown formatting, no code fences, no extra text.

JSON format:
{
  "detected_language": "te" | "hi" | "ta" | "ml" | "kn" | "en",
  "reply_in_transliteration": boolean,
  "with_original_language": "te" | "hi" | "ta" | "ml" | "kn" | "en" | null,
  "genre": "Thriller" | "Action" | "Comedy" | "Drama" | "Romance" | "Horror" | "Science Fiction" | "Crime" | "Mystery" | null,
  "mood": "feel_good" | "mind_bending" | "intense_thriller" | "emotional_journey" | "adrenaline_rush" | "comfort_watch" | "hidden_gems" | null,
  "search_keyword": string | null,
  "similar_to_title": string | null,
  "min_rating": number | null,
  "release_year": number | null,
  "conversational_reply": string
}

Critical Rules for Language & Movie Language:
- When a user asks in Telugu (or Telugu transliteration like 'Naaku oka manchi thriller suggest cheyyi' or 'Mood off undi'), set "detected_language": "te" AND "with_original_language": "te" unless they explicitly requested another language (e.g. 'Hindi movies lo cheppu').
- When a user asks in Hindi / Hinglish (e.g. '12th Fail jaisi inspiring movie batao'), set "detected_language": "hi" AND "with_original_language": "hi".
- When a user asks in Tamil ('nalla thriller padam sollu'), set "detected_language": "ta" AND "with_original_language": "ta".
- When a user asks in Malayalam or Kannada, set both to 'ml' or 'kn' respectively.
- If the user asks in English with no regional preference (e.g. 'Recommend a mind-bending sci-fi movie'), set "with_original_language": null.
- If the user mentions a specific movie (e.g. 'movies like Interstellar' or 'RRR'), extract it into "similar_to_title".
- Always provide a culturally warm and authentic "conversational_reply" in the user's spoken language.
`;

// -----------------------------------------------------------------------------
// Fallback Rule-Based Semantic Intent Parser
// -----------------------------------------------------------------------------
export function parseIntentLocally(message, sessionContext = {}) {
  const text = (message || '').toLowerCase().trim();

  let detected_language = 'en';
  let with_original_language = sessionContext.with_original_language || null;
  let genre = sessionContext.genre || null;
  let mood = sessionContext.mood || null;
  let search_keyword = null;
  let similar_to_title = null;
  let min_rating = sessionContext.min_rating || null;
  let reply_in_transliteration = false;

  // Language detection & transliteration cues
  if (/(\bnaaku\b|\bcheppu\b|\bcheyyi\b|\bundi\b|\bchudu\b|\bcinema\b|\bmanchi\b|\bedhaina\b|\blo\b|\bmovie\b)/i.test(text) &&
      /(\bnaaku\b|\bcheyyi\b|\bmanchi\b|\bundi\b|\bcheppu\b)/i.test(text)) {
    detected_language = 'te';
    with_original_language = 'te';
    reply_in_transliteration = true;
  } else if (/(\btelugu\b|\btollywood\b)/i.test(text)) {
    detected_language = 'te';
    with_original_language = 'te';
  } else if (/(\bhindi\b|\bbollywood\b|\bbatao\b|\bjaisi\b|\bkoyi\b|\bachi\b|\bkuch\b|\bmujhe\b)/i.test(text)) {
    detected_language = 'hi';
    with_original_language = 'hi';
    if (/(\bbatao\b|\bjaisi\b|\bkoyi\b|\bachi\b|\bkuch\b)/i.test(text)) reply_in_transliteration = true;
  } else if (/(\btamil\b|\bkollywood\b|\bsollu\b|\bpadam\b|\bnalla\b)/i.test(text)) {
    detected_language = 'ta';
    with_original_language = 'ta';
    if (/(\bsollu\b|\bpadam\b|\bnalla\b)/i.test(text)) reply_in_transliteration = true;
  } else if (/(\bmalayalam\b|\bmollywood\b|\bparayu\b|\bcinemakal\b)/i.test(text)) {
    detected_language = 'ml';
    with_original_language = 'ml';
  } else if (/(\bkannada\b|\bsandalwood\b|\bheli\b|\bandha\b)/i.test(text)) {
    detected_language = 'kn';
    with_original_language = 'kn';
  } else if (/(\benglish\b|\bhollywood\b)/i.test(text)) {
    with_original_language = 'en';
  }

  // Genres
  if (/(\bthriller\b|\bsuspense\b|\bmystery\b)/i.test(text)) {
    genre = 'Thriller';
    mood = 'intense_thriller';
  } else if (/(\baction\b|\bfight\b|\bmass\b)/i.test(text)) {
    genre = 'Action';
    mood = 'adrenaline_rush';
  } else if (/(\bcomedy\b|\blaugh\b|\bfunny\b|\bnavvu\b)/i.test(text)) {
    genre = 'Comedy';
    mood = 'feel_good';
  } else if (/(\bsci-fi\b|\bscience fiction\b|\bspace\b|\btime travel\b)/i.test(text)) {
    genre = 'Science Fiction';
    mood = 'mind_bending';
  } else if (/(\bdrama\b|\bemotional\b|\bcrying\b|\bheartfelt\b)/i.test(text)) {
    genre = 'Drama';
    mood = 'emotional_journey';
  } else if (/(\bcrime\b|\bpolice\b|\bdetective\b|\binvestigation\b)/i.test(text)) {
    genre = 'Crime';
  } else if (/(\bhorror\b|\bghost\b|\bscary\b|\bpeyyi\b)/i.test(text)) {
    genre = 'Horror';
  } else if (/(\bromance\b|\blove\b|\bprema\b|\bpyaar\b)/i.test(text)) {
    genre = 'Romance';
  }

  // Moods & feelings
  if (/(\bmood off\b|\bfeel-good\b|\bfeel good\b|\bcomfort\b|\bhappiness\b|\bhappy\b)/i.test(text)) {
    mood = 'feel_good';
    if (!genre) genre = 'Drama';
  } else if (/(\bmind-bending\b|\bmind bending\b|\btwist\b|\btwists\b|\bconcept\b)/i.test(text)) {
    mood = 'mind_bending';
  } else if (/(\bhidden gem\b|\bunderrated\b|\bgems\b)/i.test(text)) {
    mood = 'hidden_gems';
  }

  // Check if user is referencing a specific movie
  const knownTitles = ['interstellar', 'inception', 'rrr', 'kantara', '12th fail', 'drishyam', 'andhadhun', 'jersey', 'maharaja', 'vikram', 'tumbbad', 'hi nanna', 'stree', '3 idiots', 'manjummel boys', 'aavesham'];
  for (const title of knownTitles) {
    if (text.includes(title)) {
      similar_to_title = title;
      search_keyword = title;
      break;
    }
  }

  // Follow-up context refinements:
  if (/(\bnewer\b|\brecent\b|\blatest\b)/i.test(text)) {
    min_rating = 7.5;
  }
  if (/(\bhighest rated\b|\btop rated\b|\bbest\b)/i.test(text)) {
    min_rating = 8.0;
  }
  if (/(\bonly telugu\b|\btelugu matrame\b)/i.test(text)) {
    with_original_language = 'te';
  }
  if (/(\bremove horror\b|\bno horror\b)/i.test(text)) {
    if (genre === 'Horror') genre = null;
  }

  // Craft multilingual conversational response
  let conversational_reply = '';
  if (detected_language === 'te' || (with_original_language === 'te' && reply_in_transliteration)) {
    if (mood === 'feel_good') {
      conversational_reply = 'Mood off ga unte meeku ventane manasuki prashantatha kalpinche feel-good movies ivi! Prathee movie meeku pedda smile isthundi. Kindha verified details chudandi:';
    } else if (genre === 'Thriller') {
      conversational_reply = 'Meeku goosebumps vachhe top-class suspense & thriller Telugu movies ivi! Brilliant twists mariyu tight screenplays tho meeku full entertainment untundi.';
    } else {
      conversational_reply = 'Tappakunda! Meeku kachhitanga nachhe verified Telugu cinema recommendations ivi:';
    }
  } else if (detected_language === 'hi' || (with_original_language === 'hi' && reply_in_transliteration)) {
    if (mood === 'feel_good') {
      conversational_reply = 'Agar mood thoda off hai, toh yeh dil ko chhu lene wali feel-good films zaroor dekhein! Yeh aapka din bana dengi:';
    } else if (genre === 'Thriller') {
      conversational_reply = 'Yeh rahein zabardast suspense aur mind-bending twists se bhare Hindi thrillers! Har film aapko end tak bandhe rakhegi:';
    } else {
      conversational_reply = 'Bilkul! Aapke liye chuni hui behtareen verified Hindi movies niche di gayi hain:';
    }
  } else if (detected_language === 'ta') {
    conversational_reply = 'Kandippaaga! Ungalukku piditha tharamaana verified Tamil thiraipada parindhuraigal idho:';
  } else if (detected_language === 'ml') {
    conversational_reply = 'Theerchayaayum! Nalla authentic storytelling ulla verified Malayalam cinema recommendations thazhe nalkunnu:';
  } else if (detected_language === 'kn') {
    conversational_reply = 'Kandithavagi! Neediya manaranjane niduva verified Kannada chitragalu illive:';
  } else {
    if (genre === 'Thriller' || mood === 'intense_thriller') {
      conversational_reply = 'Here are gripping, verified thrillers with edge-of-your-seat suspense and stunning plot twists:';
    } else if (mood === 'feel_good') {
      conversational_reply = 'When you need a warm, comforting watch to lift your spirits, these heartwarming stories are guaranteed to deliver:';
    } else if (mood === 'mind_bending') {
      conversational_reply = 'Prepare to have your mind blown! Here are visionary mind-bending movies that will keep you guessing:';
    } else {
      conversational_reply = 'Here are verified, top-tier movie recommendations matching your taste:';
    }
  }

  return {
    detected_language,
    reply_in_transliteration,
    with_original_language,
    genre,
    mood,
    search_keyword,
    similar_to_title,
    min_rating,
    release_year: null,
    conversational_reply
  };
}

// -----------------------------------------------------------------------------
// Core Chat Processing
// -----------------------------------------------------------------------------

export async function processGarudaChat({ message, history = [], sessionContext = {}, languagePreference = 'auto' }) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      reply: "Hello! I am Garuda, your personal movie discovery assistant. Tell me what kind of movie you'd like to watch today! (e.g., 'Suggest a good Telugu thriller' or 'Mood off undi, something feel-good')",
      movies: [],
      intent: {},
      sessionContext: {}
    };
  }

  const userQuery = message.trim();
  let intent = null;

  // Attempt structured extraction using Gemini if API key is present
  if (config.gemini.apiKey && genAI) {
    const modelsToTry = [config.gemini.model, config.gemini.fallbackModel].filter(Boolean);
    const contextSummary = history.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Garuda'}: ${h.text}`).join('\n');
    const prompt = `Current Session Context: ${JSON.stringify(sessionContext)}
Language Preference Override: ${languagePreference}
Recent Conversation:
${contextSummary}

User Request: "${userQuery}"

Extract structured intent JSON now:`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_INSTRUCTION,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        intent = JSON.parse(text);
        if (intent) break;
      } catch (err) {
        console.warn(`[Garuda] Gemini model ${modelName} error (${err.message}). Trying fallback...`);
      }
    }
  }

  // Fallback to local semantic intent parser if Gemini is unconfigured or failed
  if (!intent) {
    intent = parseIntentLocally(userQuery, sessionContext);
  }

  // Regional language coherence: if user spoke in an Indian regional language
  // and no specific foreign cinema was requested, default with_original_language to that language
  if (['te', 'hi', 'ta', 'ml', 'kn'].includes(intent.detected_language) && !intent.with_original_language) {
    intent.with_original_language = intent.detected_language;
  }

  // If user has set an explicit language preference override
  if (languagePreference && languagePreference !== 'auto') {
    intent.with_original_language = languagePreference;
    intent.detected_language = languagePreference;
  }

  // ---------------------------------------------------------------------------
  // Retrieve Real, Verified Movie Records
  // ---------------------------------------------------------------------------
  let retrievedMovies = [];

  // Case 1: Specific movie title search or "similar to"
  if (intent.similar_to_title || intent.search_keyword) {
    const query = intent.similar_to_title || intent.search_keyword;
    const searchMatches = await searchMovies(query);
    if (searchMatches.length > 0) {
      const primary = searchMatches[0];
      const details = await getMovieDetails(primary.id);
      retrievedMovies = [details || primary];
      if (details && details.similar && details.similar.length > 0) {
        retrievedMovies.push(...details.similar.slice(0, 4));
      }
    }
  }

  // Case 2: Discover by language, genre, mood, rating
  if (retrievedMovies.length === 0) {
    const discoverResults = await discoverMovies({
      language: intent.with_original_language || undefined,
      genre: intent.genre || undefined,
      minRating: intent.min_rating || undefined,
      year: intent.release_year || undefined
    });

    retrievedMovies = discoverResults;

    // Apply mood filtering if specified
    if (intent.mood && retrievedMovies.length > 0) {
      const moodFiltered = retrievedMovies.filter(m => m.moods && m.moods.includes(intent.mood));
      if (moodFiltered.length >= 2) {
        retrievedMovies = moodFiltered;
      }
    }
  }

  // Deduplicate and limit to top 4-6 high quality recommendations
  const uniqueMovies = [];
  const seenIds = new Set();
  for (const m of retrievedMovies) {
    if (m && !seenIds.has(m.id)) {
      seenIds.add(m.id);
      uniqueMovies.push(m);
    }
    if (uniqueMovies.length >= 6) break;
  }

  // Update session context for natural follow-ups ("Show me something newer", "Only Telugu", etc.)
  const updatedContext = {
    ...sessionContext,
    with_original_language: intent.with_original_language || sessionContext.with_original_language,
    genre: intent.genre || sessionContext.genre,
    mood: intent.mood || sessionContext.mood,
    lastMovieIds: uniqueMovies.map(m => m.id),
    lastQuery: userQuery
  };

  // If no movies matched (unlikely with our robust fallbacks)
  let replyText = intent.conversational_reply;
  if (uniqueMovies.length === 0) {
    replyText = `I couldn't find verified catalogue records matching all of those exact criteria. Would you like to broaden the search (e.g., try another genre or remove rating limits)?`;
  }

  return {
    reply: replyText,
    movies: uniqueMovies,
    intent,
    sessionContext: updatedContext
  };
}
