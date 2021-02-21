import * as styles from './common_styles';
import { $, Validation, roundNum } from '../lib/utils';
import type { AppState } from './AppState';
import type { Material } from '../lib/Project';
import { ProjectUpdatedEvent } from './AppState';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        ${styles.columnBody('.col-body')}
        ${styles.columnHeading('.heading')}
        ${styles.columnTable()}
        ${styles.tableHeading()}
        ${styles.tableData()}
        ${styles.columnFooter('.col-footer')}
        ${styles.columnFooterCost('#mat-costs-display')}
    </style>
    <div class="col-body">
        <span class="heading">Materialkosten</span>
        <table id="mat-table"></table>
    </div>
    <div class="col-footer">
        <button class="btn btn-primary" id="add-mat-btn">Hinzufügen</button>
        <span id="mat-costs-display"></span>
    </div>
`;

enum TableColumn {
    NAME,
    RECEIPT,
    PRICE
}

/** WebComponent to render the materials list and its footer. */
export class MaterialsView extends HTMLElement {
    public static readonly selector = 'materials-view';

    /** Define this WebComponent in the customElements registry. */
    public static define(): void {
        if (!customElements.get(MaterialsView.selector)) {
            customElements.define(MaterialsView.selector, MaterialsView);
        }
    }

    /**
     * Sum up the costs for materials. If no array with materials is provided,
     * the current project from `AppState` is used. **The result is not rounded.**
     */
    public static calcCosts(materials?: Material[]): number {
        const list = materials ?? $<AppState>('app-state').state.project.materials;
        return list.reduce((sum, { price }) => sum + parseFloat(price), 0);
    }

    /**
     * Sets up edit inputs for editing the material property and
     * handles inputs on them. Automatically triggers the `ProjectUpdatedEvent`
     * on the AppState on completion.
     */
    private static editPropListeners(column: TableColumn, rowIdx: number) {
        return (mEvent: MouseEvent) => {
            const target = mEvent.target as HTMLTableDataCellElement;
            target.ondblclick = null;
            const oldVal = target.textContent ?? '';
            const input = document.createElement('input');
            input.value = oldVal;
            if (column === TableColumn.PRICE) input.type = 'number';
            target.innerHTML = '';
            target.appendChild(input);
            input.focus();
            input.onkeyup = (kEvent) => {
                if (kEvent.code !== 'Enter') return;
                const newVal = input.value;
                if (!newVal || Validation.isInvalid(newVal)) return;
                const stateElement = $<AppState>('app-state');
                stateElement.updateProject((oldProj) => {
                    switch (column) {
                        case TableColumn.NAME: {
                            oldProj.materials[rowIdx].name = newVal;
                            break;
                        }
                        case TableColumn.RECEIPT: {
                            oldProj.materials[rowIdx].receiptId = newVal;
                            break;
                        }
                        case TableColumn.PRICE: {
                            oldProj.materials[rowIdx].price = newVal;
                            break;
                        }
                    }
                    return oldProj;
                });
            };
            // TODO: input.onblur
        };
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        this.appendChild(template.content.cloneNode(true));
        const stateElement = $<AppState>('app-state');
        const materials = stateElement.state.project.materials;
        this.renderMatList(materials);
        $('#mat-costs-display', this).textContent = `${roundNum(MaterialsView.calcCosts(materials)).toString()}€`;
        stateElement.addEventListener(ProjectUpdatedEvent.eventname, ((event: ProjectUpdatedEvent) => {
            const mat = event.detail.materials;
            //! Doesn't need a full re-render if nothing about materials changes.
            //TODO: `MaterialsChangedEvent`
            this.renderMatList(mat);
            $('#mat-costs-display', this).textContent = `${roundNum(MaterialsView.calcCosts(mat)).toString()}€`;
        }) as EventListener);

        $<HTMLButtonElement>('#add-mat-btn', this).onclick = () => {
            window.open('./new_material.html', '_blank', 'width=480,height=420');
        };
    }

    /** Render the material list */
    private renderMatList(materials: Material[]): void {
        const matTable = $<HTMLTableElement>('#mat-table', this);
        matTable.innerHTML = '<tr><th>Name:</th><th>Rechnungsnummer:</th><th>Betrag in €:</th></tr>';
        materials.forEach((mat, rowIdx) => {
            const row = document.createElement('tr');
            const tdName = document.createElement('td');
            const tdReceipt = document.createElement('td');
            const tdPrice = document.createElement('td');
            tdName.textContent = mat.name;
            tdReceipt.textContent = mat.receiptId;
            tdPrice.textContent = mat.price;
            tdName.ondblclick = MaterialsView.editPropListeners(TableColumn.NAME, rowIdx).bind(this);
            tdReceipt.ondblclick = MaterialsView.editPropListeners(TableColumn.RECEIPT, rowIdx).bind(this);
            tdPrice.ondblclick = MaterialsView.editPropListeners(TableColumn.PRICE, rowIdx).bind(this);
            row.append(tdName, tdReceipt, tdPrice);
            matTable.appendChild(row);
        });
    }
}
