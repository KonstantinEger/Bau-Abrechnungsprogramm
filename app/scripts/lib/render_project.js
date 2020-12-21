const { promises: fs } = require('fs');
const { join } = require('path');
const { Project } = require('./Project');

async function renderProject(project) {
    if (!project) return;

    document.body.innerHTML = '';
    document.title = 'Bau-Abrechnungen | Projekt | ' + project.name;

    await loadCSSandHTML();

    $('#project-name-display').textContent = project.name;
    $('#project-place-display').textContent = project.place;
    $('#project-date-display').textContent = project.date;
    $('#notes-input').value = project.descr;

    renderMatCol(project);
    renderWagesCol(project);
    renderBillCol(project);

    $('#brutto-bill-input').oninput = event => {
        const oldProjStr = sessionStorage.getItem('CURRENT_PROJ');
        if (!oldProjStr) {
            console.warn('WARNING: project string from session storage not acceptable');
            return
        }
        const project = Project.fromCSV(oldProjStr);
        project.brutto = parseFloat(event.target.value);
        sessionStorage.setItem('CURRENT_PROJ', project.toCSV());
        renderBillCol(project);
    }

    $('#add-new-material-btn').onclick = () => {
        window.open('./new_material.html', '_blank', 'width=480,height=420');
    }

    $('#add-new-worker-type-btn').onclick = () => {
        window.open('./new_worker_type.html', '_blank', 'width=480,height=420');
    }
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

function renderMatCol(project) {
    const table = $('#mat-table');
    table.innerHTML = '<tr><th>Name:</th><th>Rechnungsnummer:</th><th>Betrag in €:</th></tr>';
    for (let mat of project.materials) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td1.textContent = mat.name;
        td2.textContent = mat.receiptID;
        td3.textContent = mat.price;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }
}

function renderWagesCol(project) {
    const table = $('#wages-table');
    table.innerHTML = '<tr><th>Typ:</th><th>Stunden:</th><th></th></tr>';
    for (let data of project.hours) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');

        td1.textContent = data.type + ' - ' + data.wage + '€';
        td2.textContent = data.amount;

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }
}

function renderBillCol(project) {
    $('#brutto-bill-input').value = project.brutto;
    const mwst = 0.19;
    const netto = project.brutto - (project.brutto * mwst);
    $('#netto-bill-display').textContent = roundTo(netto, 2) + '€';

    const expenses = calcExpenses(project);
    const bilanz = netto - (expenses[0] + expenses[1]);
    $('#material-costs-display').textContent = roundTo(expenses[0], 2) + '€';
    $('#wages-costs-display').textContent = roundTo(expenses[1], 2) + '€';
    $('#bilanz-euros-display').textContent = roundTo(bilanz, 2) + '€';
    $('#bilanz-percent-display').textContent = netto !== 0
        ? roundTo((bilanz / netto) * 100, 2) + '%'
        : '0.00%';

    const bilanzDisp = $('#bilanz-display');
    if (bilanz < 0) bilanzDisp.classList.add('negative')
    else bilanzDisp.classList.remove('negative');
}

function calcExpenses(project) {
    let matExps = project.materials.reduce((sum, mat) => sum + parseFloat(mat.price), 0);
    let wagesExps = project.hours.reduce((sum, hour) => sum + (hour.amount * hour.wage), 0);
    return [matExps, wagesExps];
}

function roundTo(num, decimals) {
    return Math.round(num * (10 ** decimals)) / (10 ** decimals);
}

module.exports = {
    renderProject,
    renderWagesCol,
    renderMatCol,
    renderBillCol
};
