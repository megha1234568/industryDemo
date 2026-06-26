/**
 * ─────────────────────────────────────────────────────────
 *  Rockwell ACE – Local File Launcher Server
 *  Run once: node launcher-server.js
 *  Then open your HTML file in Chrome/Edge — clicking any
 *  card in "General Interactive Demos" will open .exe /
 *  .ppt / .html etc. directly via Windows Shell (ShellExecute).
 * ─────────────────────────────────────────────────────────
 */

const http  = require('http');
const { exec } = require('child_process');
const path  = require('path');
const url   = require('url');

const PORT  = 9988;   // must match the HTML file
const ALLOWED_EXTS = new Set([
  'exe','msi','bat','cmd','ps1',
  'ppt','pptx','pdf','html','htm',
  'mp4','mov','avi','mkv','webm',
  'xlsx','xls','docx','doc','txt'
]);

const server = http.createServer((req, res) => {
  // ── CORS: allow the local HTML file to call this server ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed   = url.parse(req.url, true);
  const filePath = parsed.query.path;

  // ── /launch?path=C:\path\to\file.exe ──
  if (parsed.pathname === '/launch' && filePath) {
    const ext = path.extname(filePath).replace('.', '').toLowerCase();

    if (!ALLOWED_EXTS.has(ext)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'File type not allowed: ' + ext }));
      return;
    }

    // Windows: start "" opens the file with its default app
    // Wrapping the path in quotes handles spaces in folder names
    const cmd = `start "" "${filePath}"`;
    console.log('[LAUNCH]', filePath);

    exec(cmd, { shell: 'cmd.exe' }, (err) => {
      if (err) {
        console.error('[ERROR]', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, file: filePath }));
      }
    });
    return;
  }

  // ── /ping – health check ──
  if (parsed.pathname === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: 'Launcher server running' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Unknown endpoint' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ✅  Rockwell ACE Launcher Server');
  console.log(`  🌐  Listening on http://127.0.0.1:${PORT}`);
  console.log('  📂  Will open: exe, msi, bat, ppt, pptx, pdf, html, mp4 …');
  console.log('');
  console.log('  Keep this window open while using the dashboard.');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});