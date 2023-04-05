import World from '../../lib/world.mjs';

export const create = async (req, res) => {
  const settings = req.body;
  try {
    res.status(200).json(await World.create(settings));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const list = async (req, res) => {
  try {
    res.status(200).json(await World.list());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const show = async (req, res) => {
  try {
    res.status(200).json(await World.show());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const start = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await World.start(id));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const stop = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await World.stop(id));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const stopAll = async (req, res) => {
  try {
    res.status(200).json(await World.stopAll());
  } catch (err) {
    res.status(500).send(err);
  }
};

export const remove = async (req, res) => {
  const {id} = req.params;
  if (!id) return res.status(400).send('No id');
  try {
    res.status(200).json(await World.remove(id));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const removeAll = async (req, res) => {
  try {
    res.status(200).json(await World.removeAll());
  } catch (err) {
    res.status(500).send(err);
  }
};
