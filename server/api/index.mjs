import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import './lib/error.mjs';
import {healthcheck} from './routes/index.mjs';
import {create, list, clear} from './routes/world/index.mjs';
import {up, info, version, containers} from './routes/server/index.mjs';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 9999;

app.get('/api/healthcheck', healthcheck);

app.get('/api/server/up', up);
app.get('/api/server/info', info);
app.get('/api/server/version', version);
app.get('/api/server/containers', containers);

app.get('/api/world/list', list);
app.post('/api/world/create', create);
app.delete('/api/world', clear);


app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log('Server listening on PORT', PORT);
});
