import { promises as fs } from 'fs';
import { Project } from './Project';
import { delayEvent, desanitize, sanitize } from './utils';
import { throwFatalErr, throwErr } from './errors';
// @ts-expect-error
import projectTemplate from '../../../project_template.html';

export async function renderProject(project: Project): Promise<void> {
    if (!project) return;

    document.body.innerHTML = '';
    document.title = 'Bau-Abrechnungen | Projekt | ' + project.name;

    document.body.innerHTML = projectTemplate;

    $('#project-name-display').textContent = project.name;
    $('#project-place-display').textContent = project.place;
    $('#project-date-display').textContent = project.date;
    $<HTMLTextAreaElement>('#notes-input').value = desanitize(project.descr);

    renderMatCol(project);
    renderWagesCol(project);
    renderBillCol(project);

    $('#brutto-bill-input').oninput = delayEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLInputElement).value;
        if (!inputValue) return;
        const oldProjStr = sessionStorage.getItem('CURRENT_PROJ');
        const projectLoc = sessionStorage.getItem('CURRENT_PROJ_LOC');
        if (!oldProjStr || !projectLoc) {
            console.warn('WARNING: project-string or filepath from session storage not acceptable');
            return;
        }
        const project = Project.fromCSV(oldProjStr);
        project.brutto = parseFloat(inputValue);
        renderBillCol(project);
        const newCSV = project.toCSV();
        sessionStorage.setItem('CURRENT_PROJ', newCSV);
        try {
            await fs.writeFile(projectLoc, newCSV);
        } catch (err) {
            throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
        }
    }) as (this: GlobalEventHandlers, ev: Event) => any;

    $('#notes-input').oninput = delayEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLTextAreaElement).value;
        const oldProjStr = sessionStorage.getItem('CURRENT_PROJ');
        const projectLoc = sessionStorage.getItem('CURRENT_PROJ_LOC');
        if (!oldProjStr || !projectLoc) {
            console.warn('WARNING: project-string or filepath from session storage not acceptable');
            return;
        }
        const project = Project.fromCSV(oldProjStr);
        project.descr = sanitize(inputValue);
        const newCSV = project.toCSV();
        sessionStorage.setItem('CURRENT_PROJ', newCSV);
        try {
            await fs.writeFile(projectLoc, newCSV);
        } catch (err) {
            throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
        }
    }) as (this: GlobalEventHandlers, ev: Event) => any;

    $('#add-new-material-btn').onclick = () => {
        window.open('./new_material.html', '_blank', 'width=480,height=420');
    }

    $('#add-new-worker-type-btn').onclick = () => {
        window.open('./new_worker_type.html', '_blank', 'width=480,height=420');
    }
}

function $<T = HTMLElement>(selector: string): T {
    const el = document.querySelector(selector) as T | null;
    if (!el) {
        throwFatalErr('Selector-Fehler', `Kann Element ${selector} nicht finden`);
    }
    return el;
}

export function renderMatCol(project: Project): void {
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

export function renderWagesCol(project: Project): void {
    const table = $('#wages-table');
    table.innerHTML = '<tr><th>Typ:</th><th>Stunden:</th><th></th></tr>';
    for (let [idx, data] of project.hours.entries()) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');

        td1.textContent = data.type + ' - ' + data.wage + '€';
        td2.textContent = data.amount.toString();
        const changeInput = document.createElement('input');
        changeInput.type = 'number';
        changeInput.value = '0';
        changeInput.id = '' + idx; // used to refrence it in keyup event
        td3.appendChild(changeInput);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);

        changeInput.addEventListener('keyup', event => {
            if (event.code !== 'Enter') return;
            const eventTarget = event.target as HTMLInputElement;
            const newValue = parseFloat(eventTarget.value);
            const oldProjectStr = sessionStorage.getItem('CURRENT_PROJ');
            const oldProjectLoc = sessionStorage.getItem('CURRENT_PROJ_LOC');
            if (!oldProjectLoc || !oldProjectStr) {
                console.warn('WARNING: project string or filepath from session storage not acceptable');
                return;
            }
            const project = Project.fromCSV(oldProjectStr);
            const listID = parseInt(eventTarget.id);
            project.hours[listID].amount += newValue;
            if (project.hours[listID].amount < 0) {
                throwErr('Fehler', 'Stundenanzahl kann nicht unter 0 sinken.');
                return;
            };
            renderWagesCol(project);
            renderBillCol(project);
            const newCSV = project.toCSV();
            sessionStorage.setItem('CURRENT_PROJ', newCSV);
            fs.writeFile(oldProjectLoc, newCSV)
            .catch(err => throwFatalErr(`FS-Fehler [${err.code}]`, err.message));
        });
    }
}

export function renderBillCol(project: Project): void {
    $<HTMLInputElement>('#brutto-bill-input').value = project.brutto.toString();
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

function calcExpenses(project: Project): [number, number] {
    let matExps = project.materials.reduce((sum, mat) => sum + parseFloat(mat.price), 0);
    let wagesExps = project.hours.reduce((sum, hour) => sum + (hour.amount * hour.wage), 0);
    return [matExps, wagesExps];
}

function roundTo(num: number, decimals: number): number {
    return Math.round(num * (10 ** decimals)) / (10 ** decimals);
}
