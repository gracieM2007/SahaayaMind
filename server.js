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
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;

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
        return serveFile(dirIndex, res);
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

    serveFile(resolvedPath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.on('error', (streamErr) => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('500 Internal Server Error');
  });
  stream.pipe(res);
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
