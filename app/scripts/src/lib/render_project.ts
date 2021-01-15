import { promises as fs } from 'fs';
import { Project } from './Project';
import { debounceEvent, desanitize, isInvalid, sanitize } from './utils';
import { throwFatalErr, throwErr } from './errors';
// @ts-expect-error
import projectTemplate from '../../../project_template.html';

/**
 * Renders the **full** project view, meaning header, material-, worker-
 * and bill column. Event listeners for inputs are also setup here.
 */
export async function renderProject(project: Project): Promise<void> {
    if (!project) return;

    document.body.innerHTML = '';
    document.title = 'Bau-Abrechnungen | Projekt | ' + project.name;

    document.body.innerHTML = projectTemplate;

    renderHeader(project);
    renderMatCol(project);
    renderWagesCol(project);
    renderBillCol(project);

    $('#brutto-bill-input').oninput = debounceEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLInputElement).value;
        if (!inputValue) return;
        const { filePath, project } = Project.getCurrentProject();
        project.brutto = parseFloat(inputValue);
        renderBillCol(project);
        const newCSV = project.saveToSessionStorage();
        try {
            await fs.writeFile(filePath, newCSV);
        } catch (err) {
            throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
        }
    }) as (this: GlobalEventHandlers, ev: Event) => any;

    $('#notes-input').oninput = debounceEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLTextAreaElement).value;
        const { filePath, project } = Project.getCurrentProject();
        project.descr = sanitize(inputValue);
        const newCSV = project.saveToSessionStorage();
        try {
            await fs.writeFile(filePath, newCSV);
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

/** Select a Element (shortcut for document.querySelector) and throws if none found. */
function $<T = HTMLElement>(selector: string): T {
    const el = document.querySelector(selector) as T | null;
    if (!el) {
        throwFatalErr('Selector-Fehler', `Kann Element ${selector} nicht finden`);
    }
    return el;
}

enum HeaderDisplayType {
    NAME,
    PLACE,
    DATE
}

/** Renders the header for the project view */
function renderHeader(project: Project): void {
    const nameDisplay = $('#project-name-display');
    const placeDisplay = $('#project-place-display');
    const dateDisplay = $('#project-date-display');
    const descrInput = $<HTMLTextAreaElement>('#notes-input');
    nameDisplay.textContent = project.name;
    placeDisplay.textContent = project.place;
    dateDisplay.textContent = new Date(project.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    descrInput.value = desanitize(project.descr);
    nameDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.NAME));
    placeDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.PLACE));
    dateDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.DATE));
}

/**
 * Event handler, which when fired, turns the contents of the display
 * element into an input with its old content as the value. This also
 * sets up event listeners which handle changes to these inputs for
 * saving the new data.
 */
function setupHeaderEditInputs(elementType: HeaderDisplayType) {
    return (event: MouseEvent): void => {
        const eventTarget = event.target as HTMLSpanElement;
        eventTarget.innerHTML = '';
        const inputEl = document.createElement('input');
        inputEl.type = elementType === HeaderDisplayType.DATE ? 'date' : 'text';
        const { project, filePath } = Project.getCurrentProject();
        switch (elementType) {
            case HeaderDisplayType.NAME:
                inputEl.value = project.name;
                break;
            case HeaderDisplayType.PLACE:
                inputEl.value = project.place;
                break;
            case HeaderDisplayType.DATE:
                inputEl.value = project.date;
                break;
        }
        inputEl.addEventListener('change', editInputHandlerForHeader(elementType, project, filePath));
        eventTarget.appendChild(inputEl);
    }
}

/**
 * Event handler for edit input elements in the header of the project view.
 * When fired, gets the value from the input, checks if it's valid and updates
 * the current project in web storage and on disk. That's why it requires
 * the current project and filePath as parameters, which theoretically shouldn't
 * be out of sync by then. Calls a re-render of the header at the end.
 */
function editInputHandlerForHeader(elementType: HeaderDisplayType, project: Project, projectFilePath: string) {
    return async (event: Event) => {
        const inputEl = event.target as HTMLInputElement;
        inputEl.classList.remove('invalid');
        const newVal = inputEl.value;
        if (!newVal || isInvalid(newVal)) {
            inputEl.classList.add('invalid');
            throwErr('Eingabefehler', 'Feld darf nicht leer sein und darf keine , oder " enthalten.');
            return;
        }
        switch (elementType) {
            case HeaderDisplayType.NAME:
                project.name = newVal;
                break;
            case HeaderDisplayType.PLACE:
                project.place = newVal;
                break;
            case HeaderDisplayType.DATE:
                project.date = newVal;
                break;
        }
        const projectCSV = project.saveToSessionStorage();
        try {
            await fs.writeFile(projectFilePath, projectCSV);
        } catch (err) {
            throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
        }
        renderHeader(project);
    }
}

