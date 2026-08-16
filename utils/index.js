import fs from 'fs';
import * as url from 'url';
import {md5} from './md5.js';

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

export {md5};

/**
 * Deterministically picks one of the 256 pre-generated avatar sprites
 * (admin-ui/public/images/profile/{00..ff}.png) for a given username.
 * @param {String} username
 * @return {String} 2-digit hex sprite index, e.g. "4a"
 */
export function spriteIndex(username) {
  const hash = parseInt(md5(username || '').slice(0, 8), 16);
  return (hash % 256).toString(16).padStart(2, '0');
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
  if (diff < 1.5*MINUTE) return `just now`;
  if (diff < 1.5*HOUR) return Math.round(diff/MINUTE) + ' minutes ago';
  if (diff < 1.5*DAY) return Math.round(diff/HOUR) + ' hours ago';
  if (diff < 1.5*WEEK) return Math.round(diff/DAY) + ' days ago';
  if (diff < 1.5*MONTH) return Math.round(diff/WEEK) + ' weeks ago';
  if (diff < 1.5*YEAR) return Math.round(diff/MONTH) + ' months ago';
  return Math.round(diff/YEAR) + ' years ago';
}

export default {__dirname, toPosixPath, toWindowsPath, loadJSON, md5, spriteIndex, hashCode, streamToString};

