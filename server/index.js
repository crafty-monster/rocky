import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import basicAuth from 'express-basic-auth';
import apicache from 'apicache';
import rateLimit from 'express-rate-limit';

import './lib/error.js';
import User from './lib/user.js';
import {checkAdmin as ADMIN_ACCESS} from './middleware/index.js';
import Chat from './chat/index.js';
import {healthcheck} from './routes/index.js';
import {me} from './routes/user/index.js';
import * as world from './routes/world/index.js';
import * as server from './routes/server/index.js';

const PORT = process.env.PORT || 48000;
const app = express();
const cache = apicache.middleware;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('www'));

app.get('/api/healthcheck', healthcheck);
app.get('/api/server/connected', server.connected);
app.get('/api/world/', cache('5 seconds'), world.show);

// Authentication from here onwards
app.use(basicAuth({authorizer: User.auth, challenge: true}));
app.use('/admin', express.static('www/admin'));

// Rate limiting from here onwards
// To avoid brute force attacks.
app.use(rateLimit({windowMs: 20000, max: 30}));

app.get('/api/user/me', ADMIN_ACCESS, me);

app.get('/api/server', ADMIN_ACCESS, server.info);
app.get('/api/server/version', ADMIN_ACCESS, server.version);
app.get('/api/server/containers', ADMIN_ACCESS, server.containers);
app.post('/api/server/prune', ADMIN_ACCESS, server.prune);

app.get('/api/world/list', ADMIN_ACCESS, world.list);
app.post('/api/world/create', ADMIN_ACCESS, world.create);
app.post('/api/world/stopAll', ADMIN_ACCESS, world.stopAll);
app.post('/api/world/:id/start', ADMIN_ACCESS, world.start);
app.post('/api/world/:id/stop', ADMIN_ACCESS, world.stop);
app.get('/api/world/:id', ADMIN_ACCESS, world.get);
app.get('/api/world/:id/status', ADMIN_ACCESS, world.status);
app.get('/api/world/:id/logs', ADMIN_ACCESS, world.logs);
app.get('/api/world/:id/logs/:tail', ADMIN_ACCESS, world.logs);
app.post('/api/world/:id/execute', ADMIN_ACCESS, world.execute);
app.delete('/api/world/:id', ADMIN_ACCESS, world.remove);
app.delete('/api/world', ADMIN_ACCESS, world.removeAll);

// Add WebRTC video chat functionality
const httpServer = http.createServer(app);
new Chat(httpServer);

httpServer.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log('Server listening on PORT', PORT);
});

// Handle promise rejection
process.on('unhandledRejection', (err) => console.log(err));
