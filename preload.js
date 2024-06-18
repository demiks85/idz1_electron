const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (content) => ipcRenderer.invoke('save-file-dialog', content)
});
