import type { APIRoute } from "astro";
import { isBrevoConfigured, sendDemoStep1Email } from "../../lib/brevo";
import {
	isWebflowFormConfigured,
	mapDemoStep1LeadFields,
	submitToWebflowForm,
} from "../../lib/webflow-form-submit";

export const prerender = false;

type Step1Body = {
	email?: string;
	operationType?: string;
};

const OPERATION_TYPES = new Set(["maintenance", "asset", "work-order"]);

const OPERATION_LABELS: Record<string, string> = {
	maintenance: "Maintenance",
	asset: "Asset & parts",
	"work-order": "Work order",
};

const FREE_EMAIL_DOMAINS = new Set([
	"gmail.com",
	"googlemail.com",
	"yahoo.com",
	"yahoo.co.uk",
	"hotmail.com",
	"outlook.com",
	"live.com",
	"msn.com",
	"icloud.com",
	"me.com",
	"aol.com",
	"protonmail.com",
	"proton.me",
	"mail.com",
	"gmx.com",
	"yandex.com",
	"zoho.com",
	"hey.com",
	"fastmail.com",
]);

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isWorkEmail(email: string): boolean {
	const domain = email.split("@")[1];
	return domain ? !FREE_EMAIL_DOMAINS.has(domain) : false;
}

export const POST: APIRoute = async ({ request }) => {
	const brevoReady = isBrevoConfigured();
	const webflowReady = isWebflowFormConfigured();

	if (!brevoReady && !webflowReady) {
		return new Response(
			JSON.stringify({ error: "Step 1 capture is not configured." }),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}

	let body: Step1Body;
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

	if (!isValidEmail(email) || !isWorkEmail(email)) {
		return new Response(JSON.stringify({ error: "Invalid work email address." }), {
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

	const operationLabel = OPERATION_LABELS[operationType] ?? operationType;
	const pageUrl =
		import.meta.env.WEBFLOW_FORM_PAGE_URL?.trim() ??
		"https://opmaint.com/book-demo";

	const [brevoResult, webflowResult] = await Promise.all([
		brevoReady
			? sendDemoStep1Email({ email, operationLabel })
			: Promise.resolve(null),
		webflowReady
			? submitToWebflowForm(
					mapDemoStep1LeadFields({ email, operationType }, pageUrl),
				)
			: Promise.resolve(null),
	]);

	const brevoOk = !brevoReady || brevoResult?.ok === true;
	const webflowOk = !webflowReady || webflowResult?.ok === true;

	if (!brevoOk && !webflowOk) {
		const message =
			[
				brevoResult && !brevoResult.ok ? brevoResult.message : null,
				webflowResult && !webflowResult.ok ? webflowResult.message : null,
			]
				.filter(Boolean)
				.join(" ") || "Step 1 capture failed.";
		return new Response(JSON.stringify({ error: message }), {
			status: 502,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(
		JSON.stringify({
			ok: true,
			brevo: brevoResult?.ok ? { messageId: brevoResult.messageId } : null,
			webflow: webflowResult?.ok ? { status: webflowResult.status } : null,
		}),
		{ status: 200, headers: { "Content-Type": "application/json" } },
	);
};
