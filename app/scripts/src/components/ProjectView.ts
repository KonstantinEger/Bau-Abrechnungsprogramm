const template = document.createElement('template');
template.innerHTML = `
<project-header></project-header>
<div class="body-grid-3">
    <materials-view></materials-view>
    <workers-view></workers-view>
    <bill-view></bill-view>
</div>
`;

/** WebComponent to render the project view. */
export class ProjectView extends HTMLElement {
    public static readonly selector = 'project-view';

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.appendChild(template.content.cloneNode(true));
    }
}

if (!customElements.get(ProjectView.selector)) {
    customElements.define(ProjectView.selector, ProjectView);
}
