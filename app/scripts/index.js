const { promises: fs } = require('fs');
const { Project } = require('./scripts/lib/Project');
const { renderProject, ...renderPartials } = require('./scripts/lib/render_project');

(() => {

	window.onmessage = ({ data }) => {
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
			sessionStorage.setItem('CURRENT_PROJ_LOC', data.filePath);
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

	window.addEventListener('keypress', async (event) => {
		if (event.code === 'KeyS' && event.ctrlKey === true) {
			console.log('saving...')
			const filePath = sessionStorage.getItem('CURRENT_PROJ_LOC');
			const projectString = sessionStorage.getItem('CURRENT_PROJ');
			if (!filePath || !projectString) {
				console.warn('WARNING: filePath or projectString was not acceptable');
				return
			}
			// TODO: Error-handling
			await fs.writeFile(filePath, projectString);
		}
	});

	document.querySelector('#btn-new').addEventListener('click', () => {
		window.open('./new_project.html', '_blank', 'width=800,height=600');
	});

	document.querySelector('#btn-open').addEventListener('click', () => {
		require('./scripts/open_project_dialog')().then(renderProject);
	});
})();