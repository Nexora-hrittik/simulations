import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import {
  CANONICAL_TOPICS,
  CANONICAL_TOPIC_IDS,
  isValidTopicId,
  getCanonicalTopicTitle,
} from './taxonomy.js';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const PACKAGE_NAME_REGEX = /^@(?:nexora|nexora-hrittik)\/sim-[a-z0-9-]+$/;

/**
 * Discovers and validates all simulation packages within a simulations root directory.
 *
 * @param {string} rootDir - Root directory containing the `simulations/` directory.
 * @returns {Promise<{ valid: boolean, errors: string[], warnings: string[], simulations: Array<object>, stats: object }>}
 */
export async function discoverSimulations(rootDir = process.cwd()) {
  const simulationsDir = path.resolve(rootDir, 'simulations');
  const errors = [];
  const warnings = [];
  const discoveredSimulations = [];

  if (!fs.existsSync(simulationsDir)) {
    return {
      valid: false,
      errors: [`Simulations directory not found: ${simulationsDir}`],
      warnings: [],
      simulations: [],
      stats: createEmptyStats(),
    };
  }

  const entries = fs.readdirSync(simulationsDir, { withFileTypes: true });
  const packageDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();

  const seenSimulationIds = new Map();
  const seenPackageNames = new Map();
  const jiti = createJiti(import.meta.url, { jsx: true });

  for (const dirName of packageDirs) {
    const pkgPath = path.join(simulationsDir, dirName);
    const manifestFile = path.join(pkgPath, 'package.json');
    const entryFile = path.join(pkgPath, 'src', 'index.ts');

    // 1. Package Manifest Validation
    if (!fs.existsSync(manifestFile)) {
      errors.push(`[${dirName}] Missing package.json manifest.`);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    } catch (err) {
      errors.push(`[${dirName}] Malformed package.json: ${err.message}`);
      continue;
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push(`[${dirName}] package.json missing required "name" field.`);
    } else {
      if (!PACKAGE_NAME_REGEX.test(manifest.name)) {
        errors.push(
          `[${dirName}] Invalid package name "${manifest.name}". Package names must follow "@nexora/sim-<id>" or "@nexora-hrittik/sim-<id>".`
        );
      }
      if (seenPackageNames.has(manifest.name)) {
        errors.push(
          `[${dirName}] Duplicate package name "${manifest.name}" already declared by "${seenPackageNames.get(manifest.name)}".`
        );
      } else {
        seenPackageNames.set(manifest.name, dirName);
      }
    }

    if (!manifest.version || typeof manifest.version !== 'string' || !SEMVER_REGEX.test(manifest.version)) {
      errors.push(`[${dirName}] package.json invalid or missing "version" field (must follow semantic versioning, e.g. 1.0.0).`);
    }

    // 2. Source Entrypoint Validation
    if (!fs.existsSync(entryFile)) {
      errors.push(`[${dirName}] Missing simulation entrypoint at src/index.ts.`);
      continue;
    }

    let loadedModule;
    try {
      loadedModule = jiti(entryFile);
    } catch (err) {
      errors.push(`[${dirName}] Failed to load src/index.ts: ${err.message}`);
      continue;
    }

    const simModule =
      loadedModule.default && loadedModule.default.metadata
        ? loadedModule.default
        : Object.values(loadedModule).find(
            (val) => val && typeof val === 'object' && val.metadata
          );

    if (!simModule || !simModule.metadata) {
      errors.push(`[${dirName}] No valid SimulationModule exported from src/index.ts.`);
      continue;
    }

    const meta = simModule.metadata;

    // 3. Metadata Completeness & Conformance
    if (!meta.id || typeof meta.id !== 'string') {
      errors.push(`[${dirName}] Simulation metadata.id must be a non-empty string.`);
    } else {
      if (meta.id !== dirName) {
        errors.push(
          `[${dirName}] Simulation metadata.id "${meta.id}" does not match package directory name "${dirName}".`
        );
      }
      if (seenSimulationIds.has(meta.id)) {
        errors.push(
          `[${dirName}] Duplicate simulation ID "${meta.id}" already declared by "${seenSimulationIds.get(meta.id)}".`
        );
      } else {
        seenSimulationIds.set(meta.id, dirName);
      }
    }

    if (!meta.title || typeof meta.title !== 'string' || meta.title.trim() === '') {
      errors.push(`[${dirName}] Simulation metadata.title must be a non-empty string.`);
    }

    if (!meta.shortDescription || typeof meta.shortDescription !== 'string' || meta.shortDescription.trim() === '') {
      errors.push(`[${dirName}] Simulation metadata.shortDescription must be a non-empty string.`);
    }

    if (!meta.topicId || typeof meta.topicId !== 'string') {
      errors.push(`[${dirName}] Simulation metadata.topicId must be a non-empty string.`);
    } else if (!isValidTopicId(meta.topicId)) {
      errors.push(
        `[${dirName}] Unsupported topicId "${meta.topicId}". Must be one of the canonical topics: ${CANONICAL_TOPIC_IDS.join(', ')}.`
      );
    }

    if (!meta.difficulty || !['Beginner', 'Intermediate', 'Advanced'].includes(meta.difficulty)) {
      errors.push(`[${dirName}] Simulation metadata.difficulty must be Beginner, Intermediate, or Advanced.`);
    }

    if (!meta.version || typeof meta.version !== 'string' || !SEMVER_REGEX.test(meta.version)) {
      errors.push(`[${dirName}] Simulation metadata.version must be a valid semver string.`);
    }

    if (!Array.isArray(meta.tags) || meta.tags.length === 0) {
      errors.push(`[${dirName}] Simulation metadata.tags must be a non-empty array of strings.`);
    } else if (meta.tags.some((t) => typeof t !== 'string' || t.trim() === '')) {
      errors.push(`[${dirName}] Simulation metadata.tags contains invalid or empty tag entries.`);
    }

    // 4. Automatic Category Derivation
    const derivedCategory = getCanonicalTopicTitle(meta.topicId) || 'Uncategorized';
    if (meta.category && meta.category !== derivedCategory) {
      warnings.push(
        `[${dirName}] Declared category "${meta.category}" differs from canonical category "${derivedCategory}" for topicId "${meta.topicId}". Normalized to "${derivedCategory}".`
      );
    }

    // 5. Construct Normalized Catalog Entry
    discoveredSimulations.push({
      id: meta.id || dirName,
      packageName: manifest?.name || `@nexora/sim-${dirName}`,
      packagePath: `simulations/${dirName}`,
      version: meta.version || manifest?.version || '1.0.0',
      title: meta.title,
      shortDescription: meta.shortDescription,
      topicId: meta.topicId,
      category: derivedCategory,
      difficulty: meta.difficulty,
      tags: [...(meta.tags || [])].sort(),
      topics: meta.topics ? [...meta.topics].sort() : undefined,
      concepts: meta.concepts ? [...meta.concepts].sort() : undefined,
      status: meta.status || 'available',
      featured: Boolean(meta.featured),
      estimatedTime: meta.estimatedTime,
      prerequisites: meta.prerequisites ? [...meta.prerequisites] : undefined,
      sdkVersion: meta.sdkVersion,
      author: meta.author ? { ...meta.author } : undefined,
    });
  }

  // Stable sorting by simulation id
  discoveredSimulations.sort((a, b) => a.id.localeCompare(b.id));

  // Compute dynamic stats
  const stats = computeStats(discoveredSimulations);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    simulations: discoveredSimulations,
    stats,
  };
}

function createEmptyStats() {
  const topics = {};
  const categories = {};
  for (const id of CANONICAL_TOPIC_IDS) {
    const topic = CANONICAL_TOPICS[id];
    topics[id] = { id, title: topic.title, count: 0, simulationIds: [] };
    categories[topic.title] = 0;
  }
  return {
    totalSimulations: 0,
    topics,
    categories,
  };
}

function computeStats(simulations) {
  const stats = createEmptyStats();
  stats.totalSimulations = simulations.length;

  for (const sim of simulations) {
    if (stats.topics[sim.topicId]) {
      stats.topics[sim.topicId].count += 1;
      stats.topics[sim.topicId].simulationIds.push(sim.id);
    }
    if (stats.categories[sim.category] !== undefined) {
      stats.categories[sim.category] += 1;
    } else {
      stats.categories[sim.category] = 1;
    }
  }

  return stats;
}
