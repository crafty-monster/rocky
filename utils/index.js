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

export function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export async function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export default {__dirname, toPosixPath, toWindowsPath, loadJSON, md5, hashCode, streamToString};

