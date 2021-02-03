import { MaterialsView } from './MaterialsView';
import { ProjectHeaderView } from './ProjectHeaderView';

const template = document.createElement('template');
template.innerHTML = `
<style>
    .body-grid-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        height: calc(100vh - 103px);
        border-top: 3px solid var(--primary-color);
    }
</style>
<project-header-view></project-header-view>
<div class="body-grid-3">
    <materials-view></materials-view>
    <workers-view></workers-view>
    <bill-view></bill-view>
</div>
`;

/** WebComponent to render the project view. */
export class ProjectView extends HTMLElement {
    public static readonly selector = 'project-view';

    /** Define this WebComponent in the customElements registry */
    public static define(): void {
        if (!customElements.get(ProjectView.selector)) {
            customElements.define(ProjectView.selector, ProjectView);
        }
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        MaterialsView.define();
        ProjectHeaderView.define();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
}
