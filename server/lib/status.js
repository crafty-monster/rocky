import udp from 'dgram';
import Cache from 'ttl';

const MAX_WAIT_MS = 1 * 1000;
const OFFLINE_MESSAGE_DATA_ID = '00ffff00fefefefefdfdfdfd12345678';
const UNCONNECTED_PING = // see https://wiki.vg/Raknet_Protocol#Unconnected_Ping
    '01' + '0000000000000000' + OFFLINE_MESSAGE_DATA_ID + '0000000000000000'; // fmt: skip;

const cache = new Cache({ttl: 2 * 60 * 1000}); // 2 minute cache

/**
 * Minecraft Server status abstraction
 */
export default class Status {
  /**
   * Checks minecraft status from remote UDP host
   * @param {string} host the minecraft server address
   * @param {string|Number} port the minecraft server port
   */
  static async check(host = 'localhost', port) {
    console.log('Status.check(%s, %s)', host, port);
    const key = `${host}:${port}`;
    const cached = cache.get(key);
    if (cached) return cached;
    try {
      // Not in cache?
      // Go check instead
      const buffer = await UDP.send(host, port, Buffer.from(UNCONNECTED_PING, 'hex'));
      // console.log('---------------------------');
      // console.log('Parsing...');
      // https://wiki.vg/Raknet_Protocol#Unconnected_Pong
      const packet = {
        type: buffer.slice(0, 1), //    byte   (1)
        time: buffer.slice(1, 9), //    long   (8)
        guid: buffer.slice(9, 17), //   long   (8)
        magic: buffer.slice(17, 33), // magic  (16)
        data: buffer.slice(35), //      string (*)
      };
      // console.log({packet});
      // console.log(packet.data.toString('utf8'));
      if (!Buffer.from(OFFLINE_MESSAGE_DATA_ID, 'hex').equals(packet.magic)) {
        throw new Error('Invalid server reponse');
      }
      const data = packet.data?.toString('utf8')?.split(';') || '';
      const [edition, motd1, protocol, version, count, max, uid, motd2, mode, no, portipv4, portipv6] = data;
      const status = {edition, motd1, protocol, version, count, max, uid, motd2, mode, no, portipv4, portipv6};
      // console.log({status});
      cache.put(key, status);
      return status;
    } catch (err) {
      console.error(err);
    }
    return undefined;
  }
}

/**
 * UDP abstraction
 */
class UDP {
  /**
   * Send a datagram packet and wait for respose.
   * @param {string} host The remote host address
   * @param {string|Number} port The port to connect to
   * @param {string|Buffer} message The message to send
   * @return {Buffer} The returned udp message
   */
  static async send(host, port, message) {
    console.log('UDP.send(%s, %s, message)', host, port);
    const buffer = Buffer.from(message);
    // console.log(`Sending '${buffer.toString('hex')}' to ${host}:${port}`);
    return new Promise((resolve, reject) => {
      const client = udp.createSocket('udp4');
      const timeout = setTimeout(() => onError(new Error('UDP: Timeout. No response.')), MAX_WAIT_MS);
      client.on('error', onError);
      client.send(buffer, port, host, onError);
      client.on('message', (msg, info) => {
        // console.log('---------------------------');
        // console.log('Received %d bytes from %s:%d', msg.length, info.address, info.port);
        // console.log(`-->${msg.toString('hex')}`);
        // console.log(`-->${msg.toString('utf8')}`);
        client.close();
        clearTimeout(timeout);
        resolve(msg);
      });
      // eslint-disable-next-line require-jsdoc
      function onError(e) {
        if (e) {
          console.error('UPD Error: ' + e);
          client.close();
          clearTimeout(timeout);
          reject(e);
        }
      }
    });
  }
}

