const { throwErr } = require('./scripts/errors');

document.getElementById('type-name-input').focus();

document.getElementById('submit-btn').addEventListener('click', () => {
    const typeInput = document.getElementById('type-name-input');
    const wageInput = document.getElementById('wage-input');
    const hoursInput = document.getElementById('hours-amount-input');
    typeInput.classList.remove('invalid');
    wageInput.classList.remove('invalid');
    hoursInput.classList.remove('invalid');

    {
        let exitDueToError = false;
        if (typeInput.value.length === 0) {
            typeInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (wageInput.value.length === 0 || parseFloat(wageInput.value) <= 0) {
            wageInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (hoursInput.value.length === 0 || parseFloat(hoursInput.value) < 0) {
            hoursInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (exitDueToError) {
            throwErr('Eingabefehler', 'Alle Felder mit einem roten * müssen richtig ausgefüllt sein');
            return;
        }
    }

    window.opener.postMessage({
        name: 'NEW_WORKER_TYPE',
        worker: {
            type: typeInput.value,
            amount: parseFloat(hoursInput.value),
            wage: parseFloat(wageInput.value)
        }
    });

    window.close();
});

document.getElementById('close-window-btn').addEventListener('click', window.close);