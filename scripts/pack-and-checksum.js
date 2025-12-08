const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const packagesDir = path.join(process.cwd(), "packages");
const distDir = path.join(process.cwd(), "dist");

function getPackages() {
  if (!fs.existsSync(packagesDir)) {
    throw new Error("packages/ directory not found");
  }

  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  const packageJsons = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesDir, entry.name, "package.json"))
    .filter((pkgPath) => fs.existsSync(pkgPath));

  return packageJsons.map((pkgPath) => {
    const data = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return {
      name: data.name,
      version: data.version,
      cwd: path.dirname(pkgPath),
      dependencies: data.dependencies || {},
      peerDependencies: data.peerDependencies || {},
      devDependencies: data.devDependencies || {},
      optionalDependencies: data.optionalDependencies || {},
      bundleDependencies: data.bundleDependencies || {},
    };
  });
}

function packPackage(pkg) {
  const safeName = pkg.name.replace(/^@/, "").replace(/\//g, "-");
  const filename = `${safeName}-${pkg.version}.tgz`;
  const outputPath = path.join(distDir, filename);

  const result = spawnSync("yarn", ["pack", "--filename", outputPath], {
    cwd: pkg.cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`yarn pack failed for ${pkg.name}`);
  }

  const buffer = fs.readFileSync(outputPath);
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

  return { ...pkg, tarball: outputPath, checksum };
}

function main() {
  fs.mkdirSync(distDir, { recursive: true });

  const packages = getPackages();
  const results = packages.map(packPackage);

  const checksumsFile = path.join(distDir, "checksums.txt");
  fs.writeFileSync(
    checksumsFile,
    results.map((pkg) => `${pkg.checksum}  ${path.basename(pkg.tarball)}`).join("\n") + "\n",
    "utf8",
  );

  const assetsFile = path.join(distDir, "assets.txt");
  fs.writeFileSync(
    assetsFile,
    results.map((pkg) => pkg.tarball).concat(checksumsFile).join("\n") + "\n",
    "utf8",
  );

  const metadataFile = path.join(distDir, "pack-output.json");
  fs.writeFileSync(metadataFile, JSON.stringify(results, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Packed ${results.length} packages. Checksums written to ${checksumsFile}`);
}

main();
