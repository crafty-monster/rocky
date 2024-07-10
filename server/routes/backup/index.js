import * as zlib from 'node:zlib';
import * as streams from 'node:stream/promises';
import Backup from '../../lib/backup.js';
import Server from '../../lib/server.js';

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

export const download = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    // Docker images are stored in TAR format
    // here we download them using on-the-fly compression
    // (if supported by the browser)
    // @see https://nodejs.org/api/zlib.html#compressing-http-requests-and-responses
    const image = await Server.image(id);
    if (!image) throw new Error('Image not found');
    console.log('Downloading image', JSON.stringify(image, null, 4));
    const stream = await Backup.download(id);
    const name = image.Config?.Labels?.['monster.crafty.rocky.name'] || 'backup';
    const timestamp = new Date(image.Created).getTime();
    const filename = `${name}@${timestamp}.tar`;
    const encodings = req.headers['accept-encoding'] || '';
    res.status(200);
    res.type('tar');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Content-Disposition', `attachment ; filename = "${filename}"`);
    if (encodings.match(/\bgzip\b/)) {
      res.setHeader('Content-Encoding', 'gzip');
      await streams.pipeline(stream, zlib.createGzip(), res);
    } else if (encodings.match(/\bdeflate\b/)) {
      res.setHeader('Content-Encoding', 'deflate');
      await streams.pipeline(stream, zlib.createDeflate(), res);
    } else {
      console.log('Sending plain stream..');
      await streams.pipeline(stream, res);
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).send(err);
    }
  }
};
