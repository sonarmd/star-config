const fs = require("fs");
const path = require("path");

const TAG_NAME = process.env.TAG_NAME || process.env.GITHUB_REF_NAME || "unknown-tag";
const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || "unknown-sha";
const OUTPUT = process.env.RELEASE_NOTES_PATH || "release-notes.md";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PACKAGES_FILE = process.env.PACKAGES_FILE || path.join(process.cwd(), "dist", "pack-output.json");
const CHECKSUMS_FILE = process.env.CHECKSUMS_FILE || path.join(process.cwd(), "dist", "checksums.txt");

const repoEnv = process.env.GITHUB_REPOSITORY || "";
const [owner, repo] = repoEnv.split("/");

async function fetchCommitSignature() {
  if (!GITHUB_TOKEN || !owner || !repo || !COMMIT_SHA) {
    return { fingerprint: "unavailable", algorithm: "unknown", state: "missing-token" };
  }

  const query = `
    query($owner: String!, $repo: String!, $oid: GitObjectID!) {
      repository(owner: $owner, name: $repo) {
        object(oid: $oid) {
          ... on Commit {
            signature {
              keyFingerprint
              signatureAlgorithm
              state
              wasSignedByGitHub
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "sonarmd-release-notes",
    },
    body: JSON.stringify({
      query,
      variables: { owner, repo, oid: COMMIT_SHA },
    }),
  });

  if (!res.ok) {
    return { fingerprint: "unavailable", algorithm: "unknown", state: `http-${res.status}` };
  }

  const body = await res.json();
  const sig = body?.data?.repository?.object?.signature;
  if (!sig) {
    return { fingerprint: "unavailable", algorithm: "unknown", state: "no-signature" };
  }

  return {
    fingerprint: sig.keyFingerprint || "unavailable",
    algorithm: sig.signatureAlgorithm || "unknown",
    state: sig.state || "unknown",
    wasSignedByGitHub: Boolean(sig.wasSignedByGitHub),
  };
}

function formatDeps(pkgSection, title) {
  if (!pkgSection || typeof pkgSection !== "object" || Array.isArray(pkgSection)) {
    return `${title}: none`;
  }
  const entries = Object.entries(pkgSection).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) {
    return `${title}: none`;
  }
  return `${title}:\n${entries.map(([name, version]) => `- ${name}: ${version}`).join("\n")}`;
}

function loadPackages() {
  if (fs.existsSync(PACKAGES_FILE)) {
    return JSON.parse(fs.readFileSync(PACKAGES_FILE, "utf8"));
  }

  const packagesRoot = path.join(process.cwd(), "packages");
  if (!fs.existsSync(packagesRoot)) {
    return [];
  }

  const entries = fs.readdirSync(packagesRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesRoot, entry.name, "package.json"))
    .filter((pkgPath) => fs.existsSync(pkgPath))
    .map((pkgPath) => {
      const data = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return {
        name: data.name,
        version: data.version,
        tarball: "n/a",
        checksum: "n/a",
        dependencies: data.dependencies || {},
        peerDependencies: data.peerDependencies || {},
        devDependencies: data.devDependencies || {},
        optionalDependencies: data.optionalDependencies || {},
        bundleDependencies: data.bundleDependencies || {},
      };
    });
}

async function main() {
  const packages = loadPackages();
  const signature = await fetchCommitSignature();

  const sections = [
    `# Release ${TAG_NAME}`,
    `- commit: ${COMMIT_SHA}`,
    `- checksums_file: ${CHECKSUMS_FILE}`,
    `- commit_signature_fingerprint: ${signature.fingerprint}`,
    `- commit_signature_algorithm: ${signature.algorithm}`,
    `- commit_signature_state: ${signature.state}`,
    `- signed_by_github: ${signature.wasSignedByGitHub ? "yes" : "no"}`,
    "",
    "## Packages",
  ];

  packages.forEach((pkg) => {
    sections.push(`### ${pkg.name} v${pkg.version}`);
    if (pkg.tarball) {
      sections.push(`- tarball: ${path.basename(pkg.tarball)}`);
    }
    if (pkg.checksum) {
      sections.push(`- sha256: ${pkg.checksum}`);
    }
    sections.push(formatDeps(pkg.dependencies, "runtime"));
    sections.push(formatDeps(pkg.peerDependencies, "peer"));
    sections.push(formatDeps(pkg.devDependencies, "dev"));
    sections.push(formatDeps(pkg.optionalDependencies, "optional"));
    sections.push(formatDeps(pkg.bundleDependencies, "bundled"));
    sections.push(""); // spacer
  });

  fs.writeFileSync(OUTPUT, sections.join("\n"), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Release notes written to ${OUTPUT}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to generate release notes", error);
  process.exit(1);
});
