#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = process.env.INIT_CWD || process.cwd();
const configPath = path.join(__dirname, "..", "lint-staged.config.js");

const binCandidates = [
  path.join(projectRoot, "node_modules", ".bin", "lint-staged"),
  path.join(__dirname, "..", "node_modules", ".bin", "lint-staged"),
];

const bin = binCandidates.find(fs.existsSync);

if (!bin) {
  // eslint-disable-next-line no-console
  console.error(
    "lint-staged is not installed. Run `yarn star-config` to install the toolchain.",
  );
  process.exit(1);
}

const result = spawnSync(bin, ["-c", configPath], {
  cwd: projectRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
