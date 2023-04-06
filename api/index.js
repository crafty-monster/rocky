import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import './lib/error.js';
import {checkAdmin as ADMIN_ACCESS} from './middleware/index.js';
import {healthcheck} from './routes/index.js';
import {register, login, exists} from './routes/user/index.js';
import {create, show, list, start, logs, stop, stopAll, remove, removeAll} from './routes/world/index.js';
import {connected, info, version, containers} from './routes/server/index.js';

const PORT = process.env.PORT || 48000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('www'));

app.get('/api/healthcheck', healthcheck);

app.post('/api/login', login);
app.post('/api/user', register);
app.get('/api/user/exists', exists);

app.get('/api/server/', ADMIN_ACCESS, info);
app.get('/api/server/version', ADMIN_ACCESS, version);
app.get('/api/server/containers', ADMIN_ACCESS, containers);
app.get('/api/server/connected', connected);

app.get('/api/world/', show);
app.get('/api/world/list', ADMIN_ACCESS, list);
app.post('/api/world/create', ADMIN_ACCESS, create);
app.post('/api/world/stopAll', ADMIN_ACCESS, stopAll);
app.post('/api/world/:id/start', ADMIN_ACCESS, start);
app.post('/api/world/:id/stop', ADMIN_ACCESS, stop);
app.get('/api/world/:id/logs', ADMIN_ACCESS, logs);
app.delete('/api/world/:id', ADMIN_ACCESS, remove);
app.delete('/api/world', ADMIN_ACCESS, removeAll);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log('Server listening on PORT', PORT);
});
