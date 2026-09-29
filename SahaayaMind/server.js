/**
 * ============================================================================
 * SahaayaMind - Local Development Server
 * Smart India Hackathon 2026 (SIH26003) | Team Arbalest
 * ============================================================================
 * Pure Node.js zero-dependency HTTP server for running SahaayaMind locally.
 * Usage: node server.js
 * ============================================================================
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;
const SERVER_GEMINI_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KU6d46a-jagUMWcg_SDDMqwTR_mNAF84Qq36pup3Ajvg';
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

// Load Memory Logistics Engine for server-side scoring
const MemoryLogistics = require('./js/memoryLogistics.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  // 0. Handle Memory Logistics API routes
  if (req.url.startsWith('/api/memory/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    if (req.url === '/api/memory/calculate-score' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const timeSec = parseFloat(payload.timeSeconds) || 45;
          const attempts = parseInt(payload.attempts, 10) || 4;
          const matches = parseInt(payload.matches || payload.matchesFound, 10) || 4;
          const pairs = parseInt(payload.totalPairs, 10) || 4;

          const result = MemoryLogistics.calculatePerformance(timeSec, attempts, matches, pairs);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, overallScore: result.overallScore, ...result }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    if (req.url === '/api/memory/streak-info' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        streakRule: 'Continuous device-local streak recorded forever',
        formula: 'Overall Performance = 45% Accuracy + 30% Attempt Efficiency + 25% Time Pacing',
        targetDemographic: 'Elderly individuals with neurological or cognitive challenges',
        norms: MemoryLogistics.NORMS
      }));
    }
  }

  // 1. Handle Gemini AI API routes
  if (req.url.startsWith('/api/gemini/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    if (req.url === '/api/gemini/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        hasEnvKey: Boolean(SERVER_GEMINI_KEY),
        defaultModel: DEFAULT_GEMINI_MODEL,
        supportedLanguages: ['en', 'hi', 'mr', 'as', 'brx']
      }));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(body || '{}');
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }

        const effectiveKey = (parsed.apiKey || SERVER_GEMINI_KEY || '').trim();
        if (!effectiveKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            error: 'No Gemini API key provided. Set GEMINI_API_KEY environment variable or enter it in Gemini Settings.'
          }));
        }

        const model = parsed.model || DEFAULT_GEMINI_MODEL;
        const targetPath = `/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(effectiveKey)}`;

        const geminiReq = https.request({
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: targetPath,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }, geminiRes => {
          let gData = '';
          geminiRes.on('data', c => { gData += c; });
          geminiRes.on('end', () => {
            res.writeHead(geminiRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(gData);
          });
        });

        geminiReq.on('error', gErr => {
          console.error('[Gemini Proxy Error]:', gErr);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proxy failed to reach Google Gemini API', details: gErr.message }));
        });

        const forwardPayload = {
          contents: parsed.contents || [],
          generationConfig: parsed.generationConfig || {
            temperature: 0.65,
            topP: 0.95,
            maxOutputTokens: 800
          }
        };
        if (parsed.systemInstruction) {
          forwardPayload.systemInstruction = parsed.systemInstruction;
        }

        geminiReq.write(JSON.stringify(forwardPayload));
        geminiReq.end();
      });
      return;
    }
  }

  // 1. Decode requested path and strip query strings
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Normalize root path to index.html
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  // Security check: ensure path is inside project root
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(PUBLIC_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access Denied');
  }

  fs.stat(resolvedPath, (err, stats) => {
    // If path is a directory, check for index.html inside it
    if (!err && stats.isDirectory()) {
      const dirIndex = path.join(resolvedPath, 'index.html');
      if (fs.existsSync(dirIndex)) {
        return serveFile(dirIndex, req, res);
      }
    }

    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>404 Not Found — SahaayaMind</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0a1128; color: #f8fafc; padding: 3rem; text-align: center; }
            h1 { font-size: 2.5rem; margin-bottom: 0.5rem; color: #38bdf8; }
            p { font-size: 1.25rem; color: #94a3b8; margin-bottom: 2rem; }
            a { color: #5eead4; text-decoration: none; font-weight: bold; border: 2px solid #5eead4; padding: 0.75rem 1.5rem; border-radius: 8px; }
            a:hover { background: #5eead4; color: #0a1128; }
          </style>
        </head>
        <body>
          <h1>404 — Page Not Found</h1>
          <p>The requested URL <code>${reqPath}</code> was not found.</p>
          <a href="/index.html">← Back to SahaayaMind Home</a>
        </body>
        </html>
      `);
    }

    serveFile(resolvedPath, req, res);
  });
});

// High-speed in-memory asset cache & compression engine
const FILE_CACHE = new Map();

function serveFile(filePath, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isCompressible = /^(text\/|application\/javascript|application\/json|image\/svg\+xml)/.test(contentType);

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('500 Internal Server Error');
    }

    const etag = `W/"${stats.size}-${stats.mtimeMs}"`;
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304);
      return res.end();
    }

    const cached = FILE_CACHE.get(filePath);
    if (cached && cached.mtimeMs === stats.mtimeMs) {
      return sendPayload(cached.raw, cached.gzipped, contentType, etag, ext, req, res);
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }

      if (isCompressible) {
        zlib.gzip(data, (gzErr, gzipped) => {
          const entry = {
            mtimeMs: stats.mtimeMs,
            raw: data,
            gzipped: !gzErr ? gzipped : null
          };
          FILE_CACHE.set(filePath, entry);
          sendPayload(entry.raw, entry.gzipped, contentType, etag, ext, req, res);
        });
      } else {
        const entry = { mtimeMs: stats.mtimeMs, raw: data, gzipped: null };
        FILE_CACHE.set(filePath, entry);
        sendPayload(entry.raw, null, contentType, etag, ext, req, res);
      }
    });
  });
}

function sendPayload(rawBuffer, gzippedBuffer, contentType, etag, ext, req, res) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const canGzip = gzippedBuffer && acceptEncoding.includes('gzip');
  const cacheControl = (ext === '.html') ? 'no-cache' : 'public, max-age=86400';

  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': cacheControl,
    'ETag': etag
  };

  if (canGzip) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    res.end(gzippedBuffer);
  } else {
    res.writeHead(200, headers);
    res.end(rawBuffer);
  }
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.warn(`[!] Port ${PORT} is in use. Attempting fallback on port ${fallbackPort}...`);
    server.listen(fallbackPort, () => logRunning(fallbackPort));
  } else {
    console.error('Server error:', e);
  }
});

server.listen(PORT, () => {
  logRunning(PORT);
});

function logRunning(port) {
  console.log('================================================================');
  console.log('🧠  SahaayaMind AI Cognitive Wellness Platform');
  console.log('    Smart India Hackathon 2026 (SIH26003) | Team Arbalest');
  console.log('================================================================');
  console.log(`📡  Local Host Server is LIVE!`);
  console.log(`🔗  Main Portal:     http://localhost:${port}/`);
  console.log(`🏠  Dashboard:       http://localhost:${port}/pages/dashboard.html`);
  console.log(`🧠  Memory Game:     http://localhost:${port}/pages/memory.html`);
  console.log(`🎯  Attention Game:  http://localhost:${port}/pages/attention.html`);
  console.log(`📊  Progress:        http://localhost:${port}/pages/progress.html`);
  console.log(`🩺  Doctor Advisory: http://localhost:${port}/pages/ai-insights.html`);
  console.log(`💬  AI Companion:    http://localhost:${port}/pages/chat.html`);
  console.log('================================================================');
  console.log('Press Ctrl + C in terminal to stop the server anytime.');
}
