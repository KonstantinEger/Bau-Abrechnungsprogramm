const { dialog } = require('@electron/remote');
const ipc = require('electron').ipcRenderer;

export function throwErr(title, content) {
    dialog.showErrorBox(title, content);
}

export function throwFatalErr(title, content) {
    dialog.showErrorBox(title, content);
    ipc.send('quit-app');
}
