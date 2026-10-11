import fs from 'node:fs';
import path from 'node:path';
import { discoverSimulations } from './discover.js';
import { CANONICAL_TOPICS, CANONICAL_TOPIC_IDS } from './taxonomy.js';

export async function validateCatalog(rootDir = process.cwd()) {
  const result = await discoverSimulations(rootDir);

  if (!result.valid) {
    console.error('[catalog:validate] Validation failed with errors:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    return false;
  }

  const catalogJsonPath = path.resolve(rootDir, 'catalog.json');
  if (!fs.existsSync(catalogJsonPath)) {
    console.error(`[catalog:validate] Missing catalog.json at ${catalogJsonPath}. Run 'npm run catalog:generate'.`);
    return false;
  }

  const expectedCatalog = {
    version: '1.0.0',
    description: 'REC Labs official simulation catalog (auto-generated)',
    taxonomy: CANONICAL_TOPIC_IDS.map((id) => ({
      id,
      title: CANONICAL_TOPICS[id].title,
      description: CANONICAL_TOPICS[id].description,
      count: result.stats.topics[id]?.count || 0,
      simulationIds: result.stats.topics[id]?.simulationIds || [],
    })),
    simulations: result.simulations,
    stats: result.stats,
  };

  const expectedContent = JSON.stringify(expectedCatalog, null, 2) + '\n';
  const actualContent = fs.readFileSync(catalogJsonPath, 'utf8');

  if (actualContent !== expectedContent) {
    console.error('[catalog:validate] Stale catalog detected! Committed catalog.json differs from newly discovered catalog.');
    console.error('Run "npm run catalog:generate" to synchronize catalog.json.');
    return false;
  }

  console.log(`[catalog:validate] PASS: All ${result.simulations.length} simulation packages are valid and catalog.json is up-to-date.`);
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('validate.js')) {
  validateCatalog().then((ok) => {
    if (!ok) process.exit(1);
  }).catch((err) => {
    console.error('[catalog:validate] Unexpected error:', err);
    process.exit(1);
  });
}
