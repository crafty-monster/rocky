import World from '../../lib/world.mjs';

export const create = async (req, res) => {
  const settings = req.body;
  try {
    const world = await World.create(settings);
    res.status(200).json(world);
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

export const clear = async (req, res) => {
  try {
    res.status(200).json(await World.clear());
  } catch (err) {
    res.status(500).send(err);
  }
};
