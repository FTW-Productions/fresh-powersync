import {
  LogLevel,
  PowerSyncDatabase,
  createBaseLogger,
} from "@powersync/react-native";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { appSchema } from "./app-schema";
import { Connector } from "./connector";
import { drizzleSchema } from "@/db/schema";

const logger = createBaseLogger();
logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);

export const powersync = new PowerSyncDatabase({
  schema: appSchema,
  database: { dbFilename: "manual-image-ps.db" },
  logger,
});

export const setupPowerSync = async () => {
  try {
    const connector = new Connector();
    await powersync.init();
    await powersync.connect(connector);
  } catch (error) {
    console.error(error);
  }
};

export const dbForApp = wrapPowerSyncWithDrizzle(powersync, {
  schema: drizzleSchema,
});
