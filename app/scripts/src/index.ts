const { promises: fs } = require('fs');
const ipc = require('electron').ipcRenderer;
import { Project } from './lib/Project';
import * as renderFns from './lib/render_project';
import { openProjectDialog } from './open_project_dialog';
import { throwFatalErr } from './errors';

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
            renderFns.renderProject(project);
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
            try {
                await fs.writeFile(filePath, newCSV);
            } catch (err) {
                throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
            }
            renderFns.renderMatCol(project);
            renderFns.renderBillCol(project);
        } else if (data.name === 'NEW_WORKER_TYPE') {
            const projectStr = sessionStorage.getItem('CURRENT_PROJ');
            const filePath = sessionStorage.getItem('CURRENT_PROJ_LOC');
            if (!projectStr || !filePath) {
                console.warn('WARNING: project string or filepath from session storage not acceptable');
                return
            }
            const project = Project.fromCSV(projectStr);
            project.hours.push({
                type: data.worker.type,
                amount: data.worker.amount,
                wage: data.worker.wage
            });
            const newCSV = project.toCSV();
            sessionStorage.setItem('CURRENT_PROJ', newCSV);
            try {
                await fs.writeFile(filePath, newCSV);
            } catch (err) {
                throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
            }
            renderFns.renderWagesCol(project);
            renderFns.renderBillCol(project);
        }
    };

    window.addEventListener('keypress', async (event) => {
        if (event.code === 'KeyS' && event.ctrlKey === true) {
            const filePath = sessionStorage.getItem('CURRENT_PROJ_LOC');
            const projectString = sessionStorage.getItem('CURRENT_PROJ');
            if (!filePath || !projectString) {
                console.warn('WARNING: filePath or projectString was not acceptable');
                return
            }
            try {
                await fs.writeFile(filePath, projectString);
            } catch (err) {
                throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
            }
        }
    });

    document.querySelector('#btn-new').addEventListener('click', () => {
        window.open('./new_project.html', '_blank', 'width=800,height=600');
    });

    document.querySelector('#btn-open').addEventListener('click', () => {
        openProjectDialog().then(renderFns.renderProject);
    });
})();

ipc.on('open:new-project-dialog', () => {
    window.open('./new_project.html', '_blank', 'width=800,height=600');
});

ipc.on('open:open-project-dialog', () => {
    openProjectDialog().then(renderFns.renderProject);
});