require("dotenv").config();
import { app, BrowserWindow } from "electron";
import path from "path";
import { findTwoUnusedPorts } from "./utils";
import { startFastApiServer, startNextJsServer } from "./servers";
import { ChildProcessByStdio } from "child_process";
import { localhost } from "./constants";

var isDev = process.env.DEBUG === "True";
var resourcesDir =
  (isDev ? process.cwd() : process.resourcesPath) + "/resources";

var win: BrowserWindow | undefined;
var fastApiProcess: ChildProcessByStdio<any, any, any> | undefined;
var nextjsProcess: ChildProcessByStdio<any, any, any> | undefined;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
  });
};

async function startServers(fastApiPort: number, nextjsPort: number) {
  try {
    fastApiProcess = await startFastApiServer(
      path.join(resourcesDir, "fastapi"),
      fastApiPort,
      {
        DEBUG: isDev ? "True" : "False",
        LLM: process.env.LLM || "",
        LIBREOFFICE: process.env.LIBREOFFICE || "",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
        APP_DATA_DIRECTORY: process.env.APP_DATA_DIRECTORY || "",
      }
    );
    nextjsProcess = await startNextJsServer(
      path.join(resourcesDir, "nextjs"),
      nextjsPort,
      {
        NEXT_PUBLIC_API: `${localhost}:${fastApiPort}`,
      }
    );
  } catch (error) {
    console.error("Server startup error:", error);
  }
}

async function stopServers() {
  fastApiProcess?.kill("SIGTERM");
  nextjsProcess?.kill("SIGTERM");
}

app.whenReady().then(async () => {
  createWindow();
  win?.loadFile(path.join(resourcesDir, "ui/homepage/index.html"));
  win?.webContents.openDevTools();

  const [fastApiPort, nextjsPort] = await findTwoUnusedPorts();
  console.log(`FastAPI port: ${fastApiPort}, NextJS port: ${nextjsPort}`);

  await startServers(fastApiPort, nextjsPort);
  win?.loadURL(`${localhost}:${nextjsPort}/upload`);
});

app.on("window-all-closed", async () => {
  await stopServers();
  app.quit();
});
