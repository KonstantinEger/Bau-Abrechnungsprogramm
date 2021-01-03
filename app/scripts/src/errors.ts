import { dialog } from '@electron/remote';
import { ipcRenderer as ipc } from 'electron';

export function throwErr(title: string, content: string): void {
    dialog.showErrorBox(title, content);
}

export function throwFatalErr(title: string, content: string): never {
    dialog.showErrorBox(title, content);
	ipc.send('quit-app');
	throw new Error(content);
}
