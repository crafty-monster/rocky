import fs from 'fs';
import path from 'path';
import * as streams from 'node:stream/promises';
import * as tar from 'tar';
import config from './config.js';
import utils from '../../utils/index.js';
import World from './world.js';

const {ROCKY_BACKUP_PATH} = config;

/**
 * Guards against path traversal in ids coming from the URL
 * @param {String} id the backup id
 * @return {String} the sanitized id
 */
function safeId(id) {
  const name = path.basename(String(id || ''));
  if (!name || name !== id) throw new Error('Invalid backup id: ' + id);
  return name;
}

/**
 * Backup abstraction.
 *
 * Every backup is a gzipped tar of a world's data folder, plus a JSON
 * sidecar with its metadata, both stored under ROCKY_BACKUP_PATH.
 */
export default class Backup {
  /**
   * List all world backups
   * @return {Array} List of worlds backed up
   */
  static async list() {
    console.log('Backup.list()');
    fs.mkdirSync(ROCKY_BACKUP_PATH, {recursive: true});
    return fs.readdirSync(ROCKY_BACKUP_PATH)
        .filter(f => f.endsWith('.json'))
        .map(f => Backup.map(JSON.parse(fs.readFileSync(path.join(ROCKY_BACKUP_PATH, f), 'utf8'))))
        .sort((a, b) => new Date(b.created) - new Date(a.created));
  }

  /**
   * Maps stored metadata to a backup object
   * @param {Object} meta the stored metadata
   * @return {Object} backup object
   */
  static map(meta) {
    if (!meta || !meta.id) return null;
    const {id, name, description, port, by, created} = meta;
    const image = `map.${utils.md5(name).substr(0, 2)}.jpg`;
    return {id, name, image, description, created, port, by};
  }

  /**
   * Creates a backup from a world
   * @param {Object} world the world (as returned by World.get)
   * @return {Object} backup object
   */
  static async create(world) {
    console.log('Backup.create(%s)', world.name);
    fs.mkdirSync(ROCKY_BACKUP_PATH, {recursive: true});
    const id = `${world.name}@${new Date().toISOString().split('.')[0].replace(/:/g, '-')}Z`;
    await tar.create({gzip: true, file: path.join(ROCKY_BACKUP_PATH, `${id}.tar.gz`), cwd: world.folder}, ['.']);
    const meta = {
      id,
      name: world.name,
      description: world.description,
      port: world.port,
      by: world.by,
      gamemode: world.meta?.Labels?.['monster.crafty.rocky.settings.gamemode'],
      difficulty: world.meta?.Labels?.['monster.crafty.rocky.settings.difficulty'],
      created: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(ROCKY_BACKUP_PATH, `${id}.json`), JSON.stringify(meta));
    return Backup.map(meta);
  }

  /**
   * Checks whether a backup with this id already exists
   * @param {String} id the backup id
   * @return {Boolean} true if it exists
   */
  static exists(id) {
    return fs.existsSync(path.join(ROCKY_BACKUP_PATH, `${safeId(id)}.tar.gz`));
  }

  /**
   * Uploads a backup, streaming the raw request body to disk
   * @param {String} id the backup id
   * @param {ReadableStream} stream the raw tar.gz bytes
   * @return {Object} backup object
   */
  static async upload(id, stream) {
    console.log('Backup.upload(%s)', id);
    const name = safeId(id);
    if (Backup.exists(name)) {
      throw new Error(`Backup "${name}" already exists. Delete it first.`);
    }
    fs.mkdirSync(ROCKY_BACKUP_PATH, {recursive: true});
    await streams.pipeline(stream, fs.createWriteStream(path.join(ROCKY_BACKUP_PATH, `${name}.tar.gz`)));
    const meta = {
      id: name,
      name: name.split('@')[0],
      created: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(ROCKY_BACKUP_PATH, `${name}.json`), JSON.stringify(meta));
    return Backup.map(meta);
  }

  /**
   * Downloads a backup
   * @param {String} id the backup id
   * @return {ReadableStream} The backup stream
   */
  static async download(id) {
    console.log('Backup.download(%s)', id);
    const file = path.join(ROCKY_BACKUP_PATH, `${safeId(id)}.tar.gz`);
    if (!fs.existsSync(file)) throw new Error('Backup not found: ' + id);
    return fs.createReadStream(file);
  }

  /**
   * Deletes a backup
   * @param {String} id the backup id
   * @return {Object} The backup
   */
  static async remove(id) {
    console.log('Backup.remove(%s)', id);
    const name = safeId(id);
    fs.rmSync(path.join(ROCKY_BACKUP_PATH, `${name}.tar.gz`), {force: true});
    fs.rmSync(path.join(ROCKY_BACKUP_PATH, `${name}.json`), {force: true});
    return {id};
  }

  /**
   * Restores a backup
   * @param {String} id the backup id
   * @return {Object} The world restored
   */
  static async restore(id) {
    console.log('Backup.restore(%s)', id);
    const name = safeId(id);
    const meta = JSON.parse(fs.readFileSync(path.join(ROCKY_BACKUP_PATH, `${name}.json`), 'utf8'));
    // 1. Does world exist already? If so delete it.
    const match = (await World.list()).find(w => w.name === meta.name);
    if (match) {
      console.log(`Found a container match for ${meta.name}. Deleting container id ${match.id}`);
      await World.remove(match.id);
      console.log(`Container "${match.name}" deleted due to restore.`);
    } else {
      console.log(`No match for ${meta.name}, continuing with restore..`);
    }
    // 2. Extract backup into a fresh world data folder
    const folder = World.folder(meta.name);
    fs.mkdirSync(folder, {recursive: true});
    await tar.extract({file: path.join(ROCKY_BACKUP_PATH, `${name}.tar.gz`), cwd: folder});
    // 3. Create new container, bind-mounted onto the restored folder.
    return await World.create({
      servername: meta.name,
      port: meta.port,
      description: meta.description,
      by: meta.by,
      gamemode: meta.gamemode,
      difficulty: meta.difficulty,
    });
  }
}
