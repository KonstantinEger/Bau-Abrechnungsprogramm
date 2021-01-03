export function delayEvent<T extends any[]>(ms: number, callback: (...args: T) => void) {
    let timer = 0;
    return (...args: T) => {
        clearTimeout(timer);
		timer = window.setTimeout(() => callback(...args), ms);
    }
}

export function sanitize(input: string): string {
    return input.replace(/,/g, '{{c}}').replace(/"/g, '{{dq}}');
}


export function desanitize(input: string): string {
    return input.replace(/{{c}}/g, ',').replace(/{{dq}}/g, '"');
}

export function isInvalid(input: string): boolean {
    return (/,|"/g).test(input);
}
