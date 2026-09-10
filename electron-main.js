const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#f5f6f8',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false, // lets preload patch window.fetch for the launcher shim below
      sandbox: false
    }
  });

  // Remove the default File/Edit/View menu bar for a cleaner, native app feel
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Any genuinely external link (http/https, e.g. the Google Fonts / Tabler CDN
  // references or a future "mailto:" link) opens in the system browser instead
  // of inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* ─────────────────────────────────────────────────────────
   Native file launcher — replaces launcher-server.js.
   Every industry page's "View Demo" button ends up calling
   fetch('http://127.0.0.1:9988/launch?path=...'); the preload
   script intercepts that call and routes it here via IPC, so
   files open with the Windows-default app with no separate
   server process required.
───────────────────────────────────────────────────────── */
const ALLOWED_EXTS = new Set([
  'exe', 'msi', 'bat', 'cmd', 'ps1',
  'ppt', 'pptx', 'pdf', 'html', 'htm',
  'mp4', 'mov', 'avi', 'mkv', 'webm',
  'xlsx', 'xls', 'docx', 'doc', 'txt',
  'jpg', 'jpeg', 'png', 'gif'
]);

ipcMain.handle('launch-file', async (event, filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    return { ok: false, error: 'No file path provided' };
  }

  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  if (!ALLOWED_EXTS.has(ext)) {
    return { ok: false, error: 'File type not allowed: ' + ext };
  }

  try {
    // shell.openPath opens the file with its OS-default application
    // (for .exe/.bat this runs it directly) and resolves with an
    // empty string on success, or an error message on failure.
    const errorMessage = await shell.openPath(filePath);
    if (errorMessage) {
      return { ok: false, error: errorMessage };
    }
    return { ok: true, file: filePath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
