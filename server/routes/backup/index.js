import * as streams from 'node:stream/promises';
import Backup from '../../lib/backup.js';

export const list = async (req, res) => {
  try {
    res.status(200).json(await Backup.list());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const remove = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await Backup.remove(id));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const restore = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await Backup.restore(id));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const upload = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await Backup.upload(id, req));
  } catch (err) {
    const status = /already exists/.test(err.message) ? 409 : 500;
    res.status(status).send(err.message || String(err));
  }
};

export const download = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    const stream = await Backup.download(id);
    res.status(200);
    res.type('gz');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.tar.gz"`);
    await streams.pipeline(stream, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).send(err);
    }
  }
};
