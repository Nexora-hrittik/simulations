import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { discoverSimulations } from '../scripts/catalog/discover.js';
import { generateCatalog } from '../scripts/catalog/generate.js';
import { validateCatalog } from '../scripts/catalog/validate.js';
import { CANONICAL_TOPICS, CANONICAL_TOPIC_IDS } from '../scripts/catalog/taxonomy.js';

describe('REC Labs Simulation Discovery & Catalog Generation', () => {
  const rootDir = path.resolve(__dirname, '..');
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-catalog-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function createMockPackage(
    dirName: string,
    packageName: string,
    metadataOverrides: Record<string, any> = {},
    manifestOverrides: Record<string, any> = {}
  ) {
    const pkgDir = path.join(tempDir, 'simulations', dirName);
    const srcDir = path.join(pkgDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const manifest = {
      name: packageName,
      version: '1.0.0',
      type: 'module',
      main: './src/index.ts',
      ...manifestOverrides,
    };
    fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(manifest, null, 2), 'utf8');

    const metadata = {
      id: dirName,
      title: `${dirName.charAt(0).toUpperCase() + dirName.slice(1)} Visualizer`,
      shortDescription: `Interactive visualization for ${dirName}.`,
      topicId: 'algorithms',
      category: 'Algorithms',
      difficulty: 'Beginner',
      tags: [dirName, 'interactive'],
      version: '1.0.0',
      sdkVersion: '0.1.0',
      ...metadataOverrides,
    };

    const code = `
export const sim = {
  metadata: ${JSON.stringify(metadata, null, 2)},
  defaultConfig: {},
  createInitialState: () => ({}),
  step: (s) => ({ nextState: s, isComplete: true }),
  Visualization: () => null,
  Controls: () => null,
};
export default sim;
`;
    fs.writeFileSync(path.join(srcDir, 'index.ts'), code, 'utf8');
  }

  // Case 1: A valid new simulation is discovered
  it('1. discovers a valid newly added simulation package', async () => {
    createMockPackage('graph-traversal', '@nexora/sim-graph-traversal', {
      topicId: 'algorithms',
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.simulations).toHaveLength(1);
    expect(result.simulations[0].id).toBe('graph-traversal');
    expect(result.simulations[0].packageName).toBe('@nexora/sim-graph-traversal');
  });

  // Case 2: Its canonical topic is preserved in the catalog
  it('2. preserves canonical topicId in the catalog entry', async () => {
    createMockPackage('cnn-visualizer', '@nexora-hrittik/sim-cnn-visualizer', {
      topicId: 'machine-learning',
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(true);
    expect(result.simulations[0].topicId).toBe('machine-learning');
  });

  // Case 3: Its display category is derived consistently
  it('3. derives human-readable display category consistently from canonical topic', async () => {
    createMockPackage('tcp-handshake', '@nexora/sim-tcp-handshake', {
      topicId: 'networking',
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(true);
    expect(result.simulations[0].category).toBe('Computer Networks');
  });

  // Case 4: An unsupported topic ID fails validation
  it('4. fails validation when an unsupported topic ID is provided', async () => {
    createMockPackage('quantum-teleportation', '@nexora/sim-quantum-teleportation', {
      topicId: 'quantum-physics',
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((err) =>
        err.includes('Unsupported topicId "quantum-physics"')
      )
    ).toBe(true);
  });

  // Case 5: Duplicate simulation IDs fail validation
  it('5. fails validation when duplicate simulation IDs are detected', async () => {
    createMockPackage('duplicate-sim', '@nexora/sim-dup-one');
    // Create second package in different folder but with colliding ID
    const pkgDir2 = path.join(tempDir, 'simulations', 'duplicate-two');
    const srcDir2 = path.join(pkgDir2, 'src');
    fs.mkdirSync(srcDir2, { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir2, 'package.json'),
      JSON.stringify({ name: '@nexora/sim-dup-two', version: '1.0.0', type: 'module' }),
      'utf8'
    );
    fs.writeFileSync(
      path.join(srcDir2, 'index.ts'),
      `export default { metadata: { id: "duplicate-two", title: "Two", shortDescription: "Two", topicId: "algorithms", difficulty: "Beginner", version: "1.0.0", tags: ["test"] } };`,
      'utf8'
    );

    // Now test duplicate by pointing both to same ID
    fs.writeFileSync(
      path.join(srcDir2, 'index.ts'),
      `export default { metadata: { id: "duplicate-sim", title: "Colliding", shortDescription: "Colliding", topicId: "algorithms", difficulty: "Beginner", version: "1.0.0", tags: ["test"] } };`,
      'utf8'
    );

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((err) =>
        err.includes('does not match package directory name') || err.includes('Duplicate simulation ID')
      )
    ).toBe(true);
  });

  // Case 6: Duplicate package names fail validation
  it('6. fails validation when duplicate package names are detected', async () => {
    createMockPackage('pkg-alpha', '@nexora/sim-shared-name');
    createMockPackage('pkg-beta', '@nexora/sim-shared-name');

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((err) =>
        err.includes('Duplicate package name "@nexora/sim-shared-name"')
      )
    ).toBe(true);
  });

  // Case 7: Missing required metadata fails validation
  it('7. fails validation when mandatory metadata fields are missing', async () => {
    createMockPackage('missing-meta', '@nexora/sim-missing-meta', {
      title: '',
      shortDescription: '',
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(false);
    expect(result.errors.some((err) => err.includes('Simulation metadata.title'))).toBe(true);
    expect(result.errors.some((err) => err.includes('Simulation metadata.shortDescription'))).toBe(true);
  });

  // Case 8: Malformed metadata fails with an actionable error
  it('8. fails validation with actionable error for malformed difficulty or tags', async () => {
    createMockPackage('malformed-sim', '@nexora/sim-malformed-sim', {
      difficulty: 'Expert',
      tags: [],
    });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((err) =>
        err.includes('Simulation metadata.difficulty must be Beginner, Intermediate, or Advanced')
      )
    ).toBe(true);
    expect(
      result.errors.some((err) =>
        err.includes('Simulation metadata.tags must be a non-empty array of strings')
      )
    ).toBe(true);
  });

  // Case 9: Catalog output is deterministic
  it('9. produces bit-for-bit deterministic catalog output on multiple generation runs', async () => {
    createMockPackage('zebra-sort', '@nexora/sim-zebra-sort');
    createMockPackage('alpha-sort', '@nexora/sim-alpha-sort');

    const catalog1 = await generateCatalog(tempDir);
    const catalog2 = await generateCatalog(tempDir);

    expect(JSON.stringify(catalog1)).toBe(JSON.stringify(catalog2));
    // Verify sorting is alphabetical by ID
    expect(catalog1.simulations[0].id).toBe('alpha-sort');
    expect(catalog1.simulations[1].id).toBe('zebra-sort');
  });

  // Case 10: Category counts match discovered catalog entries
  it('10. dynamically computes accurate topic and category counts without hardcoding', async () => {
    createMockPackage('algo-one', '@nexora/sim-algo-one', { topicId: 'algorithms' });
    createMockPackage('algo-two', '@nexora/sim-algo-two', { topicId: 'algorithms' });
    createMockPackage('ml-one', '@nexora/sim-ml-one', { topicId: 'machine-learning' });

    const result = await discoverSimulations(tempDir);
    expect(result.valid).toBe(true);
    expect(result.stats.totalSimulations).toBe(3);
    expect(result.stats.topics['algorithms'].count).toBe(2);
    expect(result.stats.topics['machine-learning'].count).toBe(1);
    expect(result.stats.topics['data-structures'].count).toBe(0);
    expect(result.stats.categories['Algorithms']).toBe(2);
    expect(result.stats.categories['Machine Learning']).toBe(1);
    expect(result.stats.categories['Data Structures']).toBe(0);
  });

  // Case 11: Existing protected packages remain untouched & valid
  it('11. verifies existing protected packages in real catalog remain untouched and 100% valid', async () => {
    const result = await discoverSimulations(rootDir);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    const ids = result.simulations.map((s) => s.id);
    expect(ids).toContain('insertion-sort');
    expect(ids).toContain('perceptron');
  });

  // Case 12: Package namespaces across catalog
  it('12. supports scoped package namespaces (@nexora-hrittik/sim-*) across catalog', async () => {
    const result = await discoverSimulations(rootDir);
    const packageNames = result.simulations.map((s) => s.packageName);
    expect(packageNames).toContain('@nexora-hrittik/sim-insertion-sort');
    expect(packageNames).toContain('@nexora-hrittik/sim-perceptron');
  });

  // Case 13: A second simulation can be added without manually editing a central category registry
  it('13. allows adding independent simulations without editing central registry arrays', async () => {
    // Starting with 1 package
    createMockPackage('quick-sort', '@nexora/sim-quick-sort', { topicId: 'algorithms' });
    const run1 = await discoverSimulations(tempDir);
    expect(run1.simulations).toHaveLength(1);
    expect(run1.stats.topics['algorithms'].count).toBe(1);

    // Contributor adds a 2nd package directory without touching any shared file
    createMockPackage('heap-sort', '@nexora/sim-heap-sort', { topicId: 'algorithms' });
    const run2 = await discoverSimulations(tempDir);
    expect(run2.simulations).toHaveLength(2);
    expect(run2.stats.topics['algorithms'].count).toBe(2);
    expect(run2.simulations.map((s) => s.id)).toEqual(['heap-sort', 'quick-sort']);
  });

  // Case 14: Committed catalog.json validation passes against real workspace
  it('14. validates freshness and integrity of committed catalog.json against actual catalog', async () => {
    const isValid = await validateCatalog(rootDir);
    expect(isValid).toBe(true);
  });
});
