import type { Material, Worker } from './lib/Project';
import { $ } from './lib/utils';
import { AppState } from './components/AppState';
import { NewProjectEvent } from './lib/events';
import { Project } from './lib/Project';
import { ProjectView } from './components/ProjectView';
import { ipcRenderer as ipc } from 'electron';
import { openProjectDialog } from './lib/open_project_dialog';

export interface MessageData {
    name: 'NEW_PROJECT' | 'NEW_MATERIAL' | 'NEW_WORKER_TYPE';
    project?: Project;
    filePath?: string;
    material?: Material;
    worker?: Worker;
}

AppState.define();
ProjectView.define();

(() => {
    const stateElement = $<AppState>(AppState.selector);
    stateElement.addEventListener(NewProjectEvent.eventname, () => {
        const appContainer = $<HTMLDivElement>('#app');
        appContainer.innerHTML = '';
        const projectView = document.createElement(ProjectView.selector) as ProjectView;
        appContainer.appendChild(projectView);
    });

    window.onmessage = ({ data }: { data: MessageData }) => {
        switch (data.name) {
            case 'NEW_PROJECT': {
                if (!data.project || !data.filePath) return;
                const project = new Project({
                    name: data.project.name,
                    date: data.project.date,
                    place: data.project.place,
                    description: data.project.descr,
                    brutto: data.project.brutto,
                    materials: data.project.materials,
                    workers: data.project.workers,
                    shouldGenId: false
                });
                project.id = data.project.id;
                stateElement.newProject({ project, filepath: data.filePath });
                break;
            }
            case 'NEW_MATERIAL': {
                stateElement.updateProject((oldProj) => {
                    if (!data.material) return null;
                    oldProj.materials.push(data.material);
                    return oldProj;
                });
                break;
            }
            case 'NEW_WORKER_TYPE': {
                stateElement.updateProject((oldProj) => {
                    if (!data.worker) return null;
                    oldProj.workers.push(data.worker);
                    return oldProj;
                });
                break;
            }
        }
    };
})();

document.querySelector('#btn-new')?.addEventListener('click', () => {
    window.open('./new_project.html', '_blank', 'width=800,height=600');
});

document.querySelector('#btn-open')?.addEventListener('click', () => {
    openProjectDialog().then(handleOpenDialogResponse);
});

ipc.on('open:new-project-dialog', () => {
    window.open('./new_project.html', '_blank', 'width=800,height=600');
});

ipc.on('open:open-project-dialog', () => {
    openProjectDialog().then(handleOpenDialogResponse);
});

ipc.on('dev:load-test-project', () => {
    const stateElement = $<AppState>(AppState.selector);
    stateElement.newProject({
        filepath: 'test-file-path',
        project: new Project({
            brutto: 1234,
            date: '2020-02-03',
            description: 'test-project-descr',
            name: 'project_name',
            place: 'project_place',
            shouldGenId: true,
            materials: [
                { name: 'Sand', price: '30.91', receiptId: 'r001' },
                { name: 'Beton', price: '31.23', receiptId: 'r002' }
            ],
            workers: [{ numHours: 10, type: 'Bauleiter', wage: 10.50 }]
        })
    });
});

/** Handle responses from the open-project-dialog */
function handleOpenDialogResponse(projAndLoc?: { project: Project; fileLocation: string }) {
    if (!projAndLoc) return;
    const { project, fileLocation } = projAndLoc;
    const stateElement = $<AppState>(AppState.selector);
    stateElement.newProject({ project, filepath: fileLocation });
}
