const path = require('node:path');

function getRendererEntryPath(app) {
  return path.join(app.getAppPath(), 'src', 'index.html');
}

function createMainWindow(BrowserWindow, entryPath) {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 900,
    minHeight: 680,
    title: 'Karak Ghori',
    backgroundColor: '#08090b',
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.loadFile(entryPath);
  return window;
}

module.exports = { createMainWindow, getRendererEntryPath };
