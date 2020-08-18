(() => {

  window.onmessage = ({ data }) => {
    console.log('MSG:', data);
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