import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, '../src');

const forbiddenPatterns = [
  /from\s+['"]\.\.\/\.\./,       // escaping contributor root
  /from\s+['"]src\//,           // platform src root
  /from\s+['"]@heroui/,         // platform UI library
  /from\s+['"]\.\.\/src/,        // platform relative src
];

let hasError = false;

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

console.log('Verifying contributor simulation architectural boundary...');
scanDir(srcDir);

if (hasError) {
  console.error('\nFAIL: Architectural boundary violated! Contributor code must depend strictly on @rec-labs/sdk.');
  process.exit(1);
} else {
  console.log('PASS: Architectural boundary intact. Zero platform imports detected.\n');
}
