/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
const electron = require('electron');
const url = require('url');
const path = require('path');

const devMode = process.argv.includes('--dev');

require('@electron/remote/main').initialize();

const { app, BrowserWindow, Menu, ipcMain } = electron;

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    const menu = Menu.buildFromTemplate([
        {
            label: 'Datei',
            submenu: [
                {
                    label: 'Neues Projekt',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        mainWindow.webContents.send('open:new-project-dialog');
                    }
                },
                {
                    label: 'Projekt öffnen',
                    accelerator: 'CmdOrCtrl+O',
                    click() {
                        mainWindow.webContents.send('open:open-project-dialog');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                {
                    label: 'Neu laden',
                    accelerator: 'CmdOrCtrl+R',
                    click(_item, win) {
                        win.reload();
                    }
                },
                {
                    label: 'Vollbild',
                    accelerator: 'F11',
                    click(_item, win) {
                        if (win.maximizable) win.maximize();
                    }
                }
            ]
        },
        {
            label: 'Hilfe',
            submenu: [
                {
                    label: 'Docs',
                    click() {
                        electron.shell.openExternal('https://github.com/KonstantinEger/Bau-Abrechnungsprogramm/wiki');
                    }
                },
                {
                    label: 'Projekt auf GitHub öffnen',
                    click() {
                        electron.shell.openExternal('https://github.com/KonstantinEger/Bau-Abrechnungsprogramm');
                    }
                },
                {
                    label: 'DevTools',
                    click() {
                        mainWindow.webContents.openDevTools();
                    },
                    accelerator: devMode ? 'CmdOrCtrl+Shift+I' : undefined,
                    visible: devMode
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
});

ipcMain.once('quit-app', () => app.quit());
