import server from '../../lib/server.mjs';

export const info = async (req, res) => {
  try {
    res.status(200).json(await server.info());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const version = async (req, res) => {
  try {
    res.status(200).json(await server.version());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const up = async (req, res) => {
  const up = await server.up();
  if (up) {
    res.status(200).send(up);
  } else {
    res.status(500).send(up);
  }
};

export const containers = async (req, res) => {
  try {
    res.status(200).send(await server.containers());
  } catch (err) {
    res.status(500).send(err);
  }
};
