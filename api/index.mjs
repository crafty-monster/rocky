import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import './lib/error.mjs';
import {healthcheck} from './routes/index.mjs';
import {create, list, start, stop, stopAll, remove, removeAll} from './routes/world/index.mjs';
import {connected, info, version, containers} from './routes/server/index.mjs';

const PORT = process.env.PORT || 48000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
// app.use(express.static('public'));
app.use(express.static('../www'));

app.get('/api/healthcheck', healthcheck);

app.get('/api/server/', info);
app.get('/api/server/version', version);
app.get('/api/server/containers', containers);
app.get('/api/server/connected', connected);

app.get('/api/world/', list);
app.post('/api/world/create', create);
app.post('/api/world/stopAll', stopAll);
app.post('/api/world/:id/start', start);
app.post('/api/world/:id/stop', stop);
app.delete('/api/world/:id', remove);
app.delete('/api/world', removeAll);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log('Server listening on PORT', PORT);
});
