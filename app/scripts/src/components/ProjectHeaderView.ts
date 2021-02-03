import { AppState, ProjectUpdatedEvent } from './AppState';
import { $ } from '../lib/utils';
import type { Project } from '../lib/Project';

const template = document.createElement('template');
template.innerHTML = `
<style>
    #project-header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 0.5fr 2.5fr;
        height: 100px;
        background-color: var(--bg-light);
    }

    #project-header > div {
        padding: 10px;
    }

    #project-header > textarea {
        height: 84px;
        margin-top: 5px;
        resize: none;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 10pt;
    }

    span#project-name-display,
    span#project-place-display,
    span#project-date-display {
        display: block;
        margin-top: 10px;
    }

    span#project-name-display {
        color: var(--primary-color);
    }
</style>
<div id="project-header">
    <div id="name">
        Projektname:
        <span id="project-name-display"></span>
    </div>
    <div id="place">
        Ort:
        <span id="project-place-display"></span>
    </div>
    <div id="date">
        Datum:
        <span id="project-date-display"></span>
    </div>
    <div id="notes">
        Bemerkungen:
    </div>
    <textarea id="notes-input" cols="50" rows="10"></textarea>
</div>
`;

/** WebComponent to render the Header in the ProjectView. */
export class ProjectHeaderView extends HTMLElement {
    public static readonly selector = 'project-header-view';

    /** Define this WebComponent in the customElements registry. */
    public static define(): void {
        if (!customElements.get(ProjectHeaderView.selector)) {
            customElements.define(ProjectHeaderView.selector, ProjectHeaderView);
        }
    }

    /** Turns the date string into locale format. */
    private static formatDateString(str: string): string {
        const dateIntlOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(str).toLocaleDateString('de-DE', dateIntlOptions);
    }

    /** Render the project properties. */
    private static render(shadow: ShadowRoot, project: Project): void {
        $('#project-name-display', shadow).textContent = project.name;
        $('#project-place-display', shadow).textContent = project.place;
        $('#project-date-display', shadow).textContent = ProjectHeaderView.formatDateString(project.date);
        $<HTMLTextAreaElement>('#notes-input', shadow).value = project.descr;
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        const stateElement = $<AppState>(AppState.selector);
        const state = stateElement.state;
        if (!state.project) return;
        ProjectHeaderView.render(shadow, state.project);
        stateElement.addEventListener(ProjectUpdatedEvent.eventname, ((event: ProjectUpdatedEvent) => {
            ProjectHeaderView.render(shadow, event.detail);
        }) as EventListener);
    }

}
