/* 
 * Vercel workaround for route-group manifest path:
 * Next generates `.next/server/app/dashboard/page_client-reference-manifest.js`,
 * but Vercel's tracer looks under `.next/server/app/(dashboard)/`.
 * This copies the file if it's missing at the expected path.
 */

const fs = require('fs');
const path = require('path');

function main() {
  const projectRoot = process.cwd();
  const src = path.join(projectRoot, '.next', 'server', 'app', 'dashboard', 'page_client-reference-manifest.js');
  const dstDir = path.join(projectRoot, '.next', 'server', 'app', '(dashboard)');
  const dst = path.join(dstDir, 'page_client-reference-manifest.js');

  if (!fs.existsSync(src)) {
    // Nothing to do; let build succeed or fail normally.
    return;
  }

  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }

  try {
    fs.copyFileSync(src, dst);
    // eslint-disable-next-line no-console
    console.log('[fix-vercel-manifest] Copied client-reference manifest into (dashboard) route group.');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[fix-vercel-manifest] Failed to copy manifest:', err);
  }
}

main();

