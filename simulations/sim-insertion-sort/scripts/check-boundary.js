import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageLockPath = path.resolve(__dirname, '../package-lock.json');

const forbiddenPatterns = [
  /from\s+['"]\.\.\/\.\./,
  /from\s+['"]src\//,
  /from\s+['"]@heroui/,
  /from\s+['"]\.\.\/src/,
  /from\s+['"]@rec-labs\//,
  /from\s+['"]@nexora\/sdk/,
];

let hasError = false;

// 1. Check package manifest dependencies
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const [dep, ver] of Object.entries(allDeps)) {
    if (typeof ver === 'string' && (ver.startsWith('file:') || ver.startsWith('link:'))) {
      console.error(`[BOUNDARY VIOLATION] package.json contains local filesystem dependency: ${dep}: "${ver}"`);
      hasError = true;
    }
    if (dep === '@rec-labs/sdk' || dep === '@nexora/sdk') {
      console.error(`[BOUNDARY VIOLATION] package.json contains obsolete SDK package: "${dep}"`);
      hasError = true;
    }
  }
  if (!pkg.dependencies || !pkg.dependencies['@nexora-hrittik/sdk']) {
    console.error(`[BOUNDARY VIOLATION] package.json is missing canonical dependency "@nexora-hrittik/sdk"`);
    hasError = true;
  }
}

// 2. Check lockfile for prohibited local file/link references
if (fs.existsSync(packageLockPath)) {
  const lockContent = fs.readFileSync(packageLockPath, 'utf8');
  if (lockContent.includes('"resolved": "../sdk"') || lockContent.includes('"resolved": "file:../sdk"')) {
    console.error(`[BOUNDARY VIOLATION] package-lock.json contains local link reference to "../sdk"`);
    hasError = true;
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(line)) {
            console.error(`[BOUNDARY VIOLATION] ${path.relative(srcDir, fullPath)}:${index + 1}: ${line.trim()}`);
            hasError = true;
          }
        }
      });
    }
  }
}

console.log('Verifying Simulation Template architectural boundary...');
scanDir(srcDir);

if (hasError) {
  console.error('\nFAIL: Architectural boundary violated! Contributor code must depend strictly on @nexora-hrittik/sdk.');
  process.exit(1);
} else {
  console.log('PASS: Architectural boundary intact. Zero platform or obsolete SDK imports detected.\n');
}
