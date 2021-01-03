export function delayEvent<T extends any[]>(ms: number, callback: (...args: T) => void) {
    let timer = 0;
    return (...args: T) => {
        clearTimeout(timer);
		timer = window.setTimeout(() => callback(...args), ms);
    }
}
