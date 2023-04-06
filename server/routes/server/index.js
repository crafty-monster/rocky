import server from '../../lib/server.js';

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

export const connected = async (req, res) => {
  const connected = await server.connected();
  if (connected) {
    res.status(200).send(connected);
  } else {
    res.status(500).send(connected);
  }
};

export const containers = async (req, res) => {
  try {
    res.status(200).send(await server.containers());
  } catch (err) {
    res.status(500).send(err);
  }
};
