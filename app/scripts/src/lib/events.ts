import type { Project } from './Project';
import type { State } from '../components/AppState';

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
