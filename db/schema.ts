import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Define a Drizzle table
export const customers = sqliteTable("customers", {
  id: text("id"),
  created_at: integer("created_at"),
  phone: text("phone"),
  name: text("name"),
  created_by: text("created_by"),
});

export const projects = sqliteTable("projects", {
  id: text("id"),
  created_at: integer("created_at"),
  name: text("name"),
  customer_id: text("customer_id"),
  created_by: text("created_by"),
});

export const profiles = sqliteTable("profiles", {
  id: text("id"),
  created_at: integer("created_at"),
});

// Export the schema for use in Drizzle and PowerSync
export const drizzleSchema = {
  customers,
  projects,
  profiles,
};

// Export types for use in the app
export type Customer = typeof customers.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
