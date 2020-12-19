const { promises: fs } = require('fs');
const { Project } = require('./scripts/lib/Project');
const { renderProject, ...renderPartials } = require('./scripts/lib/render_project');

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
			sessionStorage.setItem('CURRENT_PROJ_LOC', data.filePath);
			renderProject(project);
		} else if (data.name === 'NEW_MATERIAL') {
			const projectStr = sessionStorage.getItem('CURRENT_PROJ');
			const filePath = sessionStorage.getItem('CURRENT_PROJ_LOC');
			if (!projectStr || !filePath) {
				console.warn('WARNING: project string or filepath from session storage not acceptable');
				return
			}
			const project = Project.fromCSV(projectStr);
			project.materials.push({
				name: data.material.name,
				receiptID: data.material.receiptID,
				price: data.material.price
			});
			const newCSV = project.toCSV();
			sessionStorage.setItem('CURRENT_PROJ', newCSV);
			// TODO: Error handling
			await fs.writeFile(filePath, newCSV);
			renderPartials.renderMatCol(project);
			renderPartials.renderBillCol(project);
		}
	};

	window.addEventListener('render-project', () => {
		const projectString = sessionStorage.getItem('CURRENT_PROJ');
		if (projectString === null) {
			console.warn('WARNING: "render-project" event fired but no CURRENT_PROJ found.');
			return
		}
		const p = Project.fromCSV(projectString);
		renderProject(p);
	});

	window.addEventListener('keypress', async (event) => {
		if (event.code === 'KeyS' && event.ctrlKey === true) {
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