import * as styles from './common_styles';

const template = document.createElement('template');
template.innerHTML = `
<style>
    ${styles.columnBody('.col-body')}
    ${styles.columnFooter('.col-footer')}
    ${styles.columnFooterCost('.costs-display')}
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
    <span class="costs-display">123</span>
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
    }
}
