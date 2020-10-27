
const renderProject = require('./scripts/lib/render_project');

(() => {

	window.onmessage = async ({ data }) => {
		if (data.name === 'OPEN_PROJECT') renderProject(data.project);
	};

	document.querySelector('#btn-new').addEventListener('click', () => {
		window.open('./new_project.html', '_blank', 'width=800,height=600');
	});

	document.querySelector('#btn-open').addEventListener('click', () => {
		require('./scripts/open_project_dialog')().then(renderProject);
	});
})();