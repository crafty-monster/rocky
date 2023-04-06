import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../data/db.json');

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file);
const db = new Low(adapter);

db.read().then(() => {
  db.data = db.data || {};
  db.write();
});

db.ready = async () => {
  let ready = false;
  while (!ready) {
    ready = !!db.data;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

export default db;