enum MatColumnIDs {
    Name = 0,
    Receipt = 1,
    Price = 2
}

/** Renders **only** the materials table. (no footer) */
export function renderMatCol(project: Project): void {
    const table = $('#mat-table');
    table.innerHTML = '<tr><th>Name:</th><th>Rechnungsnummer:</th><th>Betrag in €:</th></tr>';

    for (let [idx, mat] of project.materials.entries()) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td1.textContent = mat.name;
        td2.textContent = mat.receiptID;
        td3.textContent = mat.price;
        td1.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIDs.Name));
        td2.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIDs.Receipt));
        td3.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIDs.Price));
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
    }
}

/**
 * Event handler for a Material table cell, which when called, turns the
 * contents of the cell into an HTMLInputElement for editing.
 */
function setupMatEditInput(rowIdx: number, colID: MatColumnIDs) {
    return (event: MouseEvent) => {
        const eventTarget = event.target as HTMLTableDataCellElement;
        const oldVal = eventTarget.textContent;
        if (!oldVal) return;
        const inputEl = document.createElement('input');
        inputEl.value = oldVal;
        if (colID === MatColumnIDs.Price) inputEl.type = 'number';
        inputEl.addEventListener('keyup', editInputHandlerForCell(rowIdx, colID));
        eventTarget.innerHTML = '';
        eventTarget.appendChild(inputEl);
    };
}

/**
 * Keyup event handler on an HTMLInputElement in a Material column cell, which
 * updates the current Project with the new Data in the input field when `ENTER`
 * is pressed. If the Data is invalid, i. e. contains `,` or `"`, the user is
 * alerted with an error and saving is aborted. If not, the whole column (also
 * bill) is re-rendered, meaning the input field is converted back into text.
 */
function editInputHandlerForCell(rowIdx: number, colID: MatColumnIDs) {
    return async (event: KeyboardEvent) => {
        if (event.code !== 'Enter') return;
        const eventTarget = event.target as HTMLInputElement;
        eventTarget.classList.remove('invalid');
        const newValue = eventTarget.value;
        if (!newValue || isInvalid(newValue)) {
            eventTarget.classList.add('invalid');
            throwErr('Eingabefehler', 'Feld darf nicht leer sein und darf keine , oder " enthalten.');
            return;
        }
        const { filePath, project } = Project.getCurrentProject();
        switch (colID) {
            case MatColumnIDs.Name: {
                project.materials[rowIdx].name = newValue;
                break;
            }
            case MatColumnIDs.Receipt: {
                project.materials[rowIdx].receiptID = newValue;
                break;
            }
            case MatColumnIDs.Price: {
                project.materials[rowIdx].price = newValue;
                break;
            }
        };
        const newCSV = project.saveToSessionStorage();
        try {
            await fs.writeFile(filePath, newCSV);
        } catch (err) {
            throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
        }
        renderMatCol(project);
        renderBillCol(project);
    };
}

/** Renders **only** the worker table with event listeners. (no footer) */
export function renderWagesCol(project: Project): void {
    const table = $('#wages-table');
    table.innerHTML = '<tr><th>Typ:</th><th>Stunden:</th><th></th></tr>';

    const keyUpHandler = (event: KeyboardEvent) => {
        if (event.code !== 'Enter') return;
        const eventTarget = event.target as HTMLInputElement;
        const newValue = parseFloat(eventTarget.value);
        const { project, filePath } = Project.getCurrentProject();
        const listID = parseInt(eventTarget.id);
        project.hours[listID].amount += newValue;
        if (project.hours[listID].amount < 0) {
            throwErr('Fehler', 'Stundenanzahl kann nicht unter 0 sinken.');
            return;
        };
        renderWagesCol(project);
        renderBillCol(project);
        const newCSV = project.saveToSessionStorage();
        fs.writeFile(filePath, newCSV)
            .catch(err => throwFatalErr(`FS-Fehler [${err.code}]`, err.message));
    };

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

        changeInput.addEventListener('keyup', keyUpHandler);
    }
}

/**
 * Renders the bill column **and** the footers for the material and worker cols
 * because with this all calculations with money are concentrated here.
 */
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

/** Sums up all expenses of a `Project` */
function calcExpenses(project: Project): [number, number] {
    let matExps = project.materials.reduce((sum, mat) => sum + parseFloat(mat.price), 0);
    let wagesExps = project.hours.reduce((sum, hour) => sum + (hour.amount * hour.wage), 0);
    return [matExps, wagesExps];
}

/** Rounds numbers to a specific amount of decimal places. */
function roundTo(num: number, decimals: number): number {
    return Math.round(num * (10 ** decimals)) / (10 ** decimals);
}
