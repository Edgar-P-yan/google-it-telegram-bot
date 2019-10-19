import dotenv from 'dotenv';
const debug = require('debug')('app:config-env');
import {join} from 'path'

export function configEnv() {
  if (process.env.NODE_ENV !== 'production') {
    const result = dotenv.config({
      path: join(__dirname, '../.env'),
    });
    if (result.error) {
      debug(result.error);
    }
  }
}
