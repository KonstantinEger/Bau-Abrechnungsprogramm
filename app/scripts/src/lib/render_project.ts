import { debounceEvent, desanitize, isInvalid, sanitize } from './utils';
import { throwErr, throwFatalErr } from './errors';
import { Project } from './Project';
import projectTemplate from '../../../project_template.html';

/**
 * Renders the **full** project view, meaning header, material-, worker-
 * and bill column. Event listeners for inputs are also setup here.
 */
export async function renderProject(project: Project): Promise<void> {
    if (!project) return;

    document.body.innerHTML = '';
    document.title = `Bau-Abrechnungen | Projekt | ${project.name}`;

    document.body.innerHTML = projectTemplate;

    renderHeader(project, { addDblclickListeners: true });
    renderMatCol(project);
    renderWorkersCol(project);
    renderBillCol(project);

    $('#brutto-bill-input').oninput = debounceEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLInputElement).value;
        if (!inputValue) return;
        const { filePath, project: currentProject } = Project.getCurrentProject();
        currentProject.brutto = parseFloat(inputValue);
        await currentProject.save(filePath);
        renderBillCol(currentProject);
    }) as (this: GlobalEventHandlers, ev: Event) => unknown;

    $('#notes-input').oninput = debounceEvent(750, async (event: InputEvent) => {
        const inputValue = (event.target as HTMLTextAreaElement).value;
        const { filePath, project: currentProject } = Project.getCurrentProject();
        currentProject.descr = sanitize(inputValue);
        await currentProject.save(filePath);
    }) as (this: GlobalEventHandlers, ev: Event) => unknown;

    $('#add-new-material-btn').onclick = () => {
        window.open('./new_material.html', '_blank', 'width=480,height=420');
    };

    $('#add-new-worker-type-btn').onclick = () => {
        window.open('./new_worker_type.html', '_blank', 'width=480,height=420');
    };
}

/** Select a Element (shortcut for document.querySelector) and throws if none found. */
function $<T = HTMLElement>(selector: string): T {
    const el = document.querySelector(selector) as T | null;
    if (!el) {
        throwFatalErr('Selector-Fehler', `Kann Element ${selector} nicht finden`);
    }
    return el;
}

interface RenderHeaderOptions {
    addDblclickListeners?: boolean;
}

enum HeaderDisplayType {
    NAME = 'name',
    PLACE = 'place',
    DATE = 'date'
}

/**
 * Renders the header for the project view.
 * ! Only adds the `dblclick` listeners to the property fields when specified so in the `opts` object.
 * This should **only** be the case for the initial render, as the event listeners would keep stacking,
 * slowing down the app and leading to bugs.
 * TODO: Find a better solution
 */
function renderHeader(project: Project, opts?: RenderHeaderOptions): void {
    const nameDisplay = $('#project-name-display');
    const placeDisplay = $('#project-place-display');
    const dateDisplay = $('#project-date-display');
    const descrInput = $<HTMLTextAreaElement>('#notes-input');
    nameDisplay.textContent = project.name;
    placeDisplay.textContent = project.place;
    const dateIntlOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    dateDisplay.textContent = new Date(project.date).toLocaleDateString('de-DE', dateIntlOptions);
    descrInput.value = desanitize(project.descr);
    if (opts?.addDblclickListeners === true) {
        nameDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.NAME));
        placeDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.PLACE));
        dateDisplay.addEventListener('dblclick', setupHeaderEditInputs(HeaderDisplayType.DATE));
    }
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
        const oldValue = eventTarget.textContent;
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
        inputEl.addEventListener('blur', () => {
            eventTarget.textContent = oldValue;
        });
        eventTarget.appendChild(inputEl);
        inputEl.focus();
    };
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
        project[elementType] = newVal;
        await project.save(projectFilePath);
        renderHeader(project);
    };
}

enum MatColumnIds {
    NAME = 0,
    RECEIPT = 1,
    PRICE = 2
}

