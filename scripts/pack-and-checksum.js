const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

const distDir = path.join(process.cwd(), 'dist');

function getPackages() {
  const packagesDir = path.join(process.cwd(), 'packages');

  // Monorepo: packages/ directory exists
  if (fs.existsSync(packagesDir)) {
    const entries = fs.readdirSync(packagesDir, {withFileTypes: true});
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => path.join(packagesDir, e.name, 'package.json'))
      .filter((p) => fs.existsSync(p))
      .map((p) => {
        const d = JSON.parse(fs.readFileSync(p, 'utf8'));
        return {name: d.name, version: d.version, cwd: path.dirname(p)};
      });
  }

  // Single package: root package.json
  const rootPkg = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(rootPkg)) {
    const d = JSON.parse(fs.readFileSync(rootPkg, 'utf8'));
    return [{name: d.name, version: d.version, cwd: process.cwd()}];
  }

  throw new Error('No package.json found');
}

function packPackage(pkg) {
  const safeName = pkg.name.replace(/^@/, '').replace(/\//g, '-');
  const filename = `${safeName}-${pkg.version}.tgz`;
  const outputPath = path.join(distDir, filename);

  const result = spawnSync('yarn', ['pack', '--filename', outputPath], {
    cwd: pkg.cwd,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`yarn pack failed for ${pkg.name}`);
  }

  const buffer = fs.readFileSync(outputPath);
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

  return {...pkg, tarball: outputPath, checksum};
}

function main() {
  fs.mkdirSync(distDir, {recursive: true});

  const packages = getPackages();
  const results = packages.map(packPackage);

  const checksumsFile = path.join(distDir, 'checksums.txt');
  fs.writeFileSync(
    checksumsFile,
    results.map((pkg) => `${pkg.checksum}  ${path.basename(pkg.tarball)}`).join('\n') + '\n',
    'utf8'
  );

  const assetsFile = path.join(distDir, 'assets.txt');
  fs.writeFileSync(
    assetsFile,
    results
      .map((pkg) => pkg.tarball)
      .concat(checksumsFile)
      .join('\n') + '\n',
    'utf8'
  );

  const metadataFile = path.join(distDir, 'pack-output.json');
  fs.writeFileSync(metadataFile, JSON.stringify(results, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Packed ${results.length} package(s). Checksums: ${checksumsFile}`);
}

main();
