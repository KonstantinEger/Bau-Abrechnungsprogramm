const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow } = electron;

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    title: 'Bau-Abrechnungen',
    width: 1300,
    height: 900
  });
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/welcomeWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  mainWindow.removeMenu();
});