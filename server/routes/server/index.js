import Server from '../../lib/server.js';

export const info = async (req, res) => {
  try {
    res.status(200).json(await Server.info());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const version = async (req, res) => {
  try {
    res.status(200).json(await Server.version());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const connected = async (req, res) => {
  const connected = await Server.connected();
  if (connected) {
    res.status(200).send({connected});
  } else {
    res.status(500).send({connected});
  }
};

export const containers = async (req, res) => {
  try {
    res.status(200).send(await Server.containers());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const images = async (req, res) => {
  try {
    res.status(200).send(await Server.images());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const prune = async (req, res) => {
  try {
    res.status(200).send(await Server.prune());
  } catch (err) {
    res.status(500).send(err);
  }
};
