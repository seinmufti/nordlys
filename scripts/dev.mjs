import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 3000;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function getLanIp() {
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) return addr.address;
    }
  }
  return null;
}

const ip = getLanIp();
console.log("\n  Port Assign Initiative — nordlys dev server");
console.log(`  Local:   http://localhost:${PORT}`);
if (ip) {
  console.log(`  Network: http://${ip}:${PORT}`);
  console.log("  (Do not use http://0.0.0.0 — that is not a real URL.)\n");
} else {
  console.log("  Network: no LAN IP found\n");
}

const nextBin = join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(
  process.execPath,
  [nextBin, "dev", "-H", "0.0.0.0", "-p", String(PORT)],
  { stdio: "inherit", cwd: root },
);

child.on("exit", (code) => process.exit(code ?? 0));
