import { isWindows, console } from "@test/helper.js";
import { spawn, spawnSync } from "child_process";
import path from "path";
import fs from "fs";

const DEFAULT_CONTAINER = "ghcr.io/ansible/community-ansible-dev-tools:latest";

function execWithTimeout(
  command: string,
  args: string[],
  timeoutMs: number = 5000,
): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      shell: false,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Command timed out"));
    }, timeoutMs);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({ status: code, stdout, stderr });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function engineAvailable(engine: string): boolean {
  const result = spawnSync(engine, ["--version"], {
    stdio: "ignore",
    env: process.env,
  });
  return result.status === 0;
}

export async function setup() {
  const outDir = path.resolve(import.meta.dirname, "../out");
  const ansibleHome = path.join(outDir, ".ansible");
  const cacheHome = path.join(outDir, ".cache");
  fs.mkdirSync(ansibleHome, { recursive: true });
  fs.mkdirSync(cacheHome, { recursive: true });
  process.env.ANSIBLE_HOME = ansibleHome;
  process.env.XDG_CACHE_HOME = cacheHome;

  const isListing =
    process.argv.includes("list") || process.argv.includes("--list");
  if (isListing) {
    return;
  }

  if (isWindows()) {
    throw new Error("ERROR: This project does not support pure Windows, try under WSL2.");
  }

  try {
    const result = await execWithTimeout(
      "ansible-lint",
      ["--nocolor", "--version", "--offline"],
      5000,
    );
    if (result.status === 0) {
      console.info(`Detected: ${result.stdout}`);
    } else {
      console.warn(
        `Warning: ansible-lint check failed (rc=${result.status}). Continuing anyway.`,
      );
    }
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : String(e);
    console.warn(`Warning: ansible-lint check failed: ${message}. Continuing anyway.`);
  }

  const requestedSkipPodman = (process.env.SKIP_PODMAN ?? "0") === "1";
  const requestedSkipDocker = (process.env.SKIP_DOCKER ?? "0") === "1";

  if (!requestedSkipPodman && !engineAvailable("podman")) {
    process.env.SKIP_PODMAN = "1";
    console.warn("Warning: podman not found; @ee tests using podman will be skipped.");
  }

  if (!requestedSkipDocker && !engineAvailable("docker")) {
    process.env.SKIP_DOCKER = "1";
    console.warn("Warning: docker not found; @ee tests using docker will be skipped.");
  }

  if ((process.env.SKIP_PODMAN ?? "0") === "1" && (process.env.SKIP_DOCKER ?? "0") === "1") {
    console.warn("Warning: both container engines unavailable or disabled; @ee tests will be skipped.");
  } else {
    console.info(`Execution environment image for @ee tests: ${DEFAULT_CONTAINER}`);
  }
}
