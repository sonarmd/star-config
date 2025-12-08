const fs = require("fs");
const path = require("path");

if (process.env.CI) {
  return;
}

const projectRoot = process.env.INIT_CWD;
if (!projectRoot) {
  return;
}

const hookPath = path.join(projectRoot, ".git", "hooks", "pre-commit");

let hookContents;
try {
  hookContents = fs.readFileSync(hookPath, "utf8");
} catch (error) {
  // No pre-commit hook to update; exit quietly.
  return;
}

const command = "yarn prettier --write && yarn eslint --fix";

if (hookContents.includes(command)) {
  return;
}

const needsTrailingNewline = hookContents.length > 0 && !hookContents.endsWith("\n");
const marker = "# Added by @sonarmd/star-config";

try {
  fs.appendFileSync(
    hookPath,
    `${needsTrailingNewline ? "\n" : ""}${marker}\n${command}\n`,
  );
  fs.chmodSync(hookPath, 0o755);
  // eslint-disable-next-line no-console
  console.log("Appended 'yarn prettier --write && yarn eslint --fix' to existing pre-commit hook.");
} catch (error) {
  // Swallow errors to avoid failing install in consumer repos.
}
