import fs from 'fs';
import * as url from 'url';
import crypto from 'crypto';

export function __dirname(meta) {
  url.fileURLToPath(new URL('.', meta.url));
}

export function toPosixPath(path) {
  return String('/' + path).replace(/\\/gi, '/').replace(/(\w):/g, (s) => s.toLowerCase().replace(':', ''));
};

export function toWindowsPath(path) {
  const drive = path.split('/')[1];
  return [drive + ':'].concat(path.split('/').slice(2)).join('\\');
};

export function loadJSON(path) {
  return JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
};

export function md5 (str) {
  return crypto.createHash('md5').update(str).digest('hex')
};

export default {__dirname, toPosixPath, toWindowsPath, loadJSON, md5};

