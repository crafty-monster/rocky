import {Server as IO} from 'socket.io';

const MAX_CHAT_USERS = 5;

/**
 * A WebRTC chat socket server abstraction, uses socket.io internally for coordination.
 */
export default class Chat {
  /**
   * Creates a new chat session
   * @param {HttpServer} httpServer a server instance created with http.createServer();
   */
  constructor(httpServer) {
    if (!httpServer) throw new Error('Please instantiate Chat with a HttpServer');
    this.sockets = [];
    this.io = new IO(httpServer, {allowEIO3: true, path: '/chat'});
    this.io.on('connect', socket => this.start(socket));
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
      socket.emit('update-user-list', {users: this.sockets.filter(id => id !== socket.id)});
      console.log('New connection, sending list', this.sockets);
      socket.broadcast.emit('update-user-list', {
        users: [socket.id],
      });
    }

    socket.on('call-user', data => {
      socket.to(data.to).emit('call-made', {
        offer: data.offer,
        socket: socket.id,
      });
    });

    socket.on('make-answer', data => {
      socket.to(data.to).emit('answer-made', {
        socket: socket.id,
        answer: data.answer,
      });
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
    this.io?.emit('remove-user', {socketId: socket.id});
  }
}
