const { remote } = require('electron');

document.getElementById('create-project-btn').addEventListener('click', async () => {
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

  const dialog = remote.dialog;
  const browserWin = remote.getCurrentWindow();

  // https://www.brainbell.com/javascript/show-save-dialog.html

  let opts = {
    title: 'Neues Projekt speichern',
    defaultPath : (process.env.HOME || process.env.HOMEPATH) + `\\${nameInput.value}.tbvp.csv`,
    buttonLabel : 'Neues Bauprojekt Speichern',
    filters :[
      {name: 'Bauprojekt', extensions: ['tbvp.csv']},
      {name: 'Alle Datein', extensions: ['*']}
    ]
  }

  let { canceled, filePath } = await dialog.showSaveDialog(browserWin, opts);
  if (canceled || !filePath) return;

  // TODO: Write to disk

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