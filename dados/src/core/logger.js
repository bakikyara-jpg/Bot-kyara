// dados/src/core/logger.js
// Simple centralized logger for Kyara
export function formatPrefix(scope = 'KYARA') {
  const time = new Date().toISOString();
  return `[${time}] [${scope}]`;
}

export function info(...args) {
  console.log(formatPrefix('KYARA'), ...args);
}

export function warn(...args) {
  console.warn(formatPrefix('KYARA'), ...args);
}

export function error(...args) {
  console.error(formatPrefix('ERROR'), ...args);
}

export function debug(...args) {
  // keep debug toggle via env
  if (process.env.KYARA_DEBUG === '1') console.debug(formatPrefix('DEBUG'), ...args);
}

export default { info, warn, error, debug };
