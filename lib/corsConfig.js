/**
 * Configuration CORS Sécurisée
 *
 * Whitelist les origines autorisées pour empêcher l'accès non autorisé
 * Évite que n'importe quel site puisse appeler le backend
 */

// Liste des origines autorisées (whitelist)
const ALLOWED_ORIGINS = [
  // Production
  'https://halterra.vercel.app',
  'https://halterra-danny.vercel.app',
  'https://halterra-gqtkxmi0p-dannys-projects-ff6db2ea.vercel.app',

  // Développement local
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Alternative port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

/**
 * Configure les headers CORS de manière sécurisée
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - True si origine autorisée, false sinon
 */
function configureCORS(req, res) {
  const origin = req.headers.origin;

  // Vérifier si l'origine est dans la whitelist
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    // Origine autorisée - set headers CORS
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    return true;
  }

  // Origine non autorisée
  console.warn(`🚫 CORS blocked - Unauthorized origin: ${origin || 'unknown'}`);
  return false;
}

/**
 * Middleware CORS qui bloque les requêtes non autorisées
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} - True si autorisé à continuer, false si bloqué
 */
export function handleCORS(req, res) {
  const isAuthorized = configureCORS(req, res);

  // Toujours permettre OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false; // Stop processing (but not an error)
  }

  // Bloquer si origine non autorisée
  if (!isAuthorized && req.headers.origin) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Origin not allowed'
    });
    return false; // Blocked
  }

  return true; // Authorized to continue
}
