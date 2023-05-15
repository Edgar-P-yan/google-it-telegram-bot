import Joi from '@hapi/joi';
import _ from 'lodash';

export type Key =
  | 'BOT_TOKEN'
  | 'GOOGLE_API_KEY'
  | 'GCS_ENGINE_ID'
  | 'WEB_HOOKS'
  | 'PORT'
  | 'WEB_HOOKS_SECRET_URL'
  | 'WEB_HOOKS_PATH';

export class ConfigsFromEnv {
  private validatedConfigs: ConfigVars;

  constructor(env: NodeJS.ProcessEnv) {
    this.validatedConfigs = this.validate(env);
  }

  private validate(env: NodeJS.ProcessEnv): ConfigVars {
    const { error, value } = Joi.object({
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

      LOGGING_LEVEL: Joi.string().optional(),
    })
      .options({
        stripUnknown: true,
      })
      .validate(env);

    if (error) {
      throw error;
    }

    return value;
  }

  /**
   * @throws {TypeError} if the environment variable is not set. Empty strings are accounted as valid values.
   */
  get<Key extends keyof ConfigVars>(key: Key): ConfigVars[Key] {
    const val = this.validatedConfigs[key];

    if (_.isNil(val)) {
      throw new TypeError(`${key} is not present in environment variables.`);
    }

    return val;
  }

  getOrDefault<Key extends keyof ConfigVars>(
    key: Key,
    defaultVal: ConfigVars[Key],
  ): ConfigVars[Key] {
    const val = this.validatedConfigs[key];

    if (_.isNil(val)) {
      return defaultVal;
    }

    return val;
  }
}

export interface ConfigVars {
  /**
   * Token from your bot
   */
  BOT_TOKEN: string;

  /**
   * API key from your Google Project
   */
  GOOGLE_API_KEY: string;

  /**
   * Google Custom Search Engines' ID
   */
  GCS_ENGINE_ID: string;

  /**
   * Use web hooks or not.
   *
   * @default false
   */
  WEB_HOOKS: boolean;

  /**
   * Use only if you are using WebHooks.
   * The port on which webhook server will listen
   * Note: telegram sends webhooks only to these ports: 443, 80, 88, 8443
   * @see https://core.telegram.org/bots/api#setwebhook
   */
  PORT?: number | undefined;

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
  WEB_HOOKS_SECRET_URL?: string;

  /**
   * Use only if you are using WebHooks.
   * The path from your WEB_HOOKS_SECRET_URL
   *
   * @example
   * '/secret-path'
   */
  WEB_HOOKS_PATH?: string;

  LOGGING_LEVEL?: string;
}
