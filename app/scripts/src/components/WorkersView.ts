import * as styles from './common_styles';
import { $, Validation, roundNum } from '../lib/utils';
import { AppState } from './AppState';
import { ProjectUpdatedEvent } from '../lib/events';
import type { Worker } from '../lib/Project';

const template = document.createElement('template');
template.innerHTML = `
<style>
    ${styles.columnBody('.col-body')}
    ${styles.columnFooter('.col-footer')}
    ${styles.columnFooterCost('#worker-costs-display')}
    ${styles.columnHeading('.heading')}
    ${styles.columnTable('table')}
    ${styles.tableData('td')}
    ${styles.tableHeading('th')}
    #workers-table input {
        width: 30px;
    }
</style>
<div class="col-body">
    <span class="heading">Lohnkosten</span>
    <table id="workers-table"></table>
</div>
<div class="col-footer">
    <button class="btn btn-primary" id="add-worker-btn">Typ hinzufügen</button>
    <span id="worker-costs-display"></span>
</div>
`;

/** WebComponent to render the workers table and footer. */
export class WorkersView extends HTMLElement {
    public static readonly selector = 'workers-view';

    /** Define this WebComponent to the customElements registry. */
    public static define(): void {
        if (!customElements.get(WorkersView.selector)) {
            customElements.define(WorkersView.selector, WorkersView);
        }
    }

    /**
     * Sum up the costs for workers. If no array of workers is provided,
     * the current project from `AppState` is used. **The result is not
     * rounded.**
     */
    public static calcCosts(workers?: Worker[]): number {
        const list = workers ?? $<AppState>(AppState.selector).state.project.workers;
        return list.reduce((sum, { numHours, wage }) => sum + (numHours * wage), 0);
    }

    /** Eventlistener for the "change-hours" InputElement. */
    private static changeHoursListener(rowIdx: number) {
        return (event: KeyboardEvent): void => {
            if (event.code !== 'Enter') return;
            const newVal = (event.target as HTMLInputElement).value;
            if (!newVal || Validation.isInvalid(newVal)) return;
            $<AppState>(AppState.selector).updateProject((project) => {
                const newHours = parseInt(newVal);
                if (project.workers[rowIdx].numHours + newHours < 0) return null;
                project.workers[rowIdx].numHours += newHours;
                return project;
            });
        };
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        this.appendChild(template.content.cloneNode(true));
        const stateElement = $<AppState>(AppState.selector);
        const workers = stateElement.state.project.workers;
        this.renderWorkersList(workers);
        $('#worker-costs-display', this).textContent = `${roundNum(WorkersView.calcCosts(workers)).toString()}€`;
        stateElement.addEventListener(ProjectUpdatedEvent.eventname, ((event: ProjectUpdatedEvent) => {
            this.renderWorkersList(event.detail.workers);
            $('#worker-costs-display', this).textContent = `${roundNum(WorkersView.calcCosts(event.detail.workers)).toString()}€`;
        }) as EventListener);

        $<HTMLButtonElement>('#add-worker-btn', this).onclick = () => {
            window.open('./new_worker_type.html', '_blank', 'width=480,height=420');
        };
    }

    /** Render the workers list and attach event listeners */
    private renderWorkersList(workers: Worker[]): void {
        const wTable = $<HTMLTableElement>('#workers-table', this);
        wTable.innerHTML = '<tr><th>Typ:</th><th>Stunden:</th><th>+/-</th></tr>';
        workers.forEach((wkr, rowIdx) => {
            const row = document.createElement('tr');
            const tdType = document.createElement('td');
            const tdHours = document.createElement('td');
            const tdInput = document.createElement('td');
            tdType.textContent = `${wkr.type} - ${wkr.wage} €/h`;
            tdHours.textContent = wkr.numHours.toString();
            const changeHoursInput = document.createElement('input');
            changeHoursInput.type = 'number';
            changeHoursInput.value = '0';
            changeHoursInput.onkeyup = WorkersView.changeHoursListener(rowIdx);
            tdInput.appendChild(changeHoursInput);
            row.append(tdType, tdHours, tdInput);
            wTable.appendChild(row);
        });
    }
}
