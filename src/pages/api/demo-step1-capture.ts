import type { APIRoute } from "astro";
import {
	mapDemoPartialLeadFields,
	submitToWebflowForm,
} from "../../lib/webflow-form-submit";

export const prerender = false;

type CaptureBody = {
	email?: string;
	operationType?: string;
};

const OPERATION_TYPES = new Set(["maintenance", "asset", "work-order"]);

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
	let body: CaptureBody;
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const email = body.email?.trim().toLowerCase() ?? "";
	const operationType = body.operationType?.trim() ?? "";

	if (!email || !operationType) {
		return new Response(
			JSON.stringify({ error: "Email and operation type are required." }),
			{ status: 400, headers: { "Content-Type": "application/json" } },
		);
	}

	if (!isValidEmail(email)) {
		return new Response(JSON.stringify({ error: "Invalid email address." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!OPERATION_TYPES.has(operationType)) {
		return new Response(JSON.stringify({ error: "Invalid operation type." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const pageUrl =
		import.meta.env.WEBFLOW_FORM_PAGE_URL?.trim() ??
		"https://www.opmaint.com/book-demo";

	const fields = mapDemoPartialLeadFields(
		{ email, operationType },
		pageUrl,
		"Opmaint Demo",
	);

	const result = await submitToWebflowForm(fields);
	if (!result.ok) {
		return new Response(
			JSON.stringify({ error: result.message || "Webflow submission failed." }),
			{ status: result.status, headers: { "Content-Type": "application/json" } },
		);
	}

	return new Response(
		JSON.stringify({ ok: true, form: "Book Demo Form", stage: "step1", webflow: result.body }),
		{ status: 200, headers: { "Content-Type": "application/json" } },
	);
};
