function delayEvent(ms, callback) {
    let timer = 0;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), ms);
    }
}

module.exports = {
    delayEvent
};
