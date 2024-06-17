const {app, BrowserWindow, screen, desktopCapturer,ipcMain,Menu} = require('electron');
const path = require('node:path');
import fileOperation from "./mainprocess/utils";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}
let mainWindow;
const createWindow = () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const {width, height} = primaryDisplay.workAreaSize
    console.log(width, height)
    // Create the browser window.
     mainWindow = new BrowserWindow({
        width: 800,
        height:650,
        transparent: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    desktopCapturer.getSources({types: ['window', 'screen']}).then((sources) => {
        for (const source of sources) {
            if (source.name === 'Electron') {
                mainWindow.webContents.send('SET_SOURCE', source.id)
                return
            }
        }
    })
    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
    Menu.setApplicationMenu(null)
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    ipcMain.handle('get-sources', async () => {
        const inputSources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
        return inputSources;
    });
    fileOperation()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
