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

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        this.appendChild(template.content.cloneNode(true));
        const { project } = $<AppState>('app-state').state;
        $('#worker-costs-display', this).textContent = this.updateCosts(project.workers).toString();
    }

    /** Calculate the costs for workers and set the `costs` attribute. */
    private updateCosts(workers: Worker[]): number {
        const costs = roundNum(workers.reduce((sum, worker) => {
            return sum + (worker.wage * worker.numHours);
        }, 0));
        this.setAttribute('costs', costs.toString());
        return costs;
    }
}
