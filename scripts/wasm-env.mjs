import fs from "node:fs";
import path from "node:path";

function existingDir(value) {
  return value && fs.existsSync(value) ? value : null;
}

function findVisualStudioMsvcrtDir() {
  if (process.platform !== "win32") return null;

  const candidates = [];
  const vcTools = process.env.VCToolsInstallDir;
  if (vcTools) {
    candidates.push(path.join(vcTools, "lib", "x64"));
    candidates.push(path.join(vcTools, "lib", "onecore", "x64"));
  }

  const roots = [
    "C:\\Program Files\\Microsoft Visual Studio",
    "C:\\Program Files (x86)\\Microsoft Visual Studio"
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const major of fs.readdirSync(root, { withFileTypes: true })) {
      if (!major.isDirectory()) continue;
      const majorPath = path.join(root, major.name);
      for (const edition of fs.readdirSync(majorPath, { withFileTypes: true })) {
        if (!edition.isDirectory()) continue;
        const msvcRoot = path.join(majorPath, edition.name, "VC", "Tools", "MSVC");
        if (!fs.existsSync(msvcRoot)) continue;
        for (const version of fs.readdirSync(msvcRoot, { withFileTypes: true })) {
          if (!version.isDirectory()) continue;
          candidates.push(path.join(msvcRoot, version.name, "lib", "x64"));
          candidates.push(path.join(msvcRoot, version.name, "lib", "onecore", "x64"));
        }
      }
    }
  }

  return candidates.find((dir) => fs.existsSync(path.join(dir, "msvcrt.lib"))) ?? null;
}

export function wasmCommandEnv() {
  const env = { ...process.env };
  const msvcLib = existingDir(findVisualStudioMsvcrtDir());
  if (msvcLib && !(env.LIB ?? "").includes(msvcLib)) {
    env.LIB = `${msvcLib};${env.LIB ?? ""}`;
  }
  return env;
}

