/* eslint-disable require-jsdoc */
import randomQuotes from 'random-quotes';
import {statusBedrock} from 'minecraft-server-util';
import server from './server.js';
import utils from '../../utils/index.js';

const docker = server.docker;

const {DOCKER_HOST} = process.env;

export default class World {
  /**
   * Creates a world
   * @param {Object} settings settings
   * @return {Object} World details
   */
  static async create(settings) {
    console.log('Creating world with settings', settings);
    const name = 'rocky_world__' + settings.servername;
    const description = randomQuotes.default().body;
    const port = 48001 + Math.floor(Math.random() * 1000);
    settings.by = settings.by || 'bob';
    console.log('Creating container...', name, port);
    const container = await docker.createContainer({
      name,
      // Image: 'ubuntu:latest',
      // Cmd: ['date'],
      Image: 'itzg/minecraft-bedrock-server',
      Env: [
        'EULA=true',
        `SERVER_NAME=${settings.servername}`,
        `GAMEMODE=${settings.gamemode ?? 'survival'}`,
        `DIFFICULTY=${settings.difficulty ?? 'easy'}`,
        `ALLOW_CHEATS=${settings.allowCheats ?? 'true'}`,
        `LEVEL_NAME=${settings.servername}`,
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
   * Maps a container to a world object
   * @param {Object} c the container
   * @return {Object} world
   */
  static map(c) {
    if (!c || !c.Id) return null;
    const id = c.Id;
    const name = String(c.Names?.[0]).replace('/rocky_world__', '');
    const description = c.Labels['monster.crafty.rocky.description'];
    const port = c.Ports?.[0]?.PublicPort;
    const state = c.State;
    const folder = c.Mounts?.find(m => m.Type === 'bind')?.Source;
    const created = new Date(c.Created * 1000).getTime();
    const by = c.Labels['monster.crafty.rocky.by'];
    const meta = c;
    return {id, name, description, port, state, folder, created, by, meta};
  }

  /**
   * Maps a container to a simplified world object
   * @param {Object} c the container
   * @return {Object} simplified world
   */
  static simpleMap(c) {
    if (!c || !c.Id) return null;
    const id = String(c.Id).substring(0, 12);
    const name = String(c.Names?.[0]).replace('/rocky_world__', '');
    const description = c.Labels['monster.crafty.rocky.description'];
    const port = c.Ports?.[0]?.PublicPort;
    const created = new Date(c.Created * 1000).toISOString();
    const by = c.Labels['monster.crafty.rocky.by'];
    return {id, name, description, created, port, by};
  }

  /**
   * Lists existing worlds
   * @return {Array} List of worlds
   */
  static async list() {
    console.log('World.list()');
    const containers = await docker.listContainers({all: true, filters: {name: ['/rocky_world__']}});
    return containers
        .sort((c1, c2) => c1.Created - c2.Created)
        .map(World.map);
  }

  /**
   * Simplified listing of running worlds for public access
   * @return {Array} List of worlds
   */
  static async show() {
    console.log('World.show()');
    docker.modem.timeout = 500;
    let containers = [];
    try {
      containers = await docker.listContainers({filters: {name: ['/rocky_world__']}});
    } catch (err) {/* do nothing */}
    docker.modem.timeout = null;
    return containers
        .sort((c1, c2) => c1.Created - c2.Created)
        .map(World.simpleMap);
  }

  /**
   * Gets a single world
   * @param {String} id the world/container id
   * @return {Object} a single world
   */
  static async get(id) {
    console.log('World.get(%s)', id);
    const container = await docker.listContainers({all: true, filters: {id: [id]}});
    return container.map(World.map).pop();
  }

  /**
   * Starts a world
   * @param {String} id The id of the world
   * @return {Object} Details of the world
   */
  static async start(id) {
    console.log('World.start(%s)', id);
    const c = await World.get(id);
    if (!c) {
      throw new Error('Cannot find container to start:' + id);
    }
    console.log('Starting container...', c.name, c.id);
    await docker.getContainer(c.id).start();
    console.log('Container started', c.name, c.id);
    return c;
  }

  /**
   * Gets extra status informtaion
   * @param {String} id The id of the world
   * @return {Object} response
   */
  static async status(id) {
    console.log('World.status(%s)', id);
    const c = await World.get(id);
    if (!c) {
      throw new Error('Cannot find container for status:' + id);
    }
    // Point to the gateway (as the ports are mapped in there)
    const host = DOCKER_HOST || c.meta?.NetworkSettings?.Networks?.bridge?.Gateway;
    console.log('Connecting to bedrock host ...', host, c.port);
    const status = await statusBedrock(host, c.port);
    console.log('Got some status info', status?.version, status?.players);
    return {
      version: status?.version?.name,
      protocol: status?.version?.protocol,
      onlinePlayers: status?.players?.online,
      maxPlayers: status?.players?.max,
      gameMode: status?.gameMode,
    };
  }

  /**
   * Shows the logs for a container
   * @param {String} id The id of the world
   * @param {Integer} tail The last n of logs to return.
   * @return {Array} An array of logs
   */
  static async logs(id, tail = 100) {
    console.log('World.logs(%s)', id);
    const c = await World.get(id);
    if (!c) {
      throw new Error('Cannot find container to show logs:' + id);
    }
    const logs = await docker
        .getContainer(c.id)
        .logs({stdout: true, stderr: true, tail});
    return logs.toString().split('\n').map(s => Buffer.from(s).slice(8).toString());
  }

  /**
   * Executes console commands
   * @param {String} id the container id
   * @param {String} command the console command
   * @return {Object} response
   */
  static async execute(id, command) {
    console.log('World.execute(%s, command)', id, command);
    if (!command) {
      throw new Error('No command to execute');
    }
    const c = await World.get(id);
    if (c.state === 'running') {
      console.log('Running command on "%s" ...', c.name, command);
      const exec = await docker.getContainer(c.id).exec({
        Cmd: ['send-command'].concat(command.split(' ')),
      });
      const stream = await exec.start();
      const response = await utils.streamToString(stream);
      console.log('Command sent to "%s", response: ', c.name, response);
      return {command, on: c.name, response};
    } else {
      throw new Error('Container down. Skipping command..');
    }
  }

  /**
   * Stops a running word
   * @param {String} id the id of the world to stop
   */
  static async stop(id) {
    console.log('World.stop(%s)', id);
    const c = await World.get(id);
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
        // Step 2) Remove volumes
        if (c.meta?.Mounts) {
          for (const m of c.meta.Mounts) {
            if (m?.Type === 'volume') {
              console.log('Removing volume', m.Name);
              await docker.getVolume(m.Name).remove();
            }
          }
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
    const c = await World.get(id);
    if (!c) {
      throw new Error('Cannot find container to remove:' + id);
    }
    // Step 1) Remove container (use force)
    console.log('Removing container...', c.name, c.id);
    await docker.getContainer(c.id).remove({force: true});
    console.log('Container removed', c.name, c.id);
    // Step 2) Remove volumes
    if (c.meta?.Mounts) {
      for (const m of c.meta.Mounts) {
        if (m?.Type === 'volume') {
          console.log('Removing volume', m.Name);
          await docker.getVolume(m.Name).remove();
        }
      }
    }
    return {state: undefined, ...c};
  }
}
