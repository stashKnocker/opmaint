import type { APIRoute } from "astro";
import {
	mapDemoLeadFields,
	submitToWebflowForm,
} from "../../lib/webflow-form-submit";

export const prerender = false;

type SubmitBody = {
	email?: string;
	operationType?: string;
	firstName?: string;
	lastName?: string;
	company?: string;
	teamSize?: string;
	source?: string;
};

const OPERATION_TYPES = new Set(["maintenance", "asset", "work-order"]);

const TEAM_SIZES = new Set([
	"1–5",
	"6–10",
	"11–25",
	"26–50",
	"51–100",
	"100+",
]);

const SOURCE_OPTIONS = new Set([
	"Google Search",
	"LinkedIn",
	"Email",
	"AI",
	"Referral",
	"Trade show / Event",
	"Podcast or content",
	"Other",
]);

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
	let body: SubmitBody;
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
	const firstName = body.firstName?.trim() ?? "";
	const lastName = body.lastName?.trim() ?? "";
	const company = body.company?.trim() ?? "";
	const teamSize = body.teamSize?.trim() ?? "";
	const source = body.source?.trim() ?? "";

	if (
		!email ||
		!operationType ||
		!firstName ||
		!lastName ||
		!company ||
		!teamSize ||
		!source
	) {
		return new Response(
			JSON.stringify({ error: "All fields are required." }),
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

	if (!TEAM_SIZES.has(teamSize)) {
		return new Response(JSON.stringify({ error: "Invalid team size." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	if (!SOURCE_OPTIONS.has(source)) {
		return new Response(JSON.stringify({ error: "Invalid source." }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const pageUrl =
		import.meta.env.WEBFLOW_FORM_PAGE_URL?.trim() ??
		"https://opmaint.com/book-demo";

	const fields = mapDemoLeadFields(
		{
			email,
			operationType,
			firstName,
			lastName,
			company,
			teamSize,
			source,
		},
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
		JSON.stringify({ ok: true, form: "Book Demo Form", webflow: result.body }),
		{ status: 200, headers: { "Content-Type": "application/json" } },
	);
};
