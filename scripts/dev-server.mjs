import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const serverEntrypoint = path.join(projectRoot, "server.mjs");
const devDistDir = path.join(projectRoot, ".next-custom-server");
const targetPort = 3000;

function runPowerShell(command) {
  return spawnSync(
    "powershell",
    ["-NoProfile", "-NonInteractive", "-Command", command],
    {
      cwd: projectRoot,
      encoding: "utf8",
    }
  );
}

function getListeningPid(port) {
  const result = runPowerShell(
    `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)`
  );

  const output = result.stdout.trim();
  return output ? Number(output) : null;
}

function getProcessCommandLine(pid) {
  const result = runPowerShell(
    `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}" | Select-Object -ExpandProperty CommandLine)`
  );

  return result.stdout.trim();
}

function stopProcess(pid) {
  const result = runPowerShell(`Stop-Process -Id ${pid} -Force`);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `Failed to stop process ${pid}.`);
  }
}

function isProjectDevProcess(commandLine) {
  const normalized = commandLine.toLowerCase();
  const normalizedRoot = projectRoot.toLowerCase();

  return (
    normalized.includes(normalizedRoot) ||
    normalized.includes("server.mjs") ||
    normalized.includes("next dev") ||
    normalized.includes("\\next\\dist\\server\\lib\\start-server")
  );
}

function cleanupDevArtifacts() {
  const lockFile = path.join(devDistDir, "dev", "lock");
  try {
    fs.rmSync(lockFile, { force: true });
  } catch {
    // Ignore stale lock cleanup errors and let Next report any real problem.
  }
}

const pid = getListeningPid(targetPort);

if (pid) {
  const commandLine = getProcessCommandLine(pid);

  if (!commandLine || !isProjectDevProcess(commandLine)) {
    console.error(`Port ${targetPort} is already in use by PID ${pid}.`);
    console.error("I did not stop it automatically because it does not look like this project's dev server.");
    process.exit(1);
  }

  console.log(`Freeing port ${targetPort} by stopping stale project process ${pid}.`);
  stopProcess(pid);
}

cleanupDevArtifacts();

const child = spawn(process.execPath, [serverEntrypoint], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(targetPort),
    NEXT_DIST_DIR: ".next-custom-server",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