/** Renders **only** the materials table. (no footer) */
export function renderMatCol(project: Project): void {
    const table = $('#mat-table');
    table.innerHTML = '<tr><th>Name:</th><th>Rechnungsnummer:</th><th>Betrag in €:</th></tr>';

    for (const [idx, mat] of project.materials.entries()) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td1.textContent = mat.name;
        td2.textContent = mat.receiptId;
        td3.textContent = mat.price;
        td1.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIds.NAME));
        td2.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIds.RECEIPT));
        td3.addEventListener('dblclick', setupMatEditInput(idx, MatColumnIds.PRICE));
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
function setupMatEditInput(rowIdx: number, colId: MatColumnIds) {
    return (event: MouseEvent) => {
        const eventTarget = event.target as HTMLTableDataCellElement;
        const oldVal = eventTarget.textContent;
        if (!oldVal) return;
        const inputEl = document.createElement('input');
        inputEl.value = oldVal;
        if (colId === MatColumnIds.PRICE) inputEl.type = 'number';
        inputEl.addEventListener('keyup', editInputHandlerForCell(rowIdx, colId));
        inputEl.addEventListener('blur', () => { eventTarget.textContent = oldVal; });
        eventTarget.innerHTML = '';
        eventTarget.appendChild(inputEl);
        inputEl.focus();
    };
}

/**
 * Keyup event handler on an HTMLInputElement in a Material column cell, which
 * updates the current Project with the new Data in the input field when `ENTER`
 * is pressed. If the Data is invalid, i. e. contains `,` or `"`, the user is
 * alerted with an error and saving is aborted. If not, the whole column (also
 * bill) is re-rendered, meaning the input field is converted back into text.
 */
function editInputHandlerForCell(rowIdx: number, colId: MatColumnIds) {
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
        switch (colId) {
            case MatColumnIds.NAME: {
                project.materials[rowIdx].name = newValue;
                break;
            }
            case MatColumnIds.RECEIPT: {
                project.materials[rowIdx].receiptId = newValue;
                break;
            }
            case MatColumnIds.PRICE: {
                project.materials[rowIdx].price = newValue;
                break;
            }
        }
        await project.save(filePath);
        renderMatCol(project);
        renderBillCol(project);
    };
}

/** Renders **only** the worker table with event listeners. (no footer) */
export function renderWorkersCol(project: Project): void {
    const table = $('#workers-table');
    table.innerHTML = '<tr><th>Typ:</th><th>Stunden:</th><th></th></tr>';

    const keyUpHandler = async (event: KeyboardEvent) => {
        if (event.code !== 'Enter') return;
        const eventTarget = event.target as HTMLInputElement;
        const newValue = parseFloat(eventTarget.value);
        const { project: currentProject, filePath } = Project.getCurrentProject();
        const listId = parseInt(eventTarget.id);
        currentProject.workers[listId].numHours += newValue;
        if (currentProject.workers[listId].numHours < 0) {
            throwErr('Fehler', 'Stundenanzahl kann nicht unter 0 sinken.');
            return;
        }
        await project.save(filePath);
        renderWorkersCol(currentProject);
        renderBillCol(currentProject);
    };

    for (const [idx, data] of project.workers.entries()) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');

        td1.textContent = `${data.type} - ${data.wage}€`;
        td2.textContent = data.numHours.toString();
        const changeInput = document.createElement('input');
        changeInput.type = 'number';
        changeInput.value = '0';
        changeInput.id = idx.toString(); // used to refrence it in keyup event
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
    $('#netto-bill-display').textContent = `${roundTo(netto, 2)}€`;

    const expenses = calcExpenses(project);
    const bilanz = netto - (expenses[0] + expenses[1]);
    $('#material-costs-display').textContent = `${roundTo(expenses[0], 2)}€`;
    $('#workers-costs-display').textContent = `${roundTo(expenses[1], 2)}€`;
    $('#bilanz-euros-display').textContent = `${roundTo(bilanz, 2)}€`;
    $('#bilanz-percent-display').textContent = netto !== 0
        ? `${roundTo((bilanz / netto) * 100, 2)}%`
        : '0.00%';

    const bilanzDisp = $('#bilanz-display');
    if (bilanz < 0) bilanzDisp.classList.add('negative');
    else bilanzDisp.classList.remove('negative');
}

/** Sums up all expenses of a `Project` */
function calcExpenses(project: Project): [number, number] {
    const matExps = project.materials.reduce((sum, mat) => sum + parseFloat(mat.price), 0);
    const wagesExps = project.workers.reduce((sum, worker) => sum + (worker.numHours * worker.wage), 0);
    return [matExps, wagesExps];
}

/** Rounds numbers to a specific amount of decimal places. */
function roundTo(num: number, decimals: number): number {
    return Math.round(num * (10 ** decimals)) / (10 ** decimals);
}
