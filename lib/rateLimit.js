/**
 * Rate Limiting Middleware - Protection Professionnelle
 *
 * Système de rate limiting en mémoire avec tracking IP
 * Protection contre les abus et runaway costs
 *
 * Limites configurées:
 * - Méditation: 10 requêtes / heure / IP (coût élevé: AI + Audio)
 * - Audio: 15 requêtes / heure / IP (coût moyen: ElevenLabs)
 * - Quote: 60 requêtes / heure / IP (gratuit, mais protection DoS)
 */

// Store en mémoire pour tracking des requêtes
// Structure: { ip: { endpoint: { count: number, resetTime: timestamp } } }
const rateLimitStore = new Map();

// Configuration des limites par endpoint
const RATE_LIMITS = {
  '/api/meditation': {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: 'Limite de méditations atteinte. Veuillez patienter avant de générer une nouvelle méditation.'
  },
  '/api/audio': {
    maxRequests: 15,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: 'Limite de génération audio atteinte. Veuillez réessayer dans quelques minutes.'
  },
  '/api/quote': {
    maxRequests: 60,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: 'Trop de requêtes. Veuillez patienter un instant.'
  }
};

/**
 * Extrait l'IP réelle du client (gère les proxies Vercel)
 */
function getClientIP(req) {
  // Vercel fournit l'IP dans ces headers
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * Nettoie les entrées expirées du store (garbage collection)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, endpoints] of rateLimitStore.entries()) {
    for (const [endpoint, data] of Object.entries(endpoints)) {
      if (now > data.resetTime) {
        delete endpoints[endpoint];
      }
    }
    // Si l'IP n'a plus d'endpoints actifs, la supprimer
    if (Object.keys(endpoints).length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Middleware de rate limiting
 * @param {Object} req - Request object
 * @param {string} endpoint - Endpoint path (e.g., '/api/meditation')
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: number, message?: string }
 */
export function checkRateLimit(req, endpoint) {
  // Cleanup périodique (toutes les 100 requêtes environ)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  const clientIP = getClientIP(req);
  const config = RATE_LIMITS[endpoint];

  if (!config) {
    // Endpoint non configuré = pas de limite
    return { allowed: true, remaining: Infinity, resetTime: 0 };
  }

  const now = Date.now();

  // Récupérer ou initialiser les données de l'IP
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, {});
  }

  const ipData = rateLimitStore.get(clientIP);

  // Récupérer ou initialiser les données de l'endpoint
  if (!ipData[endpoint] || now > ipData[endpoint].resetTime) {
    ipData[endpoint] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }

  const endpointData = ipData[endpoint];

  // Vérifier si la limite est atteinte
  if (endpointData.count >= config.maxRequests) {
    const retryAfter = Math.ceil((endpointData.resetTime - now) / 1000); // en secondes
    return {
      allowed: false,
      remaining: 0,
      resetTime: endpointData.resetTime,
      retryAfter,
      message: config.message
    };
  }

  // Incrémenter le compteur
  endpointData.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - endpointData.count,
    resetTime: endpointData.resetTime,
    used: endpointData.count
  };
}

/**
 * Ajoute les headers de rate limiting standards à la réponse
 */
export function addRateLimitHeaders(res, rateLimit) {
  res.setHeader('X-RateLimit-Limit', RATE_LIMITS[rateLimit.endpoint]?.maxRequests || 'N/A');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

  if (!rateLimit.allowed && rateLimit.retryAfter) {
    res.setHeader('Retry-After', rateLimit.retryAfter);
  }
}

/**
 * Retourne les statistiques du rate limiter (pour monitoring)
 */
export function getRateLimitStats() {
  const stats = {
    totalIPs: rateLimitStore.size,
    endpoints: {},
    timestamp: new Date().toISOString()
  };

  for (const [ip, endpoints] of rateLimitStore.entries()) {
    for (const [endpoint, data] of Object.entries(endpoints)) {
      if (!stats.endpoints[endpoint]) {
        stats.endpoints[endpoint] = {
          totalRequests: 0,
          activeIPs: 0
        };
      }
      stats.endpoints[endpoint].totalRequests += data.count;
      stats.endpoints[endpoint].activeIPs++;
    }
  }

  return stats;
}

/**
 * Reset manuel du rate limit pour une IP (utile pour debugging)
 */
export function resetRateLimit(ip, endpoint = null) {
  if (!rateLimitStore.has(ip)) {
    return false;
  }

  if (endpoint) {
    const ipData = rateLimitStore.get(ip);
    delete ipData[endpoint];
    if (Object.keys(ipData).length === 0) {
      rateLimitStore.delete(ip);
    }
  } else {
    rateLimitStore.delete(ip);
  }

  return true;
}
