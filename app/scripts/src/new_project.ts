import * as remote from '@electron/remote';
import { isInvalid, sanitize } from './lib/utils';
import { throwErr, throwFatalErr } from './lib/errors';
import { Project } from './lib/Project';
import { promises as fs } from 'fs';

document.getElementById('submit-btn')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('project-name-input') as HTMLInputElement;
    const placeInput = document.getElementById('project-place-input') as HTMLInputElement;
    const dateInput = document.getElementById('project-date-input') as HTMLInputElement;
    const notesInput = document.getElementById('project-notes-input') as HTMLTextAreaElement;
    nameInput.classList.remove('invalid');
    placeInput.classList.remove('invalid');
    dateInput.classList.remove('invalid');

    /* input validation */
    {
        let exitDueToError = false;
        if (nameInput.value.length === 0 || isInvalid(nameInput.value)) {
            nameInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (placeInput.value.length === 0 || isInvalid(placeInput.value)) {
            placeInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (dateInput.value.length === 0) {
            dateInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (exitDueToError) {
            throwErr('Eingabefehler', 'Alle Felder mit einem roten * müssen richtig ausgefüllt sein (kein , oder ")');
            return;
        }
    }

    const dialog = remote.dialog;
    const browserWin = remote.getCurrentWindow();
    const opts = {
        title: 'Neues Projekt speichern',
        defaultPath: `${process.env.HOME || process.env.HOMEPATH}\\${nameInput.value}.tbvp.csv`,
        buttonLabel: 'Neues Bauprojekt Speichern',
        filters: [
            { name: 'Bauprojekt', extensions: ['tbvp.csv'] },
            { name: 'Alle Datein', extensions: ['*'] }
        ]
    };
    const { canceled, filePath } = await dialog.showSaveDialog(browserWin, opts);
    if (canceled || !filePath) return;

    const project = new Project({
        name: nameInput.value,
        date: dateInput.value,
        place: placeInput.value,
        description: sanitize(notesInput.value),
        brutto: 0,
        shouldGenID: true
    });

    try {
        await fs.writeFile(filePath, project.toCSV());
    } catch (err) {
        throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
    }

    window.opener.postMessage({
        name: 'NEW_PROJECT',
        project,
        filePath
    });

    window.close();
});

document.getElementById('close-window-btn')?.addEventListener('click', window.close);
