import { columnHeading } from './common_styles';

const template = document.createElement('template');
template.innerHTML = `
<style>
    ${columnHeading('.heading')}
    .section-bottom {
        padding-top: 14px;
    }
    #brutto-section,
    #netto-section,
    #costs-section,
    #bilanz-section {
        display: grid;
        grid-template-columns: 70px 1fr;
        padding: 0 30px;
        margin-bottom: 10px;
    }   

    #brutto-section input {
        text-align: right;
    }

    #costs-section > span {
        color: var(--secundary-color);
    }

    #bilanz-section > div {
        color: var(--primary-color);
    }

    #bilanz-section > div.negative {
        color: var(--secundary-color);
    }

    #bilanz-section #bilanz-in-euros {
        font-weight: bold;
    }
</style>
<div class="section-top">
    <span class="heading">Rechnung</span>
</div>
<div class="section-bottom">
    <div id="brutto-section">
        <label>Brutto:</label>
        <div>
            <input type="number" min="1">€
        </div>
    </div>
    <div id="netto-section">
        <label>Netto:</label>
        <span>0,00€</span>
    </div>
    <div id="costs-section">
        <label>Abzüge:</label>
        <span>0,00€</span>
    </div>
    <hr>
    <div id="bilanz-section">
        <label>Bilanz:</label>
        <div>
            <span id="bilanz-in-euros">0,00€</span><br>
            <span id="bilanz-in-pc">0,0%</span>
        </div>
    </div>
</div>
`;

/**
 * WebComponent to render the bill section in the project view.
 * Accessable through the selector `<bill-view></bill-view>`.
 */
export class BillView extends HTMLElement {
    public static readonly selector = 'bill-view';

    /** Defines this WebComponent in the customElements registry. */
    public static define(): void {
        if (!customElements.get(BillView.selector)) {
            customElements.define(BillView.selector, BillView);
        }
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
}
