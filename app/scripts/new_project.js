document.getElementById('create-project-btn').addEventListener('click', () => {
	const nameInput = document.getElementById('project-name-input');
	const placeInput = document.getElementById('project-place-input');
	const dateInput = document.getElementById('project-date-input');
	const notesInput = document.getElementById('project-notes-input');
	nameInput.classList.remove('invalid');
	placeInput.classList.remove('invalid');
	dateInput.classList.remove('invalid');

	{
		let exitDueToError = false;
		if (nameInput.value.length === 0) {
			nameInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (placeInput.value.length === 0) {
			placeInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (dateInput.value.length === 0) {
			dateInput.classList.add('invalid');
			exitDueToError = true;
		}
	
		if (exitDueToError) return;
	}

	// TODO: generate ID
	const id = 6;

	window.opener.postMessage({
		name: 'OPEN_PROJECT',
		project: {
			id,
			name: nameInput.value,
			date: dateInput.value,
			place: placeInput.value,
			notes: notesInput.value
		}
	});

	window.close();
});

document.getElementById('close-window-btn').addEventListener('click', window.close);