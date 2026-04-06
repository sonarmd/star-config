import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

export interface IaCDetectionResult {
  isCDK: boolean;
  isCloudFormation: boolean;
  isAnsible: boolean;
  isTerraform: boolean;
  hasHeavyAWS: boolean;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function readPackageJson(rootDir: string): PackageJson | null {
  const pkgPath = join(rootDir, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8')) as PackageJson;
  } catch {
    return null;
  }
}

function allDeps(pkg: PackageJson): string[] {
  return [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];
}

function listRootFiles(rootDir: string): string[] {
  try {
    return readdirSync(rootDir);
  } catch {
    return [];
  }
}

/**
 * Detect what IaC tooling a project uses based on marker files and dependencies.
 * Runs synchronously — safe to call at ESLint config evaluation time.
 */
export function detectIaCType(rootDir: string): IaCDetectionResult {
  const pkg = readPackageJson(rootDir);
  const deps = pkg ? allDeps(pkg) : [];
  const files = listRootFiles(rootDir);

  const isCDK =
    existsSync(join(rootDir, 'cdk.json')) ||
    deps.includes('aws-cdk-lib') ||
    deps.some((d) => d.startsWith('@aws-cdk/'));

  const isCloudFormation =
    existsSync(join(rootDir, 'template.yaml')) ||
    existsSync(join(rootDir, 'template.json')) ||
    existsSync(join(rootDir, 'samconfig.toml')) ||
    files.some((f) => /\.template\.(json|ya?ml)$/.test(f));

  const isTerraform =
    existsSync(join(rootDir, 'terraform')) || files.some((f) => f.endsWith('.tf'));

  const isAnsible =
    existsSync(join(rootDir, 'ansible.cfg')) || existsSync(join(rootDir, 'playbooks'));

  const awsSdkCount = deps.filter((d) => d.startsWith('@aws-sdk/') || d === 'aws-sdk').length;
  const hasHeavyAWS = awsSdkCount >= 3;

  return {isCDK, isCloudFormation, isAnsible, isTerraform, hasHeavyAWS};
}
