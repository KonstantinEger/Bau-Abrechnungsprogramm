export function delayEvent(ms, callback) {
    let timer = 0;
    return (...args) => {
        clearTimeout(timer);
		timer = window.setTimeout(() => callback(...args), ms);
    }
}
