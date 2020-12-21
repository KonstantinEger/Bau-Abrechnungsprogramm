const { dialog } = require('@electron/remote');
const ipc = require('electron').ipcRenderer;

function throwErr(title, content) {
    dialog.showErrorBox(title, content);
}

function throwFatalErr(title, content) {
    dialog.showErrorBox(title, content);
    ipc.send('quit-app');
}

module.exports = {
    throwErr,
    throwFatalErr
};
