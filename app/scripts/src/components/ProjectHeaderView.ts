import { $ } from '../lib/utils';
import type { AppState } from './AppState';

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

/** WebComponent to render the Header in the ProjectView */
export class ProjectHeaderView extends HTMLElement {
    public static readonly selector = 'project-header-view';

    /** Turns the date string into locale format. */
    private static formatDateString(str?: string): string | undefined {
        if (!str) return;
        const dateIntlOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(str).toLocaleDateString('de-DE', dateIntlOptions);
    }

    // eslint-disable-next-line require-jsdoc
    public connectedCallback(): void {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        const state = $<AppState>('#app-state').state;

        const fallback = 'Fehler';
        $('#project-name-display', shadow).textContent = state.project?.name ?? fallback;
        $('#project-place-display', shadow).textContent = state.project?.place ?? fallback;
        $('#project-date-display', shadow).textContent = ProjectHeaderView.formatDateString(state.project?.date) ?? fallback;
        $<HTMLTextAreaElement>('#notes-input', shadow).value = state.project?.descr ?? fallback;
    }
}

if (!customElements.get(ProjectHeaderView.selector)) {
    customElements.define(ProjectHeaderView.selector, ProjectHeaderView);
}
