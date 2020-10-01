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

	const htmlSrcPath = join(__dirname, './projectTemplate.html');
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

	const newProjBtn = document.querySelector('#btn-new');
	const openProjBtn = document.querySelector('#btn-open');

	newProjBtn.addEventListener('click', () => {
		window.open('./newProject.html', '_blank', 'width=800,height=600');
	});

	openProjBtn.addEventListener('click', () => {
		window.open('./openProject.html', '_blank', 'width=1000,height=600');
	});

	// uncomment next call to skip project seletion on start
	// openProject({
	// 	name: '%projectname%',
	// 	id: 0,
	// 	place: '%place%',
	// 	date: '%date%',
	// 	notes: '%notes%'
	// });

})();