import { dialog } from '@electron/remote';
import { ipcRenderer as ipc } from 'electron';

/** Reports an error to the user via an error dialog. */
export function throwErr(title: string, content: string): void {
    dialog.showErrorBox(title, content);
}

/** Reports an error to the user via an error dialog **and** quits the program. */
export function throwFatalErr(title: string, content: string): never {
    dialog.showErrorBox(title, content);
    ipc.send('quit-app');
    throw new Error(content);
}
