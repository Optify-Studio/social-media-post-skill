#!/usr/bin/env node
// Render a local, fixed-size HTML canvas using an existing Playwright installation.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--transparent') { options.transparent = true; continue; }
    if (!['--input', '--output', '--width', '--height'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error(`Unknown or incomplete argument: ${key}`);
    }
    options[key.slice(2)] = args[++i];
  }
  const width = Number(options.width), height = Number(options.height);
  if (!options.input || !options.output || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 16384 || height > 16384) {
    throw new Error('Usage: node render.cjs --input post.html --output post.png|post.pdf --width 1080 --height 1350 [--transparent]');
  }
  const input = path.resolve(options.input), output = path.resolve(options.output);
  const ext = path.extname(output).toLowerCase();
  if (!['.png', '.pdf'].includes(ext)) throw new Error('Output must end in .png or .pdf.');
  if (options.transparent && ext === '.pdf') throw new Error('Transparent export is only supported for PNG.');
  if (!fs.existsSync(input) || !fs.statSync(input).isFile()) throw new Error(`Input file not found: ${input}`);
  if (fs.existsSync(output)) throw new Error(`Output already exists; choose another filename: ${output}`);
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { throw new Error('Playwright is not available to this script. Install it outside the user project or configure NODE_PATH to an existing installation.'); }
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const failed = [];
    page.on('requestfailed', request => failed.push(`${request.url()}: ${request.failure()?.errorText}`));
    await page.goto(pathToFileURL(input).href, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})));
    });
    const broken = await page.evaluate(() => Array.from(document.images).filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
    if (broken.length || failed.length) console.warn('Warning: assets failed to load:', ...broken, ...failed);
    if (ext === '.png') {
      await page.screenshot({ path: output, type: 'png', omitBackground: !!options.transparent, animations: 'disabled' });
    } else {
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: output, width: `${width}px`, height: `${height}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    }
    console.log(`Rendered ${output} (${width}×${height} CSS pixels). Inspect the output before delivery.`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
