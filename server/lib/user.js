/* eslint-disable require-jsdoc */
import {md5} from '../../utils/index.js';

// Users are determined by environment variables
// ie:
// ROCKY_USER1=admin:123456
// ROCKY_USER2=bob:456789
// etc...
const users = Object.keys(process.env)
    .filter(k => k.startsWith('ROCKY_USER'))
    .reduce((acc, k) => {
      const [user, pass] = String(process.env[k]).split(':');
      acc[user] = pass;
      return acc;
    }, {});

export default class User {
  static me(req) {
    console.log('User.me(%s)', req.headers.authorization);
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
    return (users.hasOwnProperty(username) && users[username] === String(password));
  }
}
