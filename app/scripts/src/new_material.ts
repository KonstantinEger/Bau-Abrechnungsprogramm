import { throwErr } from './errors';

document.getElementById('mat-name-input')?.focus();

document.getElementById('submit-btn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('mat-name-input') as HTMLInputElement;
    const receiptIdInput = document.getElementById('receipt-id-input') as HTMLInputElement;
    const priceInput = document.getElementById('price-input') as HTMLInputElement;
    nameInput.classList.remove('invalid');
    receiptIdInput.classList.remove('invalid');
    priceInput.classList.remove('invalid');

    {
        let exitDueToError = false;
        if (nameInput.value.length === 0) {
            nameInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (receiptIdInput.value.length === 0) {
            receiptIdInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (priceInput.value.length === 0) {
            priceInput.classList.add('invalid');
            exitDueToError = true;
        }

        if (exitDueToError) {
            throwErr('Eingabefehler', 'Alle Felder mit einem roten * müssen richtig ausgefüllt sein');
            return;
        }
    }

    window.opener.postMessage({
        name: 'NEW_MATERIAL',
        material: {
            name: nameInput.value,
            receiptID: receiptIdInput.value,
            price: priceInput.value
        }
    });

    window.close();
});

document.getElementById('close-window-btn')?.addEventListener('click', window.close);