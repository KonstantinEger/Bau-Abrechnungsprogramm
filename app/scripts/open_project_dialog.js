const { remote } = require('electron');

/**
 * When the open-btn is clicked:
 * [x] open "open file" dialog
 * [x] read file at user specified location
 * [ ] parse string into Project instance
 * [ ] return project to open
 */
async function openProjectDialog() {
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
}

module.exports = openProjectDialog;