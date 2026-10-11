import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';

const CANONICAL_TOPICS = {
  'algorithms': 'Algorithms',
  'machine-learning': 'Machine Learning',
  'data-structures': 'Data Structures',
  'computer-systems': 'Computer Systems',
  'networking': 'Computer Networks',
};

const CANONICAL_TOPIC_IDS = Object.keys(CANONICAL_TOPICS);
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;

export function validateSimulationMetadata(meta) {
  const errors = [];
  const warnings = [];

  if (!meta || typeof meta !== 'object') {
    return { valid: false, errors: ['Metadata must be a non-null object.'], warnings: [] };
  }

  if (!meta.id || typeof meta.id !== 'string') {
    errors.push('metadata.id must be a non-empty string.');
  } else if (!/^[a-z0-9-]+$/.test(meta.id)) {
    warnings.push(`metadata.id "${meta.id}" should be kebab-case (lowercase alphanumeric with hyphens).`);
  }

  if (!meta.title || typeof meta.title !== 'string' || meta.title.trim() === '') {
    errors.push('metadata.title must be a non-empty string.');
  }

  if (!meta.shortDescription || typeof meta.shortDescription !== 'string' || meta.shortDescription.trim() === '') {
    errors.push('metadata.shortDescription must be a non-empty string.');
  }

  if (!meta.topicId || typeof meta.topicId !== 'string') {
    errors.push('metadata.topicId must be a non-empty string.');
  } else if (!Object.prototype.hasOwnProperty.call(CANONICAL_TOPICS, meta.topicId)) {
    errors.push(
      `Unsupported topicId "${meta.topicId}". Must be one of the canonical topics: ${CANONICAL_TOPIC_IDS.join(', ')}.`
    );
  }

  if (!meta.difficulty || !['Beginner', 'Intermediate', 'Advanced'].includes(meta.difficulty)) {
    errors.push('metadata.difficulty must be Beginner, Intermediate, or Advanced.');
  }

  if (!meta.version || typeof meta.version !== 'string' || !SEMVER_REGEX.test(meta.version)) {
    errors.push('metadata.version must follow semantic versioning (e.g. 1.0.0).');
  }

  if (!Array.isArray(meta.tags) || meta.tags.length === 0) {
    errors.push('metadata.tags must be a non-empty array of strings.');
  } else if (meta.tags.some((t) => typeof t !== 'string' || t.trim() === '')) {
    errors.push('All items in metadata.tags must be non-empty strings.');
  }

  if (meta.category && typeof meta.category === 'string') {
    const expectedCategory = CANONICAL_TOPICS[meta.topicId];
    if (expectedCategory && meta.category !== expectedCategory) {
      warnings.push(
        `Declared category "${meta.category}" does not match canonical display title "${expectedCategory}" for topicId "${meta.topicId}".`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    derivedCategory: CANONICAL_TOPICS[meta.topicId] || 'Uncategorized',
  };
}

// Run CLI when invoked directly
if (process.argv[1] && process.argv[1].endsWith('validate-metadata.js')) {
  const rootDir = process.cwd();
  const entryPath = path.join(rootDir, 'src', 'index.ts');

  if (!fs.existsSync(entryPath)) {
    console.error(`Error: Could not locate simulation entrypoint at: ${entryPath}`);
    process.exit(1);
  }

  const jiti = createJiti(import.meta.url, { jsx: true });
  let mod;
  try {
    mod = jiti(entryPath);
  } catch (err) {
    console.error(`Error: Failed to evaluate ${entryPath}:`, err.message);
    process.exit(1);
  }

  const sim = mod.default || mod.templateSimulation || Object.values(mod).find((v) => v && v.metadata);
  if (!sim || !sim.metadata) {
    console.error('Error: No SimulationModule with metadata found in src/index.ts');
    process.exit(1);
  }

  const res = validateSimulationMetadata(sim.metadata);

  if (!res.valid) {
    console.error('❌ Simulation metadata validation FAILED:');
    for (const err of res.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  if (res.warnings.length > 0) {
    console.warn('⚠️ Validation warnings:');
    for (const warn of res.warnings) {
      console.warn(`  - ${warn}`);
    }
  }

  console.log(`✅ Simulation metadata is VALID!`);
  console.log(`   ID: "${sim.metadata.id}"`);
  console.log(`   Title: "${sim.metadata.title}"`);
  console.log(`   Canonical Topic: "${sim.metadata.topicId}"`);
  console.log(`   Derived Category: "${res.derivedCategory}"`);
  console.log(`   Difficulty: "${sim.metadata.difficulty}"`);
  console.log(`   Tags: [${sim.metadata.tags.join(', ')}]`);
}
