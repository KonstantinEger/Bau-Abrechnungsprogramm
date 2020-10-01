const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow } = electron;

app.on('ready', () => {
	const mainWindow = new BrowserWindow({
		width: 1300,
		height: 900,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'app/index.html'),
		protocol: 'file:',
		slashes: true
	}));
	// mainWindow.removeMenu();
});