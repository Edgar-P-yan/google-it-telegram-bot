import dotenv from 'dotenv';
import { ConfigVars, ConfigsFromEnv } from './configs-from-env';

export class ConfigsFromEnvFile {
  private configs: ConfigsFromEnv;

  constructor() {
    dotenv.config();

    this.configs = new ConfigsFromEnv(process.env);
  }

  get<Key extends keyof ConfigVars>(key: Key): ConfigVars[Key] {
    return this.configs.get(key);
  }

  getOrDefault<Key extends keyof ConfigVars>(
    key: Key,
    defaultVal: ConfigVars[Key],
  ): ConfigVars[Key] {
    return this.configs.getOrDefault(key, defaultVal);
  }
}
