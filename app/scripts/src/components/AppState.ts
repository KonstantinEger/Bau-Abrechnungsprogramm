import type { Project } from '../lib/Project';

/** AppState state */
export type State = {
    project?: Project;
    fileLocation?: string;
};

/**
 * WebComponent to contain app state. To `get` the current state,
 * read the `AppState.prototype.state` property. To `set` a new state,
 * reassign the `AppState.prototype.state` property. To listen for state
 * changes, set the `AppState.prototype.onstatechange` method to a callback.
 */
export class AppState extends HTMLElement {
    public static readonly selector = 'app-state';
    private _state: State = {};

    /** Defines this WebComponent in the customElement registry. */
    public static define(): void {
        if (!customElements.get(AppState.selector)) {
            customElements.define(AppState.selector, AppState);
        }
    }

    /** Get the current state. */
    public get state(): State {
        return this._state;
    }

    /** Set the current state. */
    public setState(newState: State): void {
        this._state = newState;
        this.dispatchEvent(new StateChangedEvent(newState));
    }
}

/**
 * Event when a new project is added/loaded. The new project instance
 * is passed to the event `detail`.
 */
export class NewProjectEvent extends CustomEvent<Project> {
    public static readonly eventname = 'new-project';
    // eslint-disable-next-line require-jsdoc
    constructor(project: Project) {
        super('new-project', { detail: project });
    }
}

/**
 * Event to fire when a project is updated. The new project instance
 * is passed to the event `detail`.
 */
export class ProjectUpdatedEvent extends CustomEvent<Project> {
    public static readonly eventname = 'project-updated';
    // eslint-disable-next-line require-jsdoc
    constructor(project: Project) {
        super(ProjectUpdatedEvent.eventname, { detail: project });
    }
}

/** Event for AppState changes. */
export class StateChangedEvent extends CustomEvent<State> {
    public static readonly eventname = 'statechanged';
    // eslint-disable-next-line require-jsdoc
    constructor(newState: State) {
        super(StateChangedEvent.eventname, { detail: newState });
    }
}
