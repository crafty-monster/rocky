/* eslint-disable require-jsdoc */
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import randomQuotes from 'random-quotes';
import server from './server.js';
import utils from '../../utils/index.js';

const docker = server.docker;
const __dirname = utils.__dirname(import.meta);

export default class World {
  /**
   * Creates a world
   * @param {Object} settings settings
   * @return {Object} World details
   */
  static async create(settings) {
    console.log('Creating world with settings', settings);
    const name = 'rocky_world__' + settings['server-name'];
    const description = randomQuotes.default().body;
    const port = 49001 + Math.floor(Math.random() * 800);
    let datafolder = path.join(__dirname + '/../data/' + name);
    if (process.platform === 'win32') datafolder = utils.toPosixPath(datafolder);
    // console.log('datapath', datapath);
    // console.log('toPosix', toPosix(datapath));
    // console.log('import.meta.url', import.meta.url);
    // console.log('new URL(\'.\', import.meta.url)', new URL('.', import.meta.url));
    console.log('Creating container...', name, port, datafolder);
    const container = await docker.createContainer({
      name,
      // Image: 'ubuntu:latest',
      // Cmd: ['date'],
      Image: 'itzg/minecraft-bedrock-server',
      Env: [
        'EULA=true',
        'GAMEMODE=survival',
        'DIFFICULTY=easy',
      ],
      Volumes: {
        '/data': {},
      },
      Labels: {
        'monster.crafty.rocky': 'true',
        'monster.crafty.rocky.description': description,
        'monster.crafty.rocky.settings.gamemode': 'survival',
        'monster.crafty.rocky.settings.difficulty': 'easy',
        'monster.crafty.rocky.by': settings.by || 'bob',
      },
      HostConfig: {
        PortBindings: {
          '19132/udp': [{
            HostPort: String(port),
          }],
        },
        Binds: [
          // `${datafolder}:/data`,
        ],
      },
    });
    console.log(`Container ${name} created. Starting...`);
    const info = await container.start();
    console.log(`Container ${name} started.`, info);
    return {name, port};
  }

  /**
   * Lists existing worlds
   * @return {Array} List of worlds
   */
  static async list() {
    console.log('World.list()');
    const containers = await docker.listContainers({all: true, filters: {name: ['/rocky_world__']}});
    return containers
        .map(c => {
          const id = c.Id;
          const name = String(c.Names?.[0]).replace('/rocky_world__', '');
          const description = c.Labels['monster.crafty.rocky.description'];
          const port = c.Ports?.[0]?.PublicPort;
          const state = c.State;
          const folder = c.Mounts?.find(m => m.Type === 'bind')?.Source;
          const created = new Date(c.Created * 1000).toISOString();
          const by = c.Labels['monster.crafty.rocky.by'];
          const meta = c;
          return {id, name, description, port, state, folder, created, by, meta};
        });
  }

  /**
   * Minimal listing of running worlds for public access
   * @return {Array} List of worlds
   */
  static async show() {
    console.log('World.show()');
    const containers = await docker.listContainers({filters: {name: ['/rocky_world__']}});
    return containers
        .map(c => {
          const id = String(c.Id).substring(0, 12);
          const name = String(c.Names?.[0]).replace('/rocky_world__', '');
          const description = c.Labels['monster.crafty.rocky.description'];
          const port = c.Ports?.[0]?.PublicPort;
          const created = new Date(c.Created * 1000).toISOString();
          const by = c.Labels['monster.crafty.rocky.by'];
          return {id, name, description, created, port, by};
        });
  }

  /**
   * Starts a world
   * @param {String} id The id of the world to start
   * @return {Array} Details of the world start
   */
  static async start(id) {
    console.log('World.start(%s)', id);
    const containers = await World.list();
    const c = containers.find(c => c.id === id);
    if (!c) {
      throw new Error('Cannot find container to start:' + id);
    }
    console.log('Starting container...', c.name, c.id);
    await docker.getContainer(c.id).start();
    console.log('Container started', c.name, c.id);
    return c;
  }

  /**
   * Shows the logs for a container
   * @param {String} id The id of the world to show logs for
   * @return {Array} Details of the world to show logs for
   */
  static async logs(id) {
    console.log('World.logs(%s)', id);
    const containers = await World.list();
    const c = containers.find(c => c.id === id);
    if (!c) {
      throw new Error('Cannot find container to show logs:' + id);
    }
    const logs = await docker
        .getContainer(c.id)
        .logs({stdout: true, stderr: true, tail: 200});
    return logs.toString().split('\n').map(s => Buffer.from(s).slice(8).toString());
  }

  /**
   * Stops a running word
   * @param {String} id the id of the world to stop
   */
  static async stop(id) {
    console.log('World.stop(%s)', id);
    const containers = await World.list();
    const c = containers.find(c => c.id === id);
    if (c.state === 'running') {
      console.log('Stopping container...', c.name, c.id);
      await docker.getContainer(c.id).stop();
      console.log('Container stopped', c.name, c.id);
      return c;
    } else {
      console.log('Skipping container..', c.name);
    }
    return null;
  }

  /**
   * Stops all running worlds
   * @return {Array} List of worlds
   */
  static async stopAll() {
    console.log('World.stopAll()');
    const containers = await World.list();
    const output = [];
    for (const c of containers) {
      if (c.state === 'running') {
        console.log('Stopping container...', c.name, c.id);
        await docker.getContainer(c.id).stop();
        console.log('Container stopped', c.name, c.id);
        output.push(c);
      } else {
        console.log('Skipping container..', c.name);
      }
    }
    return output;
  }

  /**
   * Removes all stopped worlds
   * @return {Array} List of worlds
   */
  static async removeAll() {
    console.log('World.removeAll()');
    const containers = await World.list();
    const output = [];
    for (const c of containers) {
      if (c.state === 'exited') {
        // Step 1) Remove container (use force)
        console.log('Removing container...', c.name, c.id);
        await docker.getContainer(c.id).remove({force: true});
        console.log('Container removed', c.name, c.id);
        // Step 2) Remove files
        if (process.platform === 'win32') c.folder = utils.toWindowsPath(c.folder);
        console.log('Checking data folder..', c.folder);
        if (fs.existsSync(c.folder)) {
          setTimeout(async () => {
            console.log('Removing files from', c.folder);
            await fsPromises.rm(c.folder, {recursive: true, force: true});
          }, 3000);
        }
        output.push({state: undefined, ...c});
      } else {
        console.log('Skipping container..', c.name);
      }
    }
    return output;
  }

  /**
   * Remove a world
   * @param {String} id The id of the world to remove
   * @return {Array} Details of the world removed
   */
  static async remove(id) {
    console.log('World.remove(%s)', id);
    const containers = await World.list();
    const c = containers.find(c => c.id === id);
    if (!c) {
      throw new Error('Cannot find container to remove:' + id);
    }
    // Step 1) Remove container (use force)
    console.log('Removing container...', c.name, c.id);
    await docker.getContainer(c.id).remove({force: true});
    console.log('Container removed', c.name, c.id);
    // Step 2) Remove files
    if (process.platform === 'win32') c.folder = utils.toWindowsPath(c.folder);
    console.log('Checking data folder..', c.folder);
    if (fs.existsSync(c.folder)) {
      setTimeout(async () => {
        console.log('Removing files from', c.folder);
        await fsPromises.rm(c.folder, {recursive: true, force: true});
      }, 3000);
    }
    return {state: undefined, ...c};
  }
}
