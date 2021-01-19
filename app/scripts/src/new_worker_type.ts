import type { MessageData } from '.';
import type { Worker } from './lib/Project';
import { isInvalid } from './lib/utils';
import { throwErr } from './lib/errors';

document.getElementById('type-name-input')?.focus();

document.getElementById('submit-btn')?.addEventListener('click', () => {
    const typeInput = document.getElementById('type-name-input') as HTMLInputElement;
    const wageInput = document.getElementById('wage-input') as HTMLInputElement;
    const hoursInput = document.getElementById('hours-amount-input') as HTMLInputElement;
    typeInput.classList.remove('invalid');
    wageInput.classList.remove('invalid');
    hoursInput.classList.remove('invalid');

    {
        let exitDueToError = false;
        if (typeInput.value.length === 0 || isInvalid(typeInput.value)) {
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
            throwErr('Eingabefehler', 'Alle Felder mit einem roten * müssen richtig ausgefüllt sein (kein , oder ")');
            return;
        }
    }

    window.opener.postMessage({
        name: 'NEW_WORKER_TYPE',
        worker: {
            type: typeInput.value,
            numHours: parseFloat(hoursInput.value),
            wage: parseFloat(wageInput.value)
        } as Worker
    } as MessageData);

    window.close();
});

document.getElementById('close-window-btn')?.addEventListener('click', window.close);
