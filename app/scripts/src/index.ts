import type { Material, Worker } from './lib/Project';
import { AppState } from './components/AppState';
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

(() => {
    const stateElement = document.querySelector<AppState>(AppState.selector);
    if (!stateElement) {
        console.warn('app-state not defined');
        return;
    }
    stateElement.addCustomEventListener('new-project', () => {
        const appContainer = document.querySelector<HTMLDivElement>('#app');
        if (!appContainer) return;
        appContainer.innerHTML = '';
        const projectView = document.createElement(ProjectView.selector) as ProjectView;
        appContainer.appendChild(projectView);
    });

    window.onmessage = ({ data }: { data: MessageData }) => {
        if (data.name === 'NEW_PROJECT') {
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
            stateElement.state = { fileLocation: data.filePath, project };
            stateElement.fireCustomEvent('new-project');
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

/** Handle responses from the open-project-dialog */
function handleOpenDialogResponse(projAndLoc?: { project: Project; fileLocation: string }) {
    if (!projAndLoc) return;
    const stateElement = document.querySelector<AppState>(AppState.selector);
    if (!stateElement) return;
    stateElement.state = projAndLoc;
    stateElement.fireCustomEvent('new-project');
}
