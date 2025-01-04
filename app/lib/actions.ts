"use server";
import { z } from "zod";
import { connectionPool } from "../api/utils/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		invalid_type_error: "Please select a customer",
		required_error: "Please select a customer",
	}),
	status: z.enum(["pending", "paid"], {
		invalid_type_error: "Please select an invoice status",
		required_error: "Please select an invoice status",
	}),
	amount: z.coerce.number().gt(0, "Please select a number greater than $0"),
	date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
	errors?: {
		customerId?: string[];
		status?: string[];
		amount?: string[];
	};
	message?: string | null;
};

export type EditState = State & {
	formData?: {
		id?: string,
		customerId?: string,
		status?: string,
		amount?: number,
		date?: string
	}
}

export async function createInvoice(prevState: State, formData: FormData) {
	//Validate form fields using Zod
	const validatedFields = CreateInvoice.safeParse(
		Object.fromEntries(formData.entries())
	);

	// If form data is invalid, return errors early.
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Missing Fields. Failed to Create Invoice.",
		};
	}
	const { customerId, amount, status } = validatedFields.data;

	const amountInCents = amount * 100;
	const date = new Date().toISOString().split("T")[0];

	const query = `
	INSERT INTO invoices (customer_id, amount, status, date)
	VALUES ($1, $2, $3, $4)
`;

	const values = [customerId, amountInCents, status, date];
	try {
		await connectionPool.query(query, values);
	} catch (error) {
		return {
			message: "Database Error: Failed to Create Invoice.",
		};
	}
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function updateInvoice(
	id: string,
	prevState: EditState,
	formData: FormData
) {
	const validatedFields = UpdateInvoice.safeParse(
		Object.fromEntries(formData.entries())
	);

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: "Not all the fields are correct. Failed to Update Invoice.",
			formData: {
				id,
				customerId: formData.get("customerId")?.toString(),
				status: formData.get("status")?.toString(),
				amount: Number(formData.get("amount")),
				date: formData.get("date")?.toString(),
			},
		};
	}

	const { customerId, amount, status } = validatedFields.data;

	const amountInCents = amount * 100;

	const query = `
			UPDATE invoices
			SET customer_id = $1, amount = $2, status = $3
			WHERE id = $4
		`;

	try {
		await connectionPool.query(query, [customerId, amountInCents, status, id]);
	} catch (error) {
		return {
			message: "Database Error: Failed to Update Invoice.",
		};
	}
	revalidatePath("/dashboard/invoices");
	redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
	const query = `
    DELETE FROM invoices
    WHERE id = $1
  `;

	try {
		await connectionPool.query(query, [id]);
	} catch (error) {
		return {
			message: "Database Error: Failed to Delete Invoice.",
		};
	}
	revalidatePath("/dashboard/invoices");
}

export async function authenticate(prevState: string | undefined, formData: FormData){
	try{
		await signIn("credentials",formData);
	} catch(error){
		if(error instanceof AuthError){
			switch(error.type){
				case "CredentialsSignin":
					return "Invalid credentials.";
				default:
					return "Something went wrong.";
			}
		}

		throw error;
	}	
}