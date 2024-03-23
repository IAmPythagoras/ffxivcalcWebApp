
const {app, BrowserWindow} = require("electron");
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();
const spawn = require('child_process');
const process = require('process'); 
var kill  = require('tree-kill');
var djangoBackend = null;


const startDjangoServer = () =>
{   //
    //djangoBackend = spawn.spawn('python',
    //['python\\manage.py','runserver','--noreload'], {shell : true,});

    djangoBackend = spawn.spawn('python\\dist\\manage\\manage.exe',
        ['runserver','--noreload'], {shell : true,});

    djangoBackend.stdout.on('data', data =>
    {
        console.log(`stdout:\n${data}`);
    });
    djangoBackend.stderr.on('data', data =>
    {
        console.log(`stderr: ${data}`);
    });
    djangoBackend.on('error', (error) =>
    {
        console.log(`error: ${error.message}`);
    });
    djangoBackend.on('close', (code) =>
    {
        kill(djangoBackend.pid);
        console.log(`child process exited with code ${code}`);
    });
    djangoBackend.on('message', (message) =>
    {
        console.log(`message:\n${message}`);
    });
    

    return djangoBackend;
}

function checkStart(){
        const launchWindow = new BrowserWindow({
            title: "ffxivcalc",
            width : 700,
            height: 870,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            },
            icon: 'icon.png'
        });
        remoteMain.enable(launchWindow.webContents);
        const appURL = "http://127.0.0.1:8000/simulate/";
        const loadURL = `loading.html`;
        console.log('launching loading');
        launchWindow.loadURL(`file://${__dirname}/loading.html`);
        //launchWindow.loadURL(appURL)
        
}

function ElectronMainMethod(){
    startDjangoServer(); // -> Starts Django server using appEnv (python virtual environment) and makes code wait for it
    checkStart();
}

app.whenReady().then(ElectronMainMethod);
app.on('browser-window-created', (_, window) => {
    require("@electron/remote/main").enable(window.webContents);
    //window.setMenu(null);
    //window.webContents.openDevTools();
    window.webContents.session.clearCache();
})

app.on('before-quit', () => {
    //console.log("Killing process");
    // Killing both the django server and the current process
    kill(djangoBackend.pid);
    kill(process.pid);
    //console.log("Killed process");
});