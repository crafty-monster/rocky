import crypto from 'crypto';

import lowdb from './lowdb.js';

/**
 * Returns a HMACSHA256 of a string salted with a key
 * @param {string} str The string to hash
 * @param {string} key The key used in the HMAC component of the algo
 * @return {string} The HMACSHA256 string
 */
function hmacsha256(str, key) {
  return crypto
      .createHmac('sha256', key)
      .update(str)
      .digest('hex');
}

/**
 * A user
 */
export default class User {
  /**
   * Creates a user
   * @param {Object} user settings, usually username and password.
   * @return {Object} user details
   */
  static async register(user) {
    lowdb.data.user = lowdb.data.user || [];
    const record = {
      username: user.username,
      passwordhash: hmacsha256(user.password, user.username),
    };
    const existing = lowdb.data.user.find(u => u.username === user.username);
    if (existing) {
      Object.assign(existing, record);
    } else {
      lowdb.data.user.push(record);
    }
    await lowdb.write();
    return record;
  }
  /**
   * Checks if the database has been initialized
   * @return {Boolean} if there are any users
   */
  static async exists() {
    return lowdb.data?.user?.length > 0;
  }
  /**
   * Authenticates a user
   * @param {String} username
   * @param {String} password
   * @return {Boolean} if the user/password combination works
   */
  static async login(username, password) {
    if (!User.exists()) return false;
    const user = lowdb.data.user.find(u => u.username = username);
    if (!user) return false;
    return user.passwordhash === hmacsha256(password, username);
  }
}
