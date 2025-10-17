import { toPowerSyncTable } from "@powersync/drizzle-driver";
import { customers, projects, profiles } from "@/db/schema";
import { Schema } from "@powersync/react-native";

// Convert each table from Drizzle to PowerSync
const psCustomers = toPowerSyncTable(customers);
const psProjects = toPowerSyncTable(projects);
const psProfiles = toPowerSyncTable(profiles);

// Create a powersync schema using drizzle's schema

export const appSchema = new Schema({
  customers: psCustomers,
  projects: psProjects,
  profiles: psProfiles,
});
