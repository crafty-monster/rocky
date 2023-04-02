/* eslint-disable require-jsdoc */
import path from 'path';
import server from './server.mjs';
import * as url from 'url';

const docker = server.docker;
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const toPosix = (path) => {
  return String('/' + path).replace(/\\/gi, '/').replace(/(\w):/g, (s) => s.toLowerCase().replace(':', ''));
};

export default class World {
  /**
   * Creates a world
   * @param {Object} settings settings
   * @return {Object} World details
   */
  static async create(settings) {
    console.log('Creating world with settings', settings);
    const name = 'rocky_' + settings['server-name'];
    const port = 29133 + Math.floor(Math.random() * 800);
    let datafolder = path.join(__dirname + '/../data/' + name);
    if (process.platform === 'win32') datafolder = toPosix(datafolder);
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
      HostConfig: {
        PortBindings: {
          '19132/udp': [{
            HostPort: String(port),
          }],
        },
        Binds: [
          `${datafolder}:/data`,
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
    const containers = await docker.listContainers();
    return containers
        .map(c => {
          const id = c.Id;
          const name = c?.Names?.[0];
          const created = new Date(c.Created * 1000).toISOString();
          const port = c.Ports?.[0]?.PublicPort;
          const state = c.State;
          const meta = c;
          return {id, name, created, port, state, meta};
        })
        .filter(w => w.name.startsWith('/rocky'));
  }

  /**
   * Stops all running worlds
   * @return {Array} List of worlds
   */
  static async clear() {
    console.log('World.clear()');
    const containers = await docker.listContainers();
    const output = [];
    for (const c of containers) {
      const name = c?.Names?.[0];
      const id = c.Id;
      if (name?.startsWith('/rocky_')) {
        console.log('Stopping container...', name, id);
        await docker.getContainer(id).stop();
        console.log('Container stopped', name, id);
        output.push({name, id});
      } else {
        console.log('Skipping container..', name);
      }
    }
    return output;
  }
}
