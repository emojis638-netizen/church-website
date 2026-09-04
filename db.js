// Simple JSON-file database. No native build tools required, works anywhere Node runs.
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function load() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function nextId(data, kind) {
  const id = data.nextIds[kind] || 1;
  data.nextIds[kind] = id + 1;
  return id;
}

module.exports = { load, save, nextId };
