import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {Low} from 'lowdb';
import {JSONFile} from 'lowdb/node';

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file);
const db = new Low(adapter);

db.read().then(() => {
  db.data = db.data || {};
  db.write();
});

export default db;
