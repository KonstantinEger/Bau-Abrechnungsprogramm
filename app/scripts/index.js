/**
 * Removes welcome and sets up project view
 * @param {{
 *  name: string,
 *  id: number,
 *  date: string,
 *  notes: string
 * }} project 
 */
async function onProjectSelect(project) {
  document.body.innerHTML = '';

  const { promises: fs } = require('fs');
  const { join } = require('path');

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = join(__dirname, './styles/project.css');
  document.head.appendChild(styleLink);

  const htmlSrcPath = join(__dirname, './projectTemplate.html');
  document.body.innerHTML = await fs.readFile(htmlSrcPath, 'utf8');
}

(() => {

  window.onmessage = async ({ data }) => {
    if (data.name === 'PROJECT_SELECTED') {
      await onProjectSelect(data.project);
      return;
    }
  };

  const newProjBtn = document.querySelector('#btn-new');
  const openProjBtn = document.querySelector('#btn-open');

  newProjBtn.addEventListener('click', () => {
    const newProjWin = window.open('./newProject.html', '_blank', 'width=800,height=600');
  });

  openProjBtn.addEventListener('click', () => {
    const openProjWin = window.open('./openProject.html', '_blank', 'width=1000,height=600');
  });

})();