/** Submit data to a Webflow form via the public v1 endpoint (no bearer token). */

export type WebflowFormFieldMap = Record<string, string | string[]>;

export type WebflowFormSubmitResult =
	| { ok: true; status: number; body: string }
	| { ok: false; status: number; message: string };

export type WebflowFormConfig = {
	siteId: string;
	formName: string;
	pageId: string;
	pageUrl: string;
	elementId?: string;
};

function getWebflowFormConfig(): WebflowFormConfig | null {
	const siteId = import.meta.env.WEBFLOW_SITE_ID?.trim();
	const formName = import.meta.env.WEBFLOW_FORM_NAME?.trim();
	const pageId = import.meta.env.WEBFLOW_FORM_PAGE_ID?.trim();
	const pageUrl = import.meta.env.WEBFLOW_FORM_PAGE_URL?.trim();
	const elementId = import.meta.env.WEBFLOW_FORM_ELEMENT_ID?.trim();

	if (!siteId || !formName || !pageId || !pageUrl) {
		return null;
	}

	return { siteId, formName, pageId, pageUrl, elementId: elementId || undefined };
}

export function isWebflowFormConfigured(): boolean {
	return getWebflowFormConfig() !== null;
}

function buildFormBody(
	config: WebflowFormConfig,
	fields: WebflowFormFieldMap,
): string {
	const body = new URLSearchParams({
		name: config.formName,
		pageId: config.pageId,
		source: config.pageUrl,
	});

	if (config.elementId) {
		body.set("elementId", config.elementId);
	}

	for (const [key, value] of Object.entries(fields)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				body.append(`fields[${key}]`, item);
			}
			continue;
		}
		// Keep empty strings — live Webflow submissions include blank hutk/page fields.
		body.set(`fields[${key}]`, value);
	}

	return body.toString();
}

/**
 * Map Book Demo Form fields to match live Webflow dashboard columns
 * (same keys as browser submissions on /book-demo).
 */
export function mapBookDemoFormFields(
	input: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		company: string;
		source: string;
	},
	pageUrl: string,
	pageTitle = "Book Demo",
): WebflowFormFieldMap {
	const fullName = `${input.firstName} ${input.lastName}`.trim();
	return {
		Fullname: fullName,
		Email: input.email,
		"Phone Number": input.phone,
		Company: input.company,
		"Where did you find us": input.source,
		Checkbox: "true",
		hutk: "",
		ipAddress: "",
		pageUri: pageUrl,
		pageId: new URL(pageUrl).pathname,
		pageName: pageTitle,
	};
}

const OPERATION_LABELS: Record<string, string> = {
	maintenance: "Maintenance",
	asset: "Asset & parts",
	"work-order": "Work order",
};

export function mapDemoLeadFields(
	input: {
		email: string;
		operationType: string;
		firstName: string;
		lastName: string;
		company: string;
		teamSize: string;
		source: string;
	},
	pageUrl: string,
	pageTitle = "Opmaint Demo",
): WebflowFormFieldMap {
	const operation =
		OPERATION_LABELS[input.operationType] ?? input.operationType;
	const fullName = `${input.firstName} ${input.lastName}`.trim();
	const source =
		input.source === "Other" ? "Others" : input.source;

	// Book Demo form columns: Fullname, Email, Phone Number, Company, Where did you find us.
	// Operation + team size use Phone Number (no phone collected on /demo).
	const demoPageUrl = pageUrl.replace(/\/book-demo\/?$/, "/demo");

	return {
		Fullname: fullName,
		Email: input.email,
		Company: input.company,
		"Phone Number": `Operation: ${operation} | Team size: ${input.teamSize}`,
		"Where did you find us": source,
		Checkbox: "true",
		hutk: "",
		ipAddress: "",
		pageUri: demoPageUrl,
		pageId: "/demo",
		pageName: pageTitle,
	};
}

export async function submitToWebflowForm(
	fields: WebflowFormFieldMap,
	configOverride?: WebflowFormConfig,
): Promise<WebflowFormSubmitResult> {
	const config = configOverride ?? getWebflowFormConfig();
	if (!config) {
		return {
			ok: false,
			status: 500,
			message:
				"Webflow form is not configured. Set WEBFLOW_SITE_ID, WEBFLOW_FORM_NAME, WEBFLOW_FORM_PAGE_ID, and WEBFLOW_FORM_PAGE_URL.",
		};
	}

	const res = await fetch(
		`https://webflow.com/api/v1/form/${config.siteId}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
				Origin: new URL(config.pageUrl).origin,
				Referer: config.pageUrl,
			},
			body: buildFormBody(config, fields),
		},
	);

	const text = await res.text();
	if (!res.ok) {
		return { ok: false, status: res.status, message: text || res.statusText };
	}

	return { ok: true, status: res.status, body: text };
}
