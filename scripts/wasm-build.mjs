import { spawnSync } from "node:child_process";
import { wasmCommandEnv } from "./wasm-env.mjs";

const result = spawnSync(
  "wasm-pack build crates/wasm-core --target web --out-dir ../../web/src/wasm/wasm_core",
  {
    stdio: "inherit",
    shell: true,
    env: wasmCommandEnv()
  }
);

process.exit(result.status ?? 1);

