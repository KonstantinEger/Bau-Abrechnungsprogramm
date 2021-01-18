import * as renderFns from './lib/render_project';
import type { Material, Worker } from './lib/Project';
import { Project } from './lib/Project';
import { promises as fs } from 'fs';
import { ipcRenderer as ipc } from 'electron';
import { openProjectDialog } from './lib/open_project_dialog';
import { throwFatalErr } from './lib/errors';

interface MessageData {
    name: string,
    project?: Project,
    filePath?: string,
    material?: Material,
    worker?: Worker
};

(() => {

    window.onmessage = async ({ data }: { data: MessageData }) => {
        if (data.name === 'NEW_PROJECT') {
            if (!data.project || !data.filePath) return;
            const project = new Project({
                name: data.project.name,
                date: data.project.date,
                place: data.project.place,
                description: data.project.descr,
                brutto: data.project.brutto,
                materials: data.project.materials,
                hours: data.project.hours,
                shouldGenID: false
            });
            project.id = data.project.id;
            project.saveToSessionStorage({ filePath: data.filePath });
            renderFns.renderProject(project);
        } else if (data.name === 'NEW_MATERIAL') {
            if (!data.material) return;
            const { filePath, project } = Project.getCurrentProject();
            project.materials.push({
                name: data.material.name,
                receiptID: data.material.receiptID,
                price: data.material.price
            });
            const newCSV = project.saveToSessionStorage();
            try {
                await fs.writeFile(filePath, newCSV);
            } catch (err) {
                throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
            }
            renderFns.renderMatCol(project);
            renderFns.renderBillCol(project);
        } else if (data.name === 'NEW_WORKER_TYPE') {
            if (!data.worker) return;
            const { filePath, project } = Project.getCurrentProject();
            project.hours.push({
                type: data.worker.type,
                amount: data.worker.amount,
                wage: data.worker.wage
            });
            const newCSV = project.saveToSessionStorage();
            try {
                await fs.writeFile(filePath, newCSV);
            } catch (err) {
                throwFatalErr(`FS-Fehler [${err.code}]`, err.message);
            }
            renderFns.renderWagesCol(project);
            renderFns.renderBillCol(project);
        }
    };

    document.querySelector('#btn-new')?.addEventListener('click', () => {
        window.open('./new_project.html', '_blank', 'width=800,height=600');
    });

    document.querySelector('#btn-open')?.addEventListener('click', () => {
        openProjectDialog().then((proj) => {
            if (!proj) return;
            renderFns.renderProject(proj);
        });
    });
})();

ipc.on('open:new-project-dialog', () => {
    window.open('./new_project.html', '_blank', 'width=800,height=600');
});

ipc.on('open:open-project-dialog', () => {
    openProjectDialog().then((proj) => {
        if (!proj) return;
        renderFns.renderProject(proj);
    });
});
