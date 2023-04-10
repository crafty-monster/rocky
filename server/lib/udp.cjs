/**
 * UDP Server for testing minecraft Server List Ping
 * @see https://wiki.vg/Server_List_Ping
 *
 * @example
 * $ echo -n -e \\x48\\x65\\x6C\\x6C\\x6F > /dev/udp/127.0.0.1/19132
 */

const udp = require('dgram');

// creating a udp server
const server = udp.createSocket('udp4');
const PORT = 19132;

// emits when any error occurs
server.on('error', function(error) {
  console.log('Error: ' + error);
  server.close();
});

// emits on new datagram msg
server.on('message', function(msg, info) {
  console.log('---------------------------');
  console.log('Received %d bytes from %s:%d', msg.length, info.address, info.port);
  console.log(msg.toString());

  // sending msg
  server.send(msg, info.port, 'localhost', function(error) {
    if (error) {
      console.error('Error sending response');
    }
    console.log('---------------------------');
  });
});

// emits when socket is ready and listening for datagram msgs
server.on('listening', function() {
  const address = server.address();
  const port = address.port;
  const family = address.family;
  const ipaddr = address.address;
  console.log(`UDP Server ${ipaddr}:${port} (${family}) is running...`);
});

// emits after the socket is closed using socket.close();
server.on('close', function() {
  console.log('UDP Socket is closed !');
});

server.bind(PORT);

setTimeout(function() {
  server.close();
}, 60000);
