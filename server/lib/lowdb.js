/* eslint-disable new-cap */
/* eslint-disable require-jsdoc */
import {JSONFilePreset} from 'lowdb/node';

// Read or create db.json
const defaultData = {ui: {}};
const low = {};

(async () => {
  low.db = await JSONFilePreset('data/db.json', defaultData);
  UI.data = low.db.data.ui;
})();

export class UI {
  static async get(req, res) {
    console.log('UI.get(req, res, next)', req.path);
    return res.send(low.db.data.ui);
  }
  static async put(req, res) {
    console.log('UI.put(req, res, next)', req.body);
    if (req.body) {
      UI.data = low.db.data.ui = req.body;
      await low.db.write();
      return res.send(low.db.data.ui);
    }
    res.status(400).send();
  }
}

