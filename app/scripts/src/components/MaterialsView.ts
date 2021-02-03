import * as styles from './common_styles';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        ${styles.columnBody('.col-body')}
        ${styles.columnHeading('.heading')}
        ${styles.columnTable()}
        ${styles.tableHeading()}
        ${styles.tableData()}
        ${styles.columnFooter('.col-footer')}
        ${styles.columnFooterCost('.costs-display')}
    </style>
    <div class="col-body">
        <span class="heading">Materialkosten</span>
        <table>
            <tr>
                <th>Name:</th>
                <th>Rechnungsnummer:</th>
                <th>Betrag in €:</th>
            </tr>
        </table>
    </div>
    <div class="col-footer">
        <button>Hinzufügen</button>
        <span class="costs-display">123</span>
    </div>
`;

/** WebComponent to render the materials list and its footer. */
export class MaterialsView extends HTMLElement {
    public static readonly selector = 'materials-view';

    /** Define this WebComponent in the customElements registry. */
    public static define(): void {
        if (!customElements.get(MaterialsView.selector)) {
            customElements.define(MaterialsView.selector, MaterialsView);
        }
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
}
