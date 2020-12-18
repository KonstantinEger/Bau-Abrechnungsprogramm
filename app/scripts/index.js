const { Project } = require('./scripts/lib/Project');
const renderProject = require('./scripts/lib/render_project');

(() => {

	window.onmessage = async ({ data }) => {
		if (data.name === 'OPEN_PROJECT') {
			const project = new Project(
				data.project.name,
				data.project.date,
				data.project.place,
				data.project.descr,
				data.project.brutto,
				data.project.materials,
				data.project.hours,
				false
			);
			project.id = data.project.id;
			sessionStorage.setItem('CURRENT_PROJ', project.toCSV());
			renderProject(project);
		}
	};

	window.addEventListener('render-project', () => {
		const projectString = sessionStorage.getItem('CURRENT_PROJ');
		if (projectString === null) {
			console.warn('"render-project" event fired but no CURRENT_PROJ found.');
			return
		}
		const p = Project.fromCSV(projectString);
		renderProject(p);
	});

	document.querySelector('#btn-new').addEventListener('click', () => {
		window.open('./new_project.html', '_blank', 'width=800,height=600');
	});

	document.querySelector('#btn-open').addEventListener('click', () => {
		require('./scripts/open_project_dialog')().then(renderProject);
	});
})();