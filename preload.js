const { ipcRenderer } = require('electron');

/* ─────────────────────────────────────────────────────────
   Every industry page (auto.html, cement.html, chemical.html,
   cpg.html, Infra.html, life.html, metal.html, oil.html) has
   its own embedded script that calls:
     fetch('http://127.0.0.1:9988/ping')
     fetch('http://127.0.0.1:9988/launch?path=...')
   expecting the old launcher-server.js to be running.

   Instead of editing eight separate files, this preload script
   transparently intercepts those specific calls and answers
   them natively via IPC — so "Launcher Ready" shows immediately
   and "View Demo" opens files directly, no external Node
   process or start-launcher.bat required.
───────────────────────────────────────────────────────── */
const LAUNCHER_PORT = 9988;
const LAUNCHER_PREFIX = `http://127.0.0.1:${LAUNCHER_PORT}`;

const nativeFetch = window.fetch.bind(window);

window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : (input && input.url) || '';

  if (url.startsWith(LAUNCHER_PREFIX)) {
    const parsed = new URL(url);

    if (parsed.pathname === '/ping') {
      return new Response(
        JSON.stringify({ ok: true, message: 'Native launcher ready' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (parsed.pathname === '/launch') {
      const filePath = parsed.searchParams.get('path');
      try {
        const result = await ipcRenderer.invoke('launch-file', filePath);
        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 500,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, error: String(err) }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return nativeFetch(input, init);
};
