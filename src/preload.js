const { contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('electron', {
    getSources: () => ipcRenderer.invoke('get-sources'),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
    send: (channel, data) => ipcRenderer.send(channel, data),
    createTempFile: (value) => ipcRenderer.invoke('create-temp-file',value),
    blobData: (value) => ipcRenderer.invoke('blob-to-file',value),
    saveData: (value) => ipcRenderer.invoke('save-data',value),
    saveDialog: () => ipcRenderer.invoke('save-dialog')
});
