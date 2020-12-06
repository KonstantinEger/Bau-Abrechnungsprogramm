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

	renderBillCol(project);
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

function renderBillCol(project) {
	$('#brutto-bill-input').value = project.brutto;
	const mwst = 0.19;
	const netto = project.brutto - (project.brutto * mwst);
	$('#netto-bill-display').textContent = roundTo(netto, 2) + '€';

	const expenses = calcTotalExpenses(project);
	const bilanz = netto - expenses;
	$('#bilanz-euros-display').textContent = roundTo(bilanz, 2) + '€';
	$('#bilanz-percent-display').textContent = roundTo((bilanz / netto) * 100, 2) + '%';
	if (bilanz < 0) $('#bilanz-display').classList.add('negative');
}

function calcTotalExpenses(project) {
	let matExps = project.materials.reduce((sum, mat) => sum + parseFloat(mat.price), 0);
	let wagesExps = project.hours.reduce((sum, hour) => sum + (hour.amount * hour.wage), 0);
	return matExps + wagesExps;
}

function roundTo(num, decimals) {
	return Math.round(num * (10 ** decimals)) / (10 ** decimals);
}

module.exports = renderProject;