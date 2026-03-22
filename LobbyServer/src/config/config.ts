import { SERVER_CONFIG } from "./server.config";
import { redis } from "./redis.config";
import { emailConfig } from "./mail.config";
import { commonConfig } from "./common.config";


export const CONFIG = {
  common: commonConfig,
  server: SERVER_CONFIG,
  redis: redis,
  mail: emailConfig,
};