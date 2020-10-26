const { promises: fs } = require('fs');
const { join } = require('path');

async function renderProject(project) {
	if (!project) return;

	document.body.innerHTML = '';
	document.title = 'Bau-Abrechnungen | Projekt | ' + project.name;

	await loadCSSandHTML();

	$('#project-name-display').textContent = project.name;
	$('#project-place-display').textContent = project.place;
	$('#project-date-display').textContent = project.date;
	$('#notes-input').value = project.descr;
}

function $(selector) {
	return document.querySelector(selector);
}

async function loadCSSandHTML() {
	const styleLink = document.createElement('link');
	styleLink.rel = 'stylesheet';
	styleLink.href = join(__dirname, '../../styles/project.css');
	document.head.appendChild(styleLink);

	const htmlSrcPath = join(__dirname, '../../project_template.html');
	document.body.innerHTML = await fs.readFile(htmlSrcPath, 'utf8');
}

module.exports = renderProject;