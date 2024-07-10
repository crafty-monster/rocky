import server from './server.js';
import config from './config.js';
import utils from '../../utils/index.js';

const {ROCKY_BACKUP_REPO} = config;
const docker = server.docker;

/**
 * Backup abstraction.
 *
 * Every backup is a docker image but not every docker image is a backup.
 */
export default class Backup {
  /**
   * List all world backups
   * @return {Array} List of worlds backed up
   */
  static async list() {
    console.log('Backup.list()');
    const images = await docker.listImages({filters: {reference: [ROCKY_BACKUP_REPO]}});
    return images.map(this.map);
  }

  /**
   * Maps a docker image to a backup object
   * @param {Object} i the docker image
   * @return {Object} backup object
   */
  static map(i) {
    if (!i || !i.Id) return null;
    const id = i.Id;
    const name = i.Labels?.['monster.crafty.rocky.name'];
    const image = i.Labels?.['monster.crafty.rocky.image'] ?? `map.${utils.md5(name).substr(0, 2)}.jpg`;
    const description = i.Labels?.['monster.crafty.rocky.description'];
    const port = Number(i.Labels?.['monster.crafty.rocky.port']);
    const created = new Date(i.Created * 1000).toISOString();
    const by = i.Labels?.['monster.crafty.rocky.by'];
    return {id, name, image, description, created, port, by};
  }

  /**
   * Downloads a backup
   * @param {String} id the docker image id for the backup
   * @return {ReadableStream} The backup stream
   */
  static async download(id) {
    console.log('Backup.download(%s)', id);
    try {
      const image = await docker.getImage(id);
      return image.get();
    } catch (e) {
      throw new Error('Cannot download image ' + id + ': ' + String(e));
    }
  }

  /**
   * Deletes a backup
   * @param {String} id the docker image id for the backup
   * @return {Object} The backup
   */
  static async remove(id) {
    console.log('Backup.remove(%s)', id);
    try {
      const image = docker.getImage(id);
      await image.remove();
      return image;
    } catch (e) {
      throw new Error('Cannot remove image ' + id + ': ' + String(e));
    }
  }

  /**
   * Restores a backup
   * @param {String} id the docker image id for the backup
   * @return {Object} The backup
   */
  static async restore(id) {
    console.log('Backup.restore(%s)', id);
  }
}
