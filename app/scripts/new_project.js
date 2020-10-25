const { remote } = require('electron');
const { promises: fs } = require('fs');

function genID() {
	const s5 = () => Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);

	return `${s5()}-${s5()}-${s5()}`;
}

function genCSVfromProject(project) {
	return 'id,name,date,place,description,brutto,m-names,m-prices,h-types,h-amounts,h-wages,\n'
		+ `${project.id},${project.name},${project.date},${project.place},${project.notes},0,,,,,,`
}

document.getElementById('create-project-btn').addEventListener('click', async () => {
	const nameInput = document.getElementById('project-name-input');
	const placeInput = document.getElementById('project-place-input');
	const dateInput = document.getElementById('project-date-input');
	const notesInput = document.getElementById('project-notes-input');
	nameInput.classList.remove('invalid');
	placeInput.classList.remove('invalid');
	dateInput.classList.remove('invalid');

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

	const dialog = remote.dialog;
	const browserWin = remote.getCurrentWindow();

	// https://www.brainbell.com/javascript/show-save-dialog.html

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

	const project = {
		id: genID(),
		name: nameInput.value,
		date: dateInput.value,
		place: placeInput.value,
		notes: notesInput.value
	}

	await fs.writeFile(filePath, genCSVfromProject(project));

	window.opener.postMessage({
		name: 'OPEN_PROJECT',
		project
	});

	window.close();
});

document.getElementById('close-window-btn').addEventListener('click', window.close);