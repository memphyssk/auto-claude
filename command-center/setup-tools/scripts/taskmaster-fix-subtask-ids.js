#!/usr/bin/env node
// Repair tool — renumber subtask ids sequentially within each parent and
// rewrite dependency references that pointed at the old ids.
//
// Run from project root (where .taskmaster/ lives):
//   node command-center/setup-tools/scripts/taskmaster-fix-subtask-ids.js [--dry-run]
//
// Cause: a parent.id was copied into every subtask.id during direct JSON edit.
// Fix: assign each parent's subtasks ids 1..N in array order; rewrite any
// dependency reference of shape "<parent>.<oldId>" to "<parent>.<newId>".
//
// Idempotent. Safe to re-run.

const fs = require("fs");
const path = require("path");

const PATH = path.resolve(".taskmaster/tasks/tasks.json");
const DRY = process.argv.includes("--dry-run");

if (!fs.existsSync(PATH)) {
  console.error(`not found: ${PATH}`);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(PATH, "utf8"));
const remap = new Map(); // "<parent>.<oldId>@<tag>" -> "<parent>.<newId>"
let renumbered = 0;
let parentsTouched = 0;

for (const [tagName, tag] of Object.entries(data)) {
  if (!tag.tasks) continue;
  for (const parent of tag.tasks) {
    if (!parent.subtasks?.length) continue;
    const oldIds = parent.subtasks.map(s => s.id);
    const expected = Array.from({ length: oldIds.length }, (_, i) => i + 1);
    if (JSON.stringify(oldIds) === JSON.stringify(expected)) continue;
    parentsTouched++;
    parent.subtasks.forEach((sub, i) => {
      const newId = i + 1;
      remap.set(`${parent.id}.${sub.id}@${tagName}`, `${parent.id}.${newId}`);
      sub.id = newId;
      renumbered++;
    });
  }
}

// Rewrite dependency strings of shape "<parent>.<oldId>" within the same tag.
let depsRewritten = 0;
for (const [tagName, tag] of Object.entries(data)) {
  if (!tag.tasks) continue;
  const visit = (deps) => {
    if (!Array.isArray(deps)) return deps;
    return deps.map(d => {
      if (typeof d !== "string") return d;
      const key = `${d}@${tagName}`;
      if (remap.has(key)) {
        depsRewritten++;
        return remap.get(key);
      }
      return d;
    });
  };
  for (const parent of tag.tasks) {
    if (parent.dependencies) parent.dependencies = visit(parent.dependencies);
    for (const sub of parent.subtasks ?? []) {
      if (sub.dependencies) sub.dependencies = visit(sub.dependencies);
    }
  }
}

if (DRY) {
  console.log(`DRY-RUN: would renumber ${renumbered} subtasks across ${parentsTouched} parents; would rewrite ${depsRewritten} dependency refs`);
  process.exit(0);
}

if (parentsTouched === 0) {
  console.log("OK — no collisions found, no changes written");
  process.exit(0);
}

const backup = `${PATH}.bak.${Date.now()}`;
fs.copyFileSync(PATH, backup);
fs.writeFileSync(PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`renumbered ${renumbered} subtasks across ${parentsTouched} parents`);
console.log(`rewrote ${depsRewritten} dependency refs`);
console.log(`backup written to ${backup}`);
console.log(`updated ${PATH}`);
