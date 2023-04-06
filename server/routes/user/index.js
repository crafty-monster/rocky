import User from '../../lib/user.js';

export const me = async (req, res) => {
  try {
    const me = await User.me(req);
    if (me) return res.status(200).json(me);
    else return res.status(404).send();
  } catch (err) {
    res.status(500).send(err);
  }
};
