import type { Project } from '../lib/Project';

/** AppState state */
export type State = {
    project?: Project;
    fileLocation?: string;
};

/** Callbacks fired when the AppState state changes. */
export type StateChangeListener = (s: State) => void;

/**
 * WebComponent to contain app state. To `get` the current state,
 * read the `AppState.prototype.state` property. To `set` a new state,
 * reassign the `AppState.prototype.state` property. To listen for state
 * changes, set the `AppState.prototype.onstatechange` method to a callback.
 */
export class AppState extends HTMLElement {
    public static readonly selector = 'app-state';
    private _state: State = {};
    private _listeners: StateChangeListener[] = [];

    /** Get the current state. */
    public get state(): State {
        return this._state;
    }

    /** Set the current state. */
    public set state(newState: State) {
        this._state = newState;
        this._listeners.forEach((listener) => listener(newState));
    }

    /** Add a new state change listener. */
    public set onstatechange(callback: StateChangeListener) {
        this._listeners.push(callback);
    }
}

if (!customElements.get(AppState.selector)) {
    customElements.define(AppState.selector, AppState);
}
