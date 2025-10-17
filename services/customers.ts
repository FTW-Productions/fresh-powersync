import { Customer } from "@/db/schema";

const customerEndpoint = `${process.env.EXPO_PUBLIC_API_URL}/customers`;

export async function createCustomer(customer: Customer) {
  const response = await fetch(customerEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Do a little type juggling...
    body: JSON.stringify({
      ...customer,
      created_at: new Date(customer.created_at!).toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create customer");
  }

  return response.json();
}
