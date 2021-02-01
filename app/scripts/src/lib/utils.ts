/** Namespace for utility methods regarding string validation and sanitization. */
export abstract class Validation {
    /**
     * Replaces commas and double quotes in a string with placeholders so it can
     * savely be stored in CSV format.
     */
    public static sanitize(input: string): string {
        return input.replace(/,/g, '{{c}}').replace(/"/g, '{{dq}}');
    }

    /**
     * Replaces the placeholders for commas and double quotes with their
     * correct values.
     */
    public static desanitize(input: string): string {
        return input.replace(/{{c}}/g, ',').replace(/{{dq}}/g, '"');
    }

    /** Checks if a string contains `"` or `,`. If so, returns `true`. */
    public static isInvalid(input: string): boolean {
        return (/,|"/g).test(input);
    }
}

/** Namespace for utility methods regarding Events */
export abstract class Events {
    /** Checks if a given variable is of type `KeyboardEvent`. */
    public static isKeyboardEvent(event: unknown): event is KeyboardEvent {
        return event instanceof KeyboardEvent;
    }

    /**
     * Delays the firing of a event handler. **Note**: If the handler gets called
     * multiple times _within_ the delay time period, only the _last one_ will
     * actually get executed.
     */
    public static debounce<T extends unknown[]>(ms: number, callback: (...args: T) => void): (...args: T) => void {
        let timer = 0;
        return (...args: T) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => callback(...args), ms);
        };
    }
}
