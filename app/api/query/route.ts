import { connectionPool } from "../utils/database";

async function listInvoices() {
	return await connectionPool.query(`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;`);
}

export async function GET() {
  return Response.json({ invoices: await listInvoices() });
}
