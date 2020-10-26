const { remote } = require('electron');

/**
 * Removes welcome and sets up project view
 * @param {{
 *  name: string,
 *  id: number,
 *  place: string,
 *  date: string,
 *  notes: string
 * }} project
 */
async function openProject(project) {
	if (!project) return;

	document.body.innerHTML = '';
	document.title = 'Bau-Abrechnungen | Projekt | ' + project.name;

	const { promises: fs } = require('fs');
	const { join } = require('path');

	const styleLink = document.createElement('link');
	styleLink.rel = 'stylesheet';
	styleLink.href = join(__dirname, './styles/project.css');
	document.head.appendChild(styleLink);

	const htmlSrcPath = join(__dirname, './project_template.html');
	document.body.innerHTML = await fs.readFile(htmlSrcPath, 'utf8');

	document.getElementById('project-name-display').textContent = project.name;
	document.getElementById('project-place-display').textContent = project.place;
	document.getElementById('project-date-display').textContent = project.date;
	document.getElementById('notes-input').value = project.notes;
}

(() => {

	window.onmessage = async ({ data }) => {
		if (data.name === 'OPEN_PROJECT') {
			await openProject(data.project);
			return;
		}
	};

	/**
	 * When the new-btn is clicked
	 * - open a new BrowserWindow where the user can input
	 *   relevant data for the project
	 * - input is validated
	 * - new Project instance is sent to main window ("OPEN_PROJECT")
	 *   and opened
	 */
	document.querySelector('#btn-new').addEventListener('click', () => {
		window.open('./new_project.html', '_blank', 'width=800,height=600');
	});

	/**
	 * When the open-btn is clicked:
	 * - open "open file" dialog
	 * - read file at user specified location
	 * - parse string into Project instance
	 * - open project
	 */
	document.querySelector('#btn-open').addEventListener('click', async () => {

		const dialog = remote.dialog;
		const browserWin = remote.getCurrentWindow();

		let opts = {
			title: 'Bauprojekt öffnen',
			defaultPath: process.env.HOME || process.env.HOMEPATH,
			buttonLabel: 'Öffnen',
			filters: [
				{name: 'Bauprojekt', extensions: ['tbvp.csv']},
				{name: 'CSV', extensions: ['csv']},
				{name: 'Alle Datein', extensions: ['*']}
			],
			properties: ['openFile']
		};

		const { canceled, filePaths } = await dialog.showOpenDialog(browserWin, opts);
		if (canceled || filePaths.length === 0) return;

		// TODO: read and parse file
		// call 'openProject' with data
	});
})();