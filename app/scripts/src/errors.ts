const { dialog } = require('@electron/remote');
const ipc = require('electron').ipcRenderer;

export function throwErr(title: string, content: string): void {
    dialog.showErrorBox(title, content);
}

export function throwFatalErr(title: string, content: string): never {
    dialog.showErrorBox(title, content);
	ipc.send('quit-app');
	throw new Error(content);
}
