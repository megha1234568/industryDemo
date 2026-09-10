# Industry Solutions — Desktop App

Your existing HTML pages, wrapped as a real Windows desktop application with
Electron. No browser tab, no address bar, its own taskbar icon, and a native
installer/uninstaller.

## What changed from your old setup

- **`launcher-server.js` and `start-launcher.bat` are no longer needed.**
  Every industry page's "View Demo" button called
  `fetch('http://127.0.0.1:9988/launch?path=...')`, expecting that separate
  Node server to be running. `preload.js` now intercepts those same calls
  from inside the app and opens the file natively via Electron's `shell`
  module — same behavior, zero setup, nothing to keep running in the
  background. None of your 9 HTML pages needed to be edited.
- One broken link was fixed: `index.html`'s Infrastructure card pointed to
  `Infra .html` (with a stray space) which didn't match any file on disk —
  it now points to `Infra.html`.
- A placeholder app icon was added at `build/icon.ico` / `build/icon.png` —
  swap in your own 256×256 PNG / multi-size ICO any time.

## Folder layout

```
industry-app/
├─ app/                 ← your original HTML pages (index.html, auto.html, ...)
├─ build/                ← icon.ico (Windows), icon.png (window/taskbar)
├─ electron-main.js      ← creates the native window, handles native file opening
├─ preload.js            ← shims the old localhost:9988 calls into native calls
├─ package.json          ← app metadata + electron-builder config
└─ README.md
```

## Run it (no install needed to try it)

Requires [Node.js](https://nodejs.org) (you already need this for the old
`start-launcher.bat`, so it's already on your machine).

```bash
cd industry-app
npm install
npm start
```

This opens the app in its own native window immediately — good for testing.

## Build a real, distributable `.exe`

```bash
npm run dist:win
```

This produces a Windows installer at `industry-app/dist/Industry Solutions Setup <version>.exe`.
Run that installer and it creates a Start Menu entry, an optional desktop
shortcut, and installs the app like any normal Windows program — double-click
to open, no browser involved.

> Build this on a Windows machine (or use `npm run dist` on macOS/Linux with
> [Wine](https://www.winehq.org/) installed, since cross-building a Windows
> NSIS installer needs it). If you only ever need to run the app on this
> machine, `npm start` above is all you need — building the installer is
> only for handing the app to other people without them installing Node.

## Updating content later

Just edit the files in `app/` the same way you always have (they're your
original HTML files, untouched). Re-run `npm start` to preview, or
`npm run dist:win` to rebuild the installer.
