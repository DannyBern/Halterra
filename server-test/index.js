/**
 * Serveur de test local pour Halterra Lite - Fonctionnalité de partage
 * Port par défaut: 3001
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage en mémoire pour les liens courts (Redis simulation)
const shortLinks = new Map();

// Stockage des analytics (Base de données simulation)
const analytics = [];

// Logs colorés pour le terminal
const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
};

/**
 * Route de santé
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Génération d'image de partage (simulée)
 * POST /api/share/generate
 */
app.post('/api/share/generate', async (req, res) => {
  const { session, format, includeQuote } = req.body;

  log.info(`Generating ${format} image for mood: ${session.mood.name}`);

  // Simuler un délai de génération réaliste
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dimension = format === 'story' ? '1080x1920' : '1080x1080';
  const width = format === 'story' ? 1080 : 1080;
  const height = format === 'story' ? 1920 : 1080;

  // Extraire la couleur du mood (retirer le #)
  const color = session.mood.color.replace('#', '');
  const moodText = encodeURIComponent(session.mood.name);

  // Générer une URL placeholder
  const imageUrl = `https://via.placeholder.com/${dimension}/${color}/ffffff?text=${moodText}`;

  log.success(`Image generated: ${imageUrl}`);

  res.json({
    success: true,
    media: {
      url: imageUrl,
      type: 'image',
      width,
      height,
      format: 'png',
      size: 125000,
    },
  });
});

/**
 * Création de lien court
 * POST /api/share/link
 */
app.post('/api/share/link', async (req, res) => {
  const { sessionId, excerpt, mood, intention } = req.body;

  log.info(`Creating short link for session: ${sessionId}`);

  // Générer un ID court unique
  const shortId = crypto.randomBytes(4).toString('hex');

  // Stocker le mapping en mémoire
  shortLinks.set(shortId, {
    sessionId,
    excerpt,
    mood,
    intention,
    createdAt: Date.now(),
    clicks: 0,
  });

  const shortUrl = `http://localhost:${PORT}/s/${shortId}`;

  log.success(`Short link created: ${shortUrl}`);

  res.json({
    success: true,
    shortUrl,
    shortId,
  });
});

/**
 * Redirection depuis lien court
 * GET /s/:shortId
 */
app.get('/s/:shortId', (req, res) => {
  const { shortId } = req.params;
  const link = shortLinks.get(shortId);

  if (!link) {
    log.error(`Link not found: ${shortId}`);
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lien introuvable - Halterra</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 3rem; margin: 0; }
            p { font-size: 1.25rem; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔍 Lien introuvable</h1>
            <p>Ce lien de partage n'existe pas ou a expiré.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Incrémenter les clics
  link.clicks++;

  log.success(`Link clicked: ${shortId} (${link.clicks} clicks total)`);

  // Rediriger vers l'app locale
  res.redirect(`http://localhost:5173/session/${link.sessionId}`);
});

/**
 * Métadonnées Open Graph
 * GET /api/share/og/:shortId
 */
app.get('/api/share/og/:shortId', (req, res) => {
  const { shortId } = req.params;
  const link = shortLinks.get(shortId);

  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  const ogData = {
    title: `${link.intention || 'Ma méditation'} - Halterra`,
    description: link.excerpt,
    image: `https://via.placeholder.com/1200x630/${link.mood.color.replace('#', '')}/ffffff?text=${encodeURIComponent(link.mood.name)}`,
    url: `http://localhost:${PORT}/s/${shortId}`,
    type: 'article',
    site_name: 'Halterra',
  };

  log.info(`Open Graph metadata requested for: ${shortId}`);

  res.json(ogData);
});

/**
 * Tracking des partages
 * POST /api/analytics/share
 */
app.post('/api/analytics/share', (req, res) => {
  const { platform, sessionId, mood, category, timestamp } = req.body;

  analytics.push({
    platform,
    sessionId,
    mood,
    category,
    timestamp: timestamp || Date.now(),
  });

  log.success(`Share tracked: ${platform} (session: ${sessionId})`);

  res.json({ success: true });
});

/**
 * Dashboard analytics (BONUS)
 * GET /api/analytics/dashboard
 */
app.get('/api/analytics/dashboard', (req, res) => {
  const summary = {
    totalShares: analytics.length,
    totalLinks: shortLinks.size,
    byPlatform: {},
    byMood: {},
    recentShares: analytics.slice(-10).reverse(),
  };

  // Agréger par plateforme
  analytics.forEach((share) => {
    summary.byPlatform[share.platform] = (summary.byPlatform[share.platform] || 0) + 1;
    summary.byMood[share.mood] = (summary.byMood[share.mood] || 0) + 1;
  });

  // Ajouter les statistiques de clics
  let totalClicks = 0;
  shortLinks.forEach((link) => {
    totalClicks += link.clicks;
  });
  summary.totalClicks = totalClicks;

  res.json(summary);
});

/**
 * Page d'accueil du serveur de test
 */
app.get('/', (req, res) => {
  const linksCount = shortLinks.size;
  const sharesCount = analytics.length;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Halterra Test Server</title>
        <style>
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 2rem;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 2rem;
            backdrop-filter: blur(10px);
          }
          h1 {
            margin: 0 0 1rem 0;
            font-size: 2.5rem;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
          }
          .stat {
            background: rgba(255, 255, 255, 0.15);
            padding: 1.5rem;
            border-radius: 16px;
            text-align: center;
          }
          .stat-value {
            font-size: 3rem;
            font-weight: 700;
            margin: 0;
          }
          .stat-label {
            font-size: 1rem;
            opacity: 0.9;
            margin: 0.5rem 0 0 0;
          }
          .endpoints {
            margin: 2rem 0;
          }
          .endpoint {
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 12px;
            margin: 0.5rem 0;
            font-family: 'Courier New', monospace;
          }
          .method {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-weight: 700;
            margin-right: 0.5rem;
          }
          .get { background: #10b981; }
          .post { background: #3b82f6; }
          a {
            color: white;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            display: inline-block;
            margin-top: 1rem;
            transition: all 0.2s;
          }
          a:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🧪 Halterra Test Server</h1>
          <p>Serveur de test local pour la fonctionnalité de partage social</p>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${linksCount}</div>
              <div class="stat-label">Liens créés</div>
            </div>
            <div class="stat">
              <div class="stat-value">${sharesCount}</div>
              <div class="stat-label">Partages trackés</div>
            </div>
            <div class="stat">
              <div class="stat-value">✓</div>
              <div class="stat-label">Serveur actif</div>
            </div>
          </div>

          <div class="endpoints">
            <h3>📡 Endpoints disponibles:</h3>
            <div class="endpoint">
              <span class="method post">POST</span>
              /api/share/generate
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              /api/share/link
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              /s/:shortId
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              /api/share/og/:shortId
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              /api/analytics/share
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              /api/analytics/dashboard
            </div>
          </div>

          <a href="/api/analytics/dashboard" target="_blank">
            📊 Voir le dashboard analytics
          </a>
        </div>
      </body>
    </html>
  `);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  log.success(`Test server running on http://localhost:${PORT}`);
  log.info(`Frontend expected on http://localhost:5173`);
  log.info(`Analytics dashboard: http://localhost:${PORT}/api/analytics/dashboard`);
  console.log('='.repeat(60) + '\n');
});

// Gestion graceful shutdown
process.on('SIGINT', () => {
  log.warn('Shutting down server...');
  process.exit(0);
});
