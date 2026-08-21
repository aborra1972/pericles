import { contextBridge, ipcRenderer } from 'electron';
import type { LocalConfiguration, BackupSummary } from './config/local-store.js';

contextBridge.exposeInMainWorld('pericles', {
  configuration: {
    load: (): Promise<LocalConfiguration> => ipcRenderer.invoke('configuration:load'),
    save: (configuration: LocalConfiguration): Promise<LocalConfiguration> => ipcRenderer.invoke('configuration:save', configuration),
    defaults: (): Promise<LocalConfiguration> => ipcRenderer.invoke('configuration:defaults'),
    backups: {
      create: (): Promise<BackupSummary> => ipcRenderer.invoke('configuration:backups:create'),
      list: (): Promise<BackupSummary[]> => ipcRenderer.invoke('configuration:backups:list'),
      restore: (id: string): Promise<LocalConfiguration> => ipcRenderer.invoke('configuration:backups:restore', id),
      delete: (id: string): Promise<boolean> => ipcRenderer.invoke('configuration:backups:delete', id),
    },
  },
});
