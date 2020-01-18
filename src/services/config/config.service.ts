import { injectable } from 'inversify'
import { NSConfig } from '../../interfaces'
import dotenv from 'dotenv';
import Joi from '@hapi/joi';

@injectable()
export class ConfigService implements NSConfig.IService {
  public config: NSConfig.IConfigVars
  
  constructor() {
    dotenv.config();
    this.config = this.validateConfig(process.env);
  }

  public get<Key extends keyof NSConfig.IConfigVars>(key: Key): NSConfig.IConfigVars[Key] {
    return this.config[key]
  }

  /**
   * Validates and returns transformed env variables.
   * Returned object contains only needed configs.
   */
  private validateConfig(config: NodeJS.ProcessEnv): NSConfig.IConfigVars {
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

      SOCKS_PROXY: Joi.when(Joi.equal(''), {
        then: Joi.any().strip(),
        otherwise: Joi.string()
          .uri()
          .optional(),
      }),
    })
      .options({
        stripUnknown: true,
      })
      .validate(process.env);

    if (error) {
      throw error;
    }

    return value as NSConfig.IConfigVars;
  }
}

