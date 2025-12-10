#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const RELEASES_DIR = 'releases';
const LIST_FILE = join(RELEASES_DIR, 'list.json');

/**
 * Check if a markdown file is compliant with markdownParser standards
 * A compliant file must have:
 * 1. Valid frontmatter (between --- markers)
 * 2. At least one change in format: - [TYPE] Description
 */
function isCompliantMarkdown(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Check for frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const frontmatterMatch = content.match(frontmatterRegex);
    if (!frontmatterMatch) {
      return false;
    }

    // Extract content after frontmatter
    const contentAfterFrontmatter = content.replace(frontmatterRegex, '').trim();

    // Check for at least one change in the expected format
    const changeRegex = /^- \[[^\]]+\] .+/m;
    const hasValidChange = changeRegex.test(contentAfterFrontmatter);

    return hasValidChange;
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Scan releases folder and update list.json with compliant files
 */
function updateReleaseList() {
  try {
    // Get all .md files in releases directory
    const files = readdirSync(RELEASES_DIR)
      .filter(file => extname(file) === '.md')
      .map(file => join(RELEASES_DIR, file));

    // Filter for compliant files
    const compliantFiles = files.filter(isCompliantMarkdown);

    // Sort by version (assuming filename format like v0.1.0.md)
    compliantFiles.sort((a, b) => {
      const versionA = a.match(/v(\d+\.\d+\.\d+)/)?.[1] || '0.0.0';
      const versionB = b.match(/v(\d+\.\d+\.\d+)/)?.[1] || '0.0.0';
      return versionB.localeCompare(versionA, undefined, { numeric: true });
    });

    // Write to list.json
    writeFileSync(LIST_FILE, JSON.stringify(compliantFiles, null, 2));

    console.log(`✅ Updated ${LIST_FILE} with ${compliantFiles.length} compliant release files:`);
    compliantFiles.forEach(file => console.log(`  - ${file}`));

    if (files.length !== compliantFiles.length) {
      const nonCompliant = files.filter(file => !compliantFiles.includes(file));
      console.log(`⚠️  Skipped ${nonCompliant.length} non-compliant files:`);
      nonCompliant.forEach(file => console.log(`  - ${file}`));
    }

  } catch (error) {
    console.error('❌ Error updating release list:', error.message);
    process.exit(1);
  }
}

// Run the update
updateReleaseList();