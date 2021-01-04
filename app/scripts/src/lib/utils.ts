/**
 * Delays the firing of a event handler. **Note**: If the handler gets called
 * multiple times _within_ the delay time period, only the _last one_ will
 * actually get executed.
 */
export function delayEvent<T extends any[]>(ms: number, callback: (...args: T) => void) {
    let timer = 0;
    return (...args: T) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => callback(...args), ms);
    }
}

/**
 * Replaces commas and double quotes in a string with placeholders so it can
 * savely be stored in CSV format.
 */
export function sanitize(input: string): string {
    return input.replace(/,/g, '{{c}}').replace(/"/g, '{{dq}}');
}

/**
 * Replaces the placeholders for commas and double quotes with their
 * correct values.
 */
export function desanitize(input: string): string {
    return input.replace(/{{c}}/g, ',').replace(/{{dq}}/g, '"');
}

/** Checks if a string contains `"` or `,`. If so, returns `true`. */
export function isInvalid(input: string): boolean {
    return (/,|"/g).test(input);
}
