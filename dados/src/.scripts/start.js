#!/usr/bin/env node

// Lightweight bootstrap script for Kyara.
// Location: dados/src/.scripts/start.js
// Purpose: require the main entrypoint so `npm run start:bootstrap` can be used as an alternative start command.

try {
  // Use relative path to index.js within dados/src
  require('../index.js');
} catch (err) {
  console.error('Kyara bootstrap failed to require dados/src/index.js:', err && err.stack ? err.stack : err);
  process.exit(1);
}
