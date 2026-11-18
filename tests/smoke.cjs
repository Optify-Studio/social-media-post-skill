const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-post-test-'));
const renderer = path.resolve(__dirname, '../scripts/render.cjs');
const fixture = path.join(__dirname, 'fixture.html');
const run = (...args) => spawnSync(process.execPath, [renderer, ...args], { encoding: 'utf8' });
const args = output => ['--input', fixture, '--output', output, '--width', '400', '--height', '500'];
const png = path.join(dir, 'sample.png');
const pdf = path.join(dir, 'sample.pdf');
for (const output of [png, pdf]) {
  const result = run(...args(output));
  assert.equal(result.status, 0, result.stderr || result.stdout);
}
const image = fs.readFileSync(png);
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.equal(image.readUInt32BE(16), 400);
assert.equal(image.readUInt32BE(20), 500);
assert.equal(fs.readFileSync(pdf).subarray(0, 5).toString(), '%PDF-');
assert.notEqual(run(...args(png)).status, 0, 'Existing output must not be overwritten');
assert.notEqual(run('--input', fixture, '--output', path.join(dir, 'bad.png'), '--width', '0', '--height', '500').status, 0);
assert.notEqual(run(...args(path.join(dir, 'bad.pdf')), '--transparent').status, 0);
console.log(`Smoke tests passed. Inspect sample outputs at ${dir}`);
