#!/usr/bin/env node
// Thin entry point for postinstall — handles the case where dist/
// hasn't been compiled yet (fresh clone of star-config itself).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = process.env.INIT_CWD || process.cwd();

// Skip when installing inside star-config itself
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (pkg.name === '@sonarmd/star-config') process.exit(0);
} catch {
  process.exit(0);
}

// Load the compiled postinstall — if it doesn't exist, dist wasn't built yet
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compiled = path.join(__dirname, '..', 'dist', 'scripts', 'postinstall.js');
if (!fs.existsSync(compiled)) {
  console.log('@sonarmd/star-config: postinstall skipped (dist not built yet)');
  process.exit(0);
}

await import(compiled);
