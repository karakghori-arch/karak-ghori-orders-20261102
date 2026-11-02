function startDesktopApp(app, BrowserWindow, createWindow, platform = process.platform) {
  const ready = app.whenReady().then(() => {
    app.setAppUserModelId('com.karakghori.desktop');
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (platform !== 'darwin') app.quit();
  });
  return ready;
}

module.exports = { startDesktopApp };
