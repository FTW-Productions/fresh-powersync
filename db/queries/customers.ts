import { dbForApp } from "@/powersync/system";
import { customers, Customer } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCustomersByCreatedId(createdById: string) {
  const result = await dbForApp
    .select()
    .from(customers)
    .where(eq(customers.created_by, createdById));

  return result;
}

export async function createCustomer(customer: Customer) {
  const result = await dbForApp.insert(customers).values(customer).returning();

  return result;
}
