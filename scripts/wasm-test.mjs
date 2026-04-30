import { spawnSync } from "node:child_process";
import { wasmCommandEnv } from "./wasm-env.mjs";

const env = wasmCommandEnv();

for (const command of ["cargo test --workspace", "wasm-pack test --node crates/wasm-core"]) {
  const result = spawnSync(command, { stdio: "inherit", shell: true, env });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
