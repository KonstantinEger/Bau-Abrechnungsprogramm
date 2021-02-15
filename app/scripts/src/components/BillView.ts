import { $, Events, roundNum } from '../lib/utils';
import type { AppState } from './AppState';
import type { MaterialsView } from './MaterialsView';
import type { WorkersView } from './WorkersView';
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
            <input id="brutto-input" type="number" min="1">€
        </div>
    </div>
    <div id="netto-section">
        <label>Netto:</label>
        <span id="netto-display">0,00€</span>
    </div>
    <div id="costs-section">
        <label>Abzüge:</label>
        <span id="costs-display">0,00€</span>
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
        this.appendChild(template.content.cloneNode(true));
        const stateElement = $<AppState>('app-state');
        this.render(stateElement.state.project.brutto);
        $<HTMLInputElement>('#brutto-input', this).oninput = Events.debounce(750, (event) => {
            const newVal = (event.target as HTMLInputElement).value;
            if (!newVal) return;
            stateElement.updateProject((project) => {
                project.brutto = parseFloat(newVal);
                this.render(project.brutto);
                return project;
            });
        });
    }

    /** Fill in the placeholders of the view. */
    private render(brutto: number): void {
        const bruttoInput = $<HTMLInputElement>('#brutto-input', this);
        if (bruttoInput.value !== brutto.toString()) bruttoInput.value = brutto.toString();
        const netto = brutto - (brutto * 0.19);
        $('#netto-display', this).textContent = roundNum(netto).toString();
        const matCosts = parseFloat($<MaterialsView>('materials-view').getAttribute('costs') ?? '0');
        const workersCosts = parseFloat($<WorkersView>('workers-view').getAttribute('costs') ?? '0');
        const costs = matCosts + workersCosts;
        $('#costs-display', this).textContent = roundNum(-costs).toString();
        const bilanzEuros = netto - costs;
        const bilanzPc = (bilanzEuros / netto) * 100;
        $('#bilanz-in-euros', this).textContent = roundNum(bilanzEuros).toString();
        $('#bilanz-in-pc', this).textContent = roundNum(bilanzPc).toString();
    }
}
