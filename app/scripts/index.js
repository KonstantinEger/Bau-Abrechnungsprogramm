/**
 * Removes welcome and sets up project view
 * @param {Project} project
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
	document.getElementById('notes-input').value = project.descr;
}

(() => {

	window.onmessage = async ({ data }) => {
		if (data.name === 'OPEN_PROJECT') await openProject(data.project);
	};

	document.querySelector('#btn-new').addEventListener('click', () => {
		window.open('./new_project.html', '_blank', 'width=800,height=600');
	});

	document.querySelector('#btn-open').addEventListener('click', () => {
		require('./scripts/open_project_dialog')().then(openProject);
	});
})();