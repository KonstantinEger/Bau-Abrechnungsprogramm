import { promises as fs } from 'fs';
import * as remote from '@electron/remote';
import { Project } from './Project';
import { throwFatalErr } from './errors';

/**
 * Opens a dialog window where the user selects a file to be loaded as a
 * project, which is then parsed and returned as a new instance.
 */
export async function openProjectDialog(): Promise<Project | undefined> {
    const dialog = remote.dialog;
    const browserWin = remote.getCurrentWindow();

    const opts: remote.OpenDialogOpts = {
        title: 'Bauprojekt öffnen',
        defaultPath: process.env.HOME || process.env.HOMEPATH,
        buttonLabel: 'Öffnen',
        filters: [
            { name: 'Bauprojekt', extensions: ['tbvp.csv'] },
            { name: 'CSV', extensions: ['csv'] },
            { name: 'Alle Datein', extensions: ['*'] }
        ],
        properties: ['openFile']
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(browserWin, opts);
    if (canceled || filePaths.length === 0) return;

    let csvString;
    try {
        csvString = await fs.readFile(filePaths[0], 'utf8');
    } catch (err) {
        throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
    }
    const project = Project.fromCSV(csvString);
    project.saveToSessionStorage({ filePath: filePaths[0], csvString });
    return project;
}
