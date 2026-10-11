import fs from 'node:fs';
import path from 'node:path';
import { discoverSimulations } from './discover.js';
import { CANONICAL_TOPICS, CANONICAL_TOPIC_IDS } from './taxonomy.js';

export async function generateCatalog(rootDir = process.cwd()) {
  const result = await discoverSimulations(rootDir);

  if (!result.valid) {
    console.error('Catalog discovery failed with errors:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn('Catalog discovery warnings:');
    for (const warn of result.warnings) {
      console.warn(`  - ${warn}`);
    }
  }

  const catalog = {
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

  const catalogJsonPath = path.resolve(rootDir, 'catalog.json');
  const serialized = JSON.stringify(catalog, null, 2) + '\n';
  fs.writeFileSync(catalogJsonPath, serialized, 'utf8');

  console.log(`[catalog] Deterministically generated catalog at: ${path.relative(process.cwd(), catalogJsonPath)}`);
  console.log(`[catalog] Total simulations: ${result.simulations.length}`);
  for (const topicId of CANONICAL_TOPIC_IDS) {
    const topic = CANONICAL_TOPICS[topicId];
    const count = result.stats.topics[topicId]?.count || 0;
    console.log(`  - ${topic.title} (${topicId}): ${count} simulations`);
  }

  return catalog;
}

if (process.argv[1] && process.argv[1].endsWith('generate.js')) {
  generateCatalog().catch((err) => {
    console.error('[catalog] Fatal generation error:', err);
    process.exit(1);
  });
}
