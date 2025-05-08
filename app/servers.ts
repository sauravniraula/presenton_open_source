import { spawn, exec } from "child_process";
import util from "util";
import { localhost } from "./constants";

const execAsync = util.promisify(exec);

export async function startFastApiServer(
  directory: string,
  port: number,
  env: FastApiEnv
) {
  // Start FastAPI server
  const fastApiProcess = spawn(
    "env/bin/python",
    ["server.py", "--port", port.toString()],
    {
      cwd: directory,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, ...env },
    }
  );
  fastApiProcess.stdout.on("data", (data: any) => {
    console.log(`FastAPI: ${data}`);
  });
  fastApiProcess.stderr.on("data", (data: any) => {
    console.error(`FastAPI Error: ${data}`);
  });
  // Wait for FastAPI server to start
  await execAsync(`npx wait-on ${localhost}:${port}/docs`);
  return fastApiProcess;
}

export async function startNextJsServer(
  directory: string,
  port: number,
  env: NextJsEnv
) {
  // Start NextJS server
  const nextjsProcess = spawn(
    "npm",
    ["run", "dev", "--", "-p", port.toString()],
    {
      cwd: directory,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, ...env },
    }
  );
  nextjsProcess.stdout.on("data", (data: any) => {
    console.log(`NextJS: ${data}`);
  });
  nextjsProcess.stderr.on("data", (data: any) => {
    console.error(`NextJS Error: ${data}`);
  });
  // Wait for NextJS server to start
  await execAsync(`npx wait-on ${localhost}:${port}`);
  return nextjsProcess;
}
