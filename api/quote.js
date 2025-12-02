import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

export default async function handler(req, res) {
  // 🔐 CORS SÉCURISÉ - Whitelist origines autorisées
  if (!handleCORS(req, res)) {
    return; // Bloqué ou OPTIONS traité
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ⚡ RATE LIMITING - Protection DoS
  const rateLimit = checkRateLimit(req, '/api/quote');
  addRateLimitHeaders(res, { ...rateLimit, endpoint: '/api/quote' });

  if (!rateLimit.allowed) {
    console.warn(`🚫 Rate limit exceeded for quote - IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  try {
    // Récupérer une citation inspirante de Quotable pour l'affichage
    const quoteResponse = await fetch('https://api.quotable.io/random?tags=inspirational|wisdom|life&maxLength=120');

    if (!quoteResponse.ok) {
      throw new Error('Quotable API error');
    }

    const quoteData = await quoteResponse.json();

    return res.status(200).json({
      quote: quoteData.content,
      author: quoteData.author
    });
  } catch (error) {
    console.error('Error fetching quote:', error);

    // Fallback quotes en cas d'erreur - Large collection
    const fallbackQuotes = [
      { quote: "Le moment présent est tout ce que nous avons vraiment", author: "Thich Nhat Hanh" },
      { quote: "La paix vient de l'intérieur. Ne la cherche pas à l'extérieur", author: "Bouddha" },
      { quote: "Respire. Laisse aller. Et rappelle-toi que ce moment même est le seul que tu es sûr d'avoir", author: "Oprah Winfrey" },
      { quote: "La vie n'est disponible que dans le moment présent", author: "Thich Nhat Hanh" },
      { quote: "Ton calme intérieur est ton super pouvoir", author: "Anonyme" },
      { quote: "La méditation apporte la sagesse; le manque de méditation laisse l'ignorance", author: "Bouddha" },
      { quote: "L'esprit est comme l'eau. Quand il est turbulent, il est difficile de voir. Quand il est calme, tout devient clair", author: "Prasad Mahes" },
      { quote: "Le secret du changement est de concentrer toute ton énergie non pas à combattre l'ancien, mais à construire le nouveau", author: "Socrate" },
      { quote: "Dans la tranquillité se trouve la plus haute forme de l'intelligence", author: "Eckhart Tolle" },
      { quote: "La méditation, c'est l'action de ne rien faire", author: "Thich Nhat Hanh" },
      { quote: "Tu ne peux pas arrêter les vagues, mais tu peux apprendre à surfer", author: "Jon Kabat-Zinn" },
      { quote: "La conscience est le témoin silencieux de toute expérience", author: "Ramana Maharshi" },
      { quote: "Entre le stimulus et la réponse, il y a un espace. Dans cet espace se trouve notre pouvoir de choisir", author: "Viktor Frankl" },
      { quote: "Le calme n'est pas l'absence de bruit, mais la présence de paix", author: "Anonyme" },
      { quote: "Méditer, c'est s'offrir un rendez-vous avec soi-même", author: "Anonyme" },
      { quote: "La sérénité n'est pas l'absence de tempête, mais la paix malgré la tempête", author: "Anonyme" },
      { quote: "Ton esprit est un jardin. Tes pensées sont les graines. Tu peux cultiver des fleurs ou des mauvaises herbes", author: "Anonyme" },
      { quote: "La simplicité est la sophistication suprême", author: "Léonard de Vinci" },
      { quote: "Regarde profondément dans la nature et tu comprendras tout mieux", author: "Albert Einstein" },
      { quote: "Le bonheur n'est pas quelque chose de prêt à l'emploi. Il vient de tes propres actions", author: "Dalaï Lama" },
      { quote: "Sois le changement que tu veux voir dans le monde", author: "Gandhi" },
      { quote: "Dans chaque instant se trouve la possibilité d'une nouvelle naissance", author: "Anonyme" },
      { quote: "L'acceptation de ce qui est, est la fin de toute souffrance", author: "Eckhart Tolle" },
      { quote: "Le silence est la langue de Dieu, tout le reste est une mauvaise traduction", author: "Rumi" },
      { quote: "La pleine conscience signifie prêter attention d'une manière particulière: intentionnellement, dans le moment présent", author: "Jon Kabat-Zinn" },
      { quote: "Chaque souffle est une chance de recommencer", author: "Anonyme" },
      { quote: "L'âme toujours entend un admonition dans tout ce qui lui arrive", author: "Ralph Waldo Emerson" },
      { quote: "La vraie méditation est d'être totalement présent à chaque instant", author: "Anonyme" },
      { quote: "Nous sommes façonnés par nos pensées; nous devenons ce que nous pensons", author: "Bouddha" },
      { quote: "Le voyage de mille lieues commence par un seul pas", author: "Lao Tseu" }
    ];

    const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

    return res.status(200).json(randomFallback);
  }
}
