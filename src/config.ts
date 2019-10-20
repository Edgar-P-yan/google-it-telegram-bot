import path from 'path'
import dotenv from 'dotenv'
import Joi from '@hapi/joi'
import _debug from 'debug'
const debug = _debug('app:config');

export interface IConfig {
  /**
   * Token from your bot
   */
  BOT_TOKEN: string

  /**
   * API key from your Google Project
   */
  GOOGLE_API_KEY: string

  /**
   * Google Custom Search Engines' ID
   */
  GCS_ENGINE_ID: string

  /**
   * Use web hooks or not.
   * 
   * @default false
   */
  WEB_HOOKS: boolean

  PORT?: number | undefined

  /**
   * Use only if you are using WebHooks.
   * This is the url that server will use for WebHooks.
   * You should config it in your bots settings
   * and then set it here. Should be secret,
   * for example, can contain your BOT_TOKEN.
   * 
   * @example
   * 'https://server.tld:8443/secret-path'
   */
  WEB_HOOKS_SECRET_URL?: string

  /**
   * Use only if you are using WebHooks.
   * The path from your WEB_HOOKS_SECRET_URL
   * 
   * @example
   * '/secret-path'
   */
  WEB_HOOKS_PATH?: string

  /**
   * Socks proxy url to use.
   * Leave it empty if you are not using socks proxy.
   * Helpfull in regions, where telegram is blocked.
   */
  SOCKS_PROXY?: string | undefined
}

if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
  if (result.error) {
    debug(result.error);
  }
}

const {error, value } = Joi.object({
  BOT_TOKEN: Joi.string().required(),

  GOOGLE_API_KEY: Joi.string().required(),

  GCS_ENGINE_ID: Joi.string().required(),

  WEB_HOOKS: Joi.boolean().default(false),

  WEB_HOOKS_SECRET_URL: Joi.when('WEB_HOOKS', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.any().strip(),
  }),

  WEB_HOOKS_PATH: Joi.when('WEB_HOOKS', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.any().strip(),
  }),

  PORT: Joi.when('WEB_HOOKS', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.any().strip(),
  }),

  SOCKS_PROXY: Joi.when(Joi.equal(''), {
    then: Joi.any().strip(),
    otherwise: Joi.string().uri().optional()
  }),
}).options({
  stripUnknown: true,
}).validate(process.env);

if (error) {
  throw error
}

export const config: IConfig = value;

export function get<K extends keyof IConfig>(key: K): IConfig[K] {
  return config[key]
}
