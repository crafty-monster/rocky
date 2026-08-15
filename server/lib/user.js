/* eslint-disable require-jsdoc */
import {md5} from '../../utils/index.js';

// Users are determined by environment variables
// ie:
// ROCKY_USER1=admin:123456
// ROCKY_USER2=bob:456789
// etc...
const USERS = {};
for (const k of Object.keys(process.env)) {
  if (k.startsWith('ROCKY_USER')) {
    const [user, password] = process.env[k].split(':');
    console.info(`${k} is "${user}"`);
    USERS[user] = password;
  }
}

// Warn if there are no users configured.
if (Object.keys(USERS).length === 0) {
  setTimeout(() => {
    console.warn('WARNING: No users configured!');
    console.warn('Please use env variable ROCKY_USER1 to configure.');
  }, 1000);
}

export default class User {
  static me(req) {
    console.log('User.me()');
    if (!req?.headers?.authorization) return null;
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [username] = Buffer.from(b64auth, 'base64').toString().split(':');
    const id = md5(username).substr(0, 6);
    return {id, username};
  }
  static auth(username, password) {
    console.log('User.auth(%s, *******)', username);
    if (!username || !password) return false;
    // eslint-disable-next-line no-prototype-builtins
    return (USERS.hasOwnProperty(username) && USERS[username] === String(password));
  }
}
