"use server";
import { z } from "zod";
import { connectionPool } from "../api/utils/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	status: z.enum(["pending", "paid"]),
	amount: z.coerce.number(),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
	const { customerId, amount, status } = CreateInvoice.parse(
		Object.fromEntries(formData.entries())
	);

	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	const query = `
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES ($1, $2, $3, $4)
  `;

	const values = [customerId, amountInCents, status, date];

	await connectionPool.query(query, values);

	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
	const { customerId, amount, status } = UpdateInvoice.parse(
		Object.fromEntries(formData.entries())
	);

	const amountInCents = amount * 100;

	const query = `
    UPDATE invoices
    SET customer_id = $1, amount = $2, status = $3
    WHERE id = $4
  `;

	await connectionPool.query(query, [customerId, amountInCents, status, id]);
  revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
	const query = `
    DELETE FROM invoices
    WHERE id = $1
  `;

	await connectionPool.query(query, [id]);

	revalidatePath("/dashboard/invoices");
}