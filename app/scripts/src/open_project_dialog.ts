const remote = require('@electron/remote');
const { promises: fs } = require('fs');
import { Project } from './lib/Project';
import { throwFatalErr } from './errors';

/**
 * When the open-btn is clicked:
 * [x] open "open file" dialog
 * [x] read file at user specified location
 * [ ] parse string into Project instance
 * [ ] return project to open
 */
export async function openProjectDialog() {
    const dialog = remote.dialog;
    const browserWin = remote.getCurrentWindow();

    let opts = {
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
    sessionStorage.setItem('CURRENT_PROJ', csvString);
    sessionStorage.setItem('CURRENT_PROJ_LOC', filePaths[0]);
    return Project.fromCSV(csvString);
}
