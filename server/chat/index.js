import {Server as IO} from 'socket.io';
import Turn from 'node-turn';
import config from '../lib/config.js';

const MAX_CHAT_USERS = 5;
const CHAT_TURN_CREDS = config.CHAT_TURN_CREDS || 'webrtc:rocky';

/**
 * A WebRTC chat socket server abstraction, uses socket.io internally for coordination.
 */
export default class Chat {
  /**
   * Creates a new chat session
   * Need to open ports 3478, 5349, and UDP 49150-49250
   * for TURN (ie WebRTC UDP forwarding)
   * @param {HttpServer} httpServer a server instance created with http.createServer();
   */
  constructor(httpServer) {
    if (!httpServer) throw new Error('Please instantiate Chat with a HttpServer');
    this.sockets = [];
    this.io = new IO(httpServer, {allowEIO3: true, path: '/chat'});
    this.io.on('connect', socket => this.start(socket));
    // Add TURN server in case RTC peer cannot traverse UDP
    const opts = {
      maxPort: 49250,
      debugLevel: 'INFO',
    };
    // if (CHAT_TURN_CREDS) {
    //   opts.authMech: 'long-term';
    //   const [user, pass] = String(CHAT_TURN_CREDS).split(':');
    //   opts.credentials = {[user]: pass};
    // }
    new Turn().start(opts);
  }
  /**
   * Creates a new chat session
   * @param {Socket} socket the io socket
   */
  start(socket) {
    console.log('Chat.start()', socket.id);

    const existing = this.sockets.find(id => id === socket.id);

    if (!existing) {
      if (this.sockets.length > MAX_CHAT_USERS) {
        socket.emit('too-many-users', MAX_CHAT_USERS);
        return;
      }
      this.sockets.push(socket.id);
      const users = this.sockets;
      const rtcCredentials = CHAT_TURN_CREDS;
      console.log('init-user', users);
      socket.emit('init-user', {users, rtcCredentials});
      socket.broadcast.emit('update-users', {users});
    }

    socket.on('call-user', data => {
      console.log('call-made', data.to);
      socket.to(data.to).emit('call-made', {
        offer: data.offer,
        socket: socket.id,
      });
    });

    socket.on('make-answer', data => {
      console.log('answer-made', data.to);
      socket.to(data.to).emit('answer-made', {
        socket: socket.id,
        answer: data.answer,
      });
    });

    socket.on('reject-call', data => {
      console.log('call-rejected', data.from);
      socket.to(data.from).emit('call-rejected', {socket: socket.id});
    });

    socket.on('disconnect', () => this.finish(socket));
  }

  /**
   * Finishes a chat session
   * @param {Socket} socket the io socket
   */
  finish(socket) {
    console.log('Chat.finish()', socket.id);
    this.sockets.splice(this.sockets.indexOf(socket.id), 1);
    this.io?.emit('update-users', {users: this.sockets});
  }
}
