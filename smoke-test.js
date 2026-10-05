#!/usr/bin/env node
'use strict';
/* Smoke tests for index.html. Run: node smoke-test.js */

const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
assert(m, 'script block not found');
const src = m[1];

/* Minimal DOM stubs so the script can load under node. */
function el() {
  return {
    hidden: false, textContent: '', innerHTML: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, appendChild() {}, removeChild() {}, select() {},
    querySelectorAll() { return []; },
  };
}
const els = {};
function stub(name, value) {
  Object.defineProperty(global, name, { value, writable: true, configurable: true });
}
stub('document', {
  getElementById(id) { return els[id] || (els[id] = el()); },
  querySelectorAll() { return []; },
  addEventListener() {},
  createElement() { return el(); },
  body: { appendChild() {}, removeChild() {} },
});
stub('localStorage', {
  _d: {},
  getItem(k) { return k in this._d ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
  removeItem(k) { delete this._d[k]; },
});
stub('navigator', {});
stub('location', { hash: '', href: 'file:///x/index.html', pathname: '/x/index.html', search: '' });
stub('history', { replaceState() {} });
stub('window', global);

eval(src);

const BN = global.BN;
assert(BN, 'BN exports missing');

/* enc / dec round trip with unicode names */
const st = {
  v: 1,
  names: [{ n: 'Åsa', by: 'Isabelle', at: 5 }],
  ballots: { Isabelle: { at: 5, order: ['Åsa'] } },
};
assert.deepStrictEqual(BN.dec(BN.enc(st)), st, 'enc/dec round trip');

/* merge: name union, first suggester wins, newest ballot wins, unknown names drop */
const a = {
  v: 1,
  names: [{ n: 'Alma', by: 'Jonathan', at: 1 }, { n: 'ben', by: 'Jonathan', at: 1 }],
  ballots: { Jonathan: { at: 10, order: ['Alma', 'ben'] } },
};
const b = {
  v: 1,
  names: [{ n: 'Ben', by: 'Isabelle', at: 2 }, { n: 'Cleo', by: 'Isabelle', at: 3 }],
  ballots: {
    Jonathan: { at: 20, order: ['ben', 'Alma'] },
    Isabelle: { at: 30, order: ['Ben', 'Cleo', 'Ghost'] },
  },
};
const mg = BN.merge(a, b);
assert.strictEqual(mg.state.names.length, 3, 'name union merges case-insensitive duplicates');
assert.strictEqual(
  mg.state.names.filter((x) => x.n.toLowerCase() === 'ben')[0].by,
  'Jonathan',
  'first suggester wins'
);
assert.strictEqual(mg.newNames, 1, 'new names counted');
assert.deepStrictEqual(mg.state.ballots.Jonathan.order, ['ben', 'Alma'], 'newer ballot wins');
assert.deepStrictEqual(mg.state.ballots.Isabelle.order, ['Ben', 'Cleo'], 'unknown names drop from ballots');

/* tally: Borda count over two ballots, 3 names */
const st2 = {
  v: 1,
  names: [{ n: 'A', by: 'J', at: 0 }, { n: 'B', by: 'I', at: 0 }, { n: 'C', by: 'J', at: 0 }],
  ballots: {
    J: { at: 1, order: ['A', 'B', 'C'] },
    I: { at: 1, order: ['B', 'C', 'A'] },
  },
};
const rows = BN.tally(st2);
const byName = {};
rows.forEach((r) => { byName[r.name] = r; });
assert.strictEqual(byName.A.score, 3 + 1, 'borda A = 4');
assert.strictEqual(byName.B.score, 2 + 3, 'borda B = 5');
assert.strictEqual(byName.C.score, 1 + 2, 'borda C = 3');
assert.strictEqual(rows[0].name, 'B', 'winner is B');
assert.strictEqual(rows[0].avg, 1.5, 'average rank of B');
assert.strictEqual(byName.B.ranks.I, 1, 'per-voter rank tracked');

/* readyCheck: waiting, stale, and complete cases */
const noBallots = { v: 1, names: st2.names.slice(0, 2), ballots: {} };
const waiting = BN.readyCheck(noBallots);
assert.strictEqual(waiting.ready, false, 'not ready without ballots');
assert.strictEqual(waiting.missing.length, 2, 'both voters reported');

const complete = BN.readyCheck(st2);
assert.strictEqual(complete.ready, true, 'ready with full ballots');

const stale = JSON.parse(JSON.stringify(st2));
stale.names.push({ n: 'D', by: 'J', at: 9 });
const staleCheck = BN.readyCheck(stale);
assert.strictEqual(staleCheck.ready, false, 'not ready with a new unplaced name');
assert(/new names/.test(staleCheck.missing.join(' ')), 'stale ballots reported');

console.log('smoke-test: all tests passed');
