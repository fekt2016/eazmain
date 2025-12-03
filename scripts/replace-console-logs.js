#!/usr/bin/env node
/**
 * Script to replace all console.* statements with logger utility
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src');
const LOGGER_IMPORT = "import logger from '../../shared/utils/logger';";
const LOGGER_IMPORT_SHARED = "import logger from '../utils/logger';";
const LOGGER_IMPORT_FEATURES = "import logger from '../../shared/utils/logger';";

// Find all JS/JSX files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get relative depth for import path
function getLoggerImport(filePath) {
  const relativePath = path.relative(SRC_DIR, filePath);
  const depth = relativePath.split(path.sep).length - 1;
  
  if (filePath.includes('shared/')) {
    return "import logger from '../utils/logger';";
  } else if (filePath.includes('features/') || filePath.includes('pages/')) {
    return "import logger from '../../shared/utils/logger';";
  } else {
    return "import logger from '../shared/utils/logger';";
  }
}

// Replace console statements
function replaceConsoleStatements(content, filePath) {
  let modified = content;
  let hasConsole = false;
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes('import logger') || content.includes("from '../../shared/utils/logger'") || content.includes("from '../utils/logger'");
  
  // Replace console.log
  if (content.includes('console.log')) {
    hasConsole = true;
    modified = modified.replace(/console\.log\(/g, 'logger.log(');
  }
  
  // Replace console.error
  if (content.includes('console.error')) {
    hasConsole = true;
    modified = modified.replace(/console\.error\(/g, 'logger.error(');
  }
  
  // Replace console.warn
  if (content.includes('console.warn')) {
    hasConsole = true;
    modified = modified.replace(/console\.warn\(/g, 'logger.warn(');
  }
  
  // Replace console.debug
  if (content.includes('console.debug')) {
    hasConsole = true;
    modified = modified.replace(/console\.debug\(/g, 'logger.debug(');
  }
  
  // Replace console.info
  if (content.includes('console.info')) {
    hasConsole = true;
    modified = modified.replace(/console\.info\(/g, 'logger.info(');
  }
  
  // Add logger import if needed
  if (hasConsole && !hasLoggerImport) {
    const loggerImport = getLoggerImport(filePath);
    
    // Find the last import statement
    const importRegex = /^import\s+.*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      modified = content.slice(0, insertIndex) + '\n' + loggerImport + content.slice(insertIndex);
    } else {
      // No imports, add at the top
      modified = loggerImport + '\n' + modified;
    }
  }
  
  return { modified, hasConsole };
}

// Process all files
function processFiles() {
  const files = findFiles(SRC_DIR);
  let processed = 0;
  let skipped = 0;
  
  console.log(`Found ${files.length} files to process...`);
  
  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Skip logger.js itself and ErrorBoundary (which needs console.error)
      if (filePath.includes('logger.js') || filePath.includes('ErrorBoundary.jsx')) {
        skipped++;
        return;
      }
      
      const { modified, hasConsole } = replaceConsoleStatements(content, filePath);
      
      if (hasConsole && modified !== content) {
        fs.writeFileSync(filePath, modified, 'utf8');
        processed++;
        console.log(`✓ Processed: ${path.relative(SRC_DIR, filePath)}`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n✅ Processed ${processed} files`);
  console.log(`⏭️  Skipped ${skipped} files`);
}

// Run the script
processFiles();

