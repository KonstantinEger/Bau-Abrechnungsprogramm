// TODO: load actual projects from disk
const projects = [
	{
		name: 'Bautzen Schützenplatz',
		id: 1,
		place: 'Bautzen',
		date: '15. Okt. 2019',
		notes: 'Rem cumque vel qui voluptates alias. '
	},
	{
		name: 'Nechern Abwasser',
		id: 2,
		place: 'Nechern',
		date: '10. Okt. 2019',
		notes: 'Praesentium est officia consequuntur ea nihil non. Aut nihil cupiditate incidunt qui neque modi est.'
	},
	{
		name: 'Bautzen Bahnhofstraße',
		id: 3,
		place: 'Bautzen',
		date: '23. Sept. 2019',
		notes: 'Quibusdam ipsa qui minus similique aspernatur totam dolor et.'
	}
];

/**
 * Ends a string with '...' if it is over len-characters long.
 * @param {string} str
 * @param {number} len
 */
const shortenString = (str, len) => {
	return str.length <= len
		? str
		: str.substr(0, len - 3) + '...';
}

/**
 * Handles click of an open-btn and sends project to main-window
 * @param {MouseEvent} event 
 */
const handleBtnClick = (event) => {
	window.opener.postMessage({
		name: 'OPEN_PROJECT',
		project: projects.find(p => p.id === parseInt(event.target.id))
	});
	window.close();
}

const listContEl = document.getElementById('list-container');

projects.forEach(project => {
	const listItem = document.createElement('div');
	listItem.className = 'list-item';

	const nameItem = document.createElement('p');
	const dateItem = document.createElement('p');
	const notesItem = document.createElement('p');
	const openBtn = document.createElement('button');
	nameItem.textContent = shortenString(project.name, 23);
	dateItem.textContent = project.date;
	notesItem.textContent = shortenString(project.notes, 32);
	openBtn.textContent = 'Öffnen';
	openBtn.className = 'btn btn-primary btn-small';
	openBtn.id = project.id;
	openBtn.addEventListener('click', handleBtnClick);


	listItem.appendChild(nameItem);
	listItem.appendChild(dateItem);
	listItem.appendChild(notesItem);
	listItem.appendChild(openBtn);

	listContEl.appendChild(listItem);
});
