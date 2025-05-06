import { app, BrowserWindow } from 'electron'
import { spawn, exec, ChildProcessWithoutNullStreams } from 'child_process'
import path from 'path'
import util from 'util'

const execAsync = util.promisify(exec)

var win: BrowserWindow | undefined
var fastApiProcess: ChildProcessWithoutNullStreams | undefined
var nextjsProcess: ChildProcessWithoutNullStreams | undefined

var isDev = process.env.NODE_ENV === 'development'
var resourcesDir = (isDev ? process.cwd() : process.resourcesPath) + '/resources'

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
    });
    fastApiProcess.stdout.on('data', (data) => {
      console.log(`FastAPI: ${data}`);
    });
    fastApiProcess.stderr.on('data', (data) => {
      console.error(`FastAPI Error: ${data}`);
    });
    // Wait for FastAPI server to start
    await execAsync('npx wait-on http://0.0.0.0:48388/docs');

    // Start NextJS server
    nextjsProcess = spawn("npm", ["start"], {
      cwd: path.join(resourcesDir, 'nextjs'),
    })
    nextjsProcess.stdout.on('data', (data) => {
      console.log(`NextJS: ${data}`);
    });
    nextjsProcess.stderr.on('data', (data) => {
      console.error(`NextJS Error: ${data}`);
    });
    // Wait for NextJS server to start
    await execAsync('npx wait-on http://0.0.0.0:48389');
    console.log("Servers started")
  } catch (error) {
    console.error('Server startup error:', error);
  }
}

function stopServers() {
  console.log("Stopping servers...")
  fastApiProcess?.kill("SIGKILL")
  nextjsProcess?.kill("SIGKILL")
}

app.whenReady().then(async () => {
  console.log("When ready...")
  createWindow()
  await startServers()

  console.log("Loading URL...")
  win?.loadURL('http://0.0.0.0:48389')
})

app.on('window-all-closed', () => {
  console.log("Window all closed")
  stopServers()
  app.quit()
})

process.on('SIGINT', () => {
  console.log("SIGINT received")
  stopServers()
  app.quit()
})

process.on('SIGTERM', () => {
  console.log("SIGTERM received")
  stopServers()
  app.quit()
})