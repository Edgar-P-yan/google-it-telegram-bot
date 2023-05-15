import dotenv from 'dotenv';

export type Key =
  | 'BOT_TOKEN'
  | 'GOOGLE_API_KEY'
  | 'GCS_ENGINE_ID'
  | 'WEB_HOOKS'
  | 'PORT'
  | 'WEB_HOOKS_SECRET_URL'
  | 'WEB_HOOKS_PATH';

export class IntegrationConfigs {
  constructor() {
    // TODO: rewrite to not pollute the native process.env
    dotenv.config({
      path: '.integration.env',
    });
  }

  /**
   * @throws {TypeError} if the environment variable is not set. Empty strings are accounted as valid values.
   */
  get(key: Key): string {
    const val = process.env[key];

    if (typeof val !== 'string') {
      throw new TypeError(`${key} is not present in environment variables.`);
    }

    return val;
  }
}
