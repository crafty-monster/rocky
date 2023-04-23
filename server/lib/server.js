import Docker from 'dockerode';

import config from './config.js';

const {DOCKER_HOST, DOCKER_PORT} = config;

/**
 * Server abstraction
 */
class Server {
  /**
   * @see https://docs.docker.com/engine/reference/commandline/dockerd/#bind-docker-to-another-host-port-or-a-unix-socket
   */
  constructor() {
    console.log('new Server()');
    if (DOCKER_HOST) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
      console.log('Connecting to remote docker...', DOCKER_HOST, DOCKER_PORT);
      this.docker = new Docker({host: DOCKER_HOST, port: DOCKER_PORT});
    } else {
      this.docker = new Docker(); // connect to pipe /var/run/docker.sock
    }
  }
  /**
   * Server information
   * @see https://docs.docker.com/engine/api/v1.37/#tag/System/operation/SystemInfo
   * @return {Object}
   */
  async info() {
    console.log('Server.info()');
    let up = false;
    let path = 'unix:///var/run/docker.sock';
    let info = {};
    if (DOCKER_HOST) {
      path = `tcp://${DOCKER_HOST}${DOCKER_PORT && (':' + DOCKER_PORT)}`;
    }
    try {
      this.docker.modem.timeout = 500;
      info = await this.docker.info();
      up = true;
    } catch (e) {/* Do nothing */}
    this.docker.modem.timeout = null;
    return {path, up, info, config};
  }
  /**
   * Version information
   * @see https://docs.docker.com/engine/api/v1.37/#tag/System/operation/SystemVersion
   * @return {Object}
   */
  async version() {
    console.log('Server.version()');
    return await this.docker.version();
  }
  /**
   * Runs a ping if server is connected
   * @see https://docs.docker.com/engine/api/v1.37/#tag/System/operation/SystemPing
   * @return {Boolean}
   */
  async connected() {
    console.log('Server.connected()');
    let ping = false;
    try {
      this.docker.modem.timeout = 500;
      await this.docker.ping();
      ping = true;
    } catch (e) {/* Do nothing */}
    this.docker.modem.timeout = null;
    return ping;
  }
  /**
   * List Containers
   * @see https://docs.docker.com/engine/api/v1.37/#tag/Container/operation/ContainerList
   * @return {Array}
   */
  async containers() {
    console.log('Server.containers()');
    return await this.docker.listContainers({all: true});
  }
  /**
   * System prune (containers, images and volumes)
   * @see https://docs.docker.com/engine/api/v1.37/#operation/ContainerPrune
   * @see https://docs.docker.com/engine/api/v1.37/#operation/ImagePrune
   * @see https://docs.docker.com/engine/api/v1.37/#operation/VolumePrune
   * @return {Array}
   */
  async prune() {
    console.log('Server.prune()');
    const images = await this.docker.pruneImages();
    const volumes = await this.docker.pruneVolumes();
    const totalMb = Math.round((images?.SpaceReclaimed || 0) + (volumes.SpaceReclaimed || 0) / 1024 / 1024);
    console.log(`Deleted ${images?.ImagesDeleted?.length} images and ${volumes?.VolumesDeleted?.length} volumes. Saving ${totalMb}MB space.`);
    return {images, volumes, totalMb};
  }
}

export default new Server();
