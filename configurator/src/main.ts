import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONFIGURATION, LocalConfigurationStore } from './config/local-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    frame: true,
    movable: true,
    resizable: true,
    title: 'Pericles Configurador',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
  return win;
}

app.whenReady().then(() => {
  const store = new LocalConfigurationStore(app.getPath('userData'));
  ipcMain.handle('configuration:load', () => store.load());
  ipcMain.handle('configuration:save', (_event, configuration: unknown) => store.save(configuration));
  ipcMain.handle('configuration:defaults', () => structuredClone(DEFAULT_CONFIGURATION));
  ipcMain.handle('configuration:backups:create', () => store.createBackup());
  ipcMain.handle('configuration:backups:list', () => store.listBackups());
  ipcMain.handle('configuration:backups:restore', (_event, id: unknown) => typeof id === 'string' ? store.restoreBackup(id) : Promise.reject(new Error('Invalid backup id')));
  ipcMain.handle('configuration:backups:delete', (_event, id: unknown) => typeof id === 'string' ? store.deleteBackup(id) : false);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
