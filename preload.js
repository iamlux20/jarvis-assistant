const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Send events from renderer to main
  triggerWakeWord: () => ipcRenderer.send('wake-word'),
  sendVoiceCommand: (text) => ipcRenderer.send('voice-command', text),

  // Receive events from main to renderer
  onWakeWord: (callback) => ipcRenderer.on('wake-word', callback),
});