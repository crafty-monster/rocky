import fs from 'fs';
import * as url from 'url';
import crypto from 'crypto';

export const SECOND = 1000;
export const MINUTE = 60*SECOND;
export const HOUR = 60*MINUTE;
export const DAY = 24*HOUR;
export const WEEK = 7*DAY;
export const MONTH = 30*DAY;
export const YEAR = 52*WEEK;

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

export function timeAgo(date) {
  const diff =  Date.now() - new Date(date).getTime();
  if (!diff || diff < 0) return 'some time ago';
  if (diff < 2*MINUTE) {
    return `a moment ago`;
  }
  if (diff < 2*HOUR) {
    const n = Math.round(diff/MINUTE);
    return `${n} minutes ago`;
  }
  if (diff < 2*DAY) {
    const n = Math.round(diff/HOUR);
    return `${n} hours ago`;
  }
  if (diff < 2*WEEK) {
    const n = Math.round(diff/DAY);
    return `${n} days ago`;
  }
  if (diff < 2*MONTH) {
    const n = Math.round(diff/WEEK);
    return `${n} weeks ago`;
  }
  if (diff < 2*YEAR) {
    const n = Math.round(diff/MONTH);
    return `${n} months ago`;
  }
  const n = Math.round(diff/YEAR);
  return `${n} years ago`;
}

export default {__dirname, toPosixPath, toWindowsPath, loadJSON, md5, hashCode, streamToString};

