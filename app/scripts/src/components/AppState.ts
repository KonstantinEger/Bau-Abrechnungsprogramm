import { NewProjectEvent, ProjectUpdatedEvent, StateChangedEvent } from '../lib/events';
import type { Project } from '../lib/Project';

/** AppState state */
export type State = {
    project: Project;
    fileLocation: string;
};

/** Parameters for setting a new project to the AppState. */
export interface NewProjectParams {
    /** Project instance. */
    project: Project;
    /** Path to the project file. */
    filepath: string;
    /** Set to `false` if the project has been loaded, not created.
     * This skips writing the file again.
     */
    fresh: boolean;
}

/**
 * WebComponent to contain app state. To `get` the current state,
 * read the `AppState.prototype.state` property. There are multiple ways
 * of mutating the current state: `AppState.prototype.newProject` &
 * `AppState.prototype.updateProject`. The following custom events
 * are present: `NewProject-`, `ProjectUpdated-` and `StateChangedEvent`.
 */
export class AppState extends HTMLElement {
    public static readonly selector = 'app-state';
    private _state: State | undefined;

    /** Defines this WebComponent in the customElement registry. */
    public static define(): void {
        if (!customElements.get(AppState.selector)) {
            customElements.define(AppState.selector, AppState);
        }
    }

    /** Get the current state. */
    public get state(): State {
        if (!this._state) throw new Error('State is still undefined');
        return this._state;
    }

    /**
     * Method to call when a _completely new_ project is added to the app.
     * Triggers: `StateChangedEvent`, `NewProjectEvent`.
     */
    public newProject({ filepath, project, fresh }: NewProjectParams): void {
        this._state = {
            project,
            fileLocation: filepath
        };
        this.dispatchEvent(new StateChangedEvent(this._state));
        this.dispatchEvent(new NewProjectEvent({ project, fresh }));
    }

    /**
     * Method to call when the _current, active_ project should get updated.
     * The old project instance will get passed to the callback, the updated
     * project may be returned. To abort the update, return `null`. Triggers:
     * `StateChangedEvent`, `ProjectUpdatedEvent`.
     */
    public updateProject(cb: (old: Project) => Project | null): void {
        const oldState = this.state;
        const newProject = cb(oldState.project);
        if (newProject === null) return;
        this._state = {
            project: newProject,
            fileLocation: oldState.fileLocation
        };
        this.dispatchEvent(new StateChangedEvent(this._state));
        this.dispatchEvent(new ProjectUpdatedEvent(newProject));
    }
}
