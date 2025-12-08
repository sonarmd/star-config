#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = process.env.INIT_CWD || process.cwd();
const configPath = require.resolve("@sonarmd/lint-staged-config");

const binCandidates = [
  path.join(projectRoot, "node_modules", ".bin", "lint-staged"),
  path.join(__dirname, "node_modules", ".bin", "lint-staged"),
];

const bin = binCandidates.find(fs.existsSync);

if (!bin) {
  // eslint-disable-next-line no-console
  console.error(
    "lint-staged is not installed. Install it in your project (e.g. `yarn add -D lint-staged`).",
  );
  process.exit(1);
}

const result = spawnSync(bin, ["-c", configPath], {
  cwd: projectRoot,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
