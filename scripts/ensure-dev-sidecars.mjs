import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const binariesDir = join(rootDir, "src-tauri", "binaries");
const placeholderMarker = "BLXVOICE_DEV_SIDECAR_PLACEHOLDER";

const sidecars = [
  "whisper-cli",
  "parakeet-cli",
  "parakeet-stream-worker",
];

function detectRustTriple() {
  const result = spawnSync("rustc", ["-vV"], {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || "Failed to detect Rust host triple.");
  }

  const hostLine = result.stdout
    .split(/\r?\n/)
    .find((line) => line.startsWith("host:"));

  if (!hostLine) {
    throw new Error("Unable to find Rust host triple in rustc -vV output.");
  }

  return hostLine.replace("host:", "").trim();
}

function sidecarPath(name, triple) {
  const extension = process.platform === "win32" ? ".exe" : "";
  return join(binariesDir, `${name}-${triple}${extension}`);
}

function isPlaceholder(path) {
  if (!existsSync(path)) {
    return false;
  }

  try {
    return readFileSync(path, "utf8").includes(placeholderMarker);
  } catch {
    return false;
  }
}

function placeholderContents(name) {
  if (process.platform === "win32") {
    return [
      "@echo off",
      `echo ${placeholderMarker}: ${name} is a local development placeholder. 1>&2`,
      "exit /b 1",
      "",
    ].join("\r\n");
  }

  return [
    "#!/bin/sh",
    `echo "${placeholderMarker}: ${name} is a local development placeholder." >&2`,
    "exit 1",
    "",
  ].join("\n");
}

function ensurePlaceholder(path, name) {
  if (existsSync(path) && !isPlaceholder(path)) {
    return "existing";
  }

  writeFileSync(path, placeholderContents(name));
  if (process.platform !== "win32") {
    chmodSync(path, 0o755);
  }
  return existsSync(path) && isPlaceholder(path) ? "placeholder" : "created";
}

mkdirSync(binariesDir, { recursive: true });

const triple = detectRustTriple();
const results = sidecars.map((name) => {
  const path = sidecarPath(name, triple);
  return {
    name,
    path,
    status: ensurePlaceholder(path, name),
  };
});

for (const result of results) {
  if (result.status === "existing") {
    console.log(`Using existing sidecar: ${result.path}`);
  } else {
    console.log(`Prepared development placeholder: ${result.path}`);
  }
}
