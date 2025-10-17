import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expo = openDatabaseSync("vanilla-ps.db");
export const dbForMigrations = drizzle(expo);
