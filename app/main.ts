import { app, BrowserWindow } from 'electron'
import { spawn, exec, ChildProcessByStdio } from 'child_process'
import path from 'path'
import util from 'util'
import { killProcess } from './utils'

const execAsync = util.promisify(exec)

var isDev = process.env.NODE_ENV === 'development'
var resourcesDir = (isDev ? process.cwd() : process.resourcesPath) + '/resources'

var win: BrowserWindow | undefined
var fastApiProcess: ChildProcessByStdio<any, any, any> | undefined
var nextjsProcess: ChildProcessByStdio<any, any, any> | undefined

const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
  })
}

async function startServers() {
  console.log("Starting servers...")
  try {
    // Start FastAPI server
    fastApiProcess = spawn('env/bin/python', ['server.py'], {
      cwd: path.join(resourcesDir, 'fastapi'),
      stdio: ["inherit", "pipe", "pipe"],
    });
    fastApiProcess.stdout.on('data', (data: any) => {
      console.log(`FastAPI: ${data}`);
    });
    fastApiProcess.stderr.on('data', (data: any) => {
      console.error(`FastAPI Error: ${data}`);
    });
    // Wait for FastAPI server to start
    await execAsync('npx wait-on http://0.0.0.0:48388/docs');

    // Start NextJS server
    nextjsProcess = spawn("npm", ["start"], {
      cwd: path.join(resourcesDir, 'nextjs'),
    })
    nextjsProcess.stdout.on('data', (data: any) => {
      console.log(`NextJS: ${data}`);
    });
    nextjsProcess.stderr.on('data', (data: any) => {
      console.error(`NextJS Error: ${data}`);
    });
    // Wait for NextJS server to start
    await execAsync('npx wait-on http://0.0.0.0:48389');
    console.log("Servers started")
  } catch (error) {
    console.error('Server startup error:', error);
  }
}

async function stopServers() {
  console.log("Stopping servers...")
  if (fastApiProcess?.pid) {
    await killProcess(fastApiProcess.pid)
  }
  if (nextjsProcess?.pid) {
    await killProcess(nextjsProcess.pid)
  }
}

app.whenReady().then(async () => {
  console.log("When ready...")
  createWindow()
  win?.loadFile(path.join(resourcesDir, 'ui/homepage/index.html'))
  win?.webContents.openDevTools()

  // await startServers()

  console.log("Loading URL...")
  // win?.loadURL('http://0.0.0.0:48389')
})

app.on('window-all-closed', async () => {
  console.log("Window all closed")
  await stopServers()
  app.quit()
})