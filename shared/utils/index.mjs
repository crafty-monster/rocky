
import * as url from 'url';

export default class Utils{
  static __dirname(meta) {
    url.fileURLToPath(new URL('.', meta.url));
  }
  static toPosixPath(path) {
    return String('/' + path).replace(/\\/gi, '/').replace(/(\w):/g, (s) => s.toLowerCase().replace(':', ''));
  };
  static toWindowsPath(path) {
    const drive = path.split('/')[1];
    return [drive + ':'].concat(path.split('/').slice(2)).join('\\');
  }
};