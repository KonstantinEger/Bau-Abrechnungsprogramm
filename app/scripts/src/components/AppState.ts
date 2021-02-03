import type { Project } from '../lib/Project';

/** AppState state */
export type State = {
    project?: Project;
    fileLocation?: string;
};

type EventNames = 'new-project' | 'project-updated' | 'statechange';

type CustomEventListener = (state: State, opts?: Record<string, unknown>) => void;

/**
 * WebComponent to contain app state. To `get` the current state,
 * read the `AppState.prototype.state` property. To `set` a new state,
 * reassign the `AppState.prototype.state` property. To listen for state
 * changes, set the `AppState.prototype.onstatechange` method to a callback.
 */
export class AppState extends HTMLElement {
    public static readonly selector = 'app-state';
    private _state: State = {};
    private _listeners: Map<EventNames, CustomEventListener[]> = new Map();

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
    public set state(newState: State) {
        this._state = newState;
        this.fireCustomEvent('statechange');
    }

    /** Publish a custom event to all its listeners. */
    public fireCustomEvent(event: EventNames, opts?: Record<string, unknown>): void {
        if (this._listeners.has(event)) {
            this._listeners.get(event)?.forEach((listener) => listener(this._state, opts));
        }
    }

    /** Add an event listener for custom events. */
    public addCustomEventListener(event: EventNames, listener: CustomEventListener): void {
        if (this._listeners.has(event)) {
            this._listeners.get(event)?.push(listener);
        } else {
            this._listeners.set(event, [listener]);
        }
    }
}
