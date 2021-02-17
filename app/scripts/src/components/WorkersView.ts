import * as styles from './common_styles';
import { $, roundNum } from '../lib/utils';
import type { AppState } from './AppState';
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
</style>
<div class="col-body">
    <span class="heading">Lohnkosten</span>
    <table>
        <tr>
            <th>Typ:</th>
            <th>Stunden:</th>
            <th></th>
        </tr>
    </table>
</div>
<div class="col-footer">
    <button>Typ hinzufügen</button>
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
        const list = workers ?? $<AppState>('app-state').state.project.workers;
        return list.reduce((sum, { numHours, wage }) => sum + (numHours * wage), 0);
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        this.appendChild(template.content.cloneNode(true));
        const workers = $<AppState>('app-state').state.project.workers;
        $('#worker-costs-display', this).textContent = roundNum(WorkersView.calcCosts(workers)).toString();
    }
}
