const { remote } = require('electron');
const { promises: fs } = require('fs');

const { Project } = require('./scripts/lib/Project');

document.getElementById('create-project-btn').addEventListener('click', async () => {
	const nameInput = document.getElementById('project-name-input');
	const placeInput = document.getElementById('project-place-input');
	const dateInput = document.getElementById('project-date-input');
	const notesInput = document.getElementById('project-notes-input');
	nameInput.classList.remove('invalid');
	placeInput.classList.remove('invalid');
	dateInput.classList.remove('invalid');

	// input validation
	{
		let exitDueToError = false;
		if (nameInput.value.length === 0) {
			nameInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (placeInput.value.length === 0) {
			placeInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (dateInput.value.length === 0) {
			dateInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (exitDueToError) return;
	}

	// save-dialog
	const dialog = remote.dialog;
	const browserWin = remote.getCurrentWindow();
	let opts = {
		title: 'Neues Projekt speichern',
		defaultPath : (process.env.HOME || process.env.HOMEPATH) + `\\${nameInput.value}.tbvp.csv`,
		buttonLabel : 'Neues Bauprojekt Speichern',
		filters :[
			{name: 'Bauprojekt', extensions: ['tbvp.csv']},
			{name: 'Alle Datein', extensions: ['*']}
		]
	}
	let { canceled, filePath } = await dialog.showSaveDialog(browserWin, opts);
	if (canceled || !filePath) return;

	// create project instance and write to disk
	const project = new Project(
		nameInput.value,
		dateInput.value,
		placeInput.value,
		notesInput.value,
		0,
		[],
		[]
		);
	// TODO: Error-handling with fs-errors
	await fs.writeFile(filePath, project.toCSV());

	window.close();
});

document.getElementById('close-window-btn').addEventListener('click', window.close);