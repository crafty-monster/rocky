import User from '../../lib/user.js';

export const register = async (req, res) => {
  try {
    res.status(201).send(await User.register(req.body));
  } catch (err) {
    res.status(500).send(err);
  }
};

export const login = async (req, res) => {
  try {
    if (await User.login()) return res.status(200).send();
    else return res.status(401).send();
  } catch (err) {
    res.status(500).send(err);
  }
};

export const exists = async (req, res) => {
  try {
    res.status(200).send({exists: await User.exists()});
  } catch (err) {
    res.status(500).send(err);
  }
};
