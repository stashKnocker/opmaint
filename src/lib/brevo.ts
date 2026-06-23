const BREVO_EMAIL_API = "https://api.brevo.com/v3/smtp/email";

export type BrevoSendResult =
	| { ok: true; messageId?: string }
	| { ok: false; status: number; message: string };

export function isBrevoConfigured(): boolean {
	const apiKey = import.meta.env.BREVO_API_KEY?.trim();
	const senderEmail = import.meta.env.BREVO_SENDER_EMAIL?.trim();
	return Boolean(apiKey && senderEmail);
}

function buildDemoStep1Html(operationLabel: string, demoUrl: string): string {
	return `<!DOCTYPE html>
<html>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a2e32; line-height: 1.5; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px;">
    <p style="margin: 0 0 16px;">Hi there,</p>
    <p style="margin: 0 0 16px;">Thanks for starting your Opmaint demo request. You selected <strong>${operationLabel}</strong> — you're one step away from picking a time with our team.</p>
    <p style="margin: 0 0 24px;">
      <a href="${demoUrl}" style="display: inline-block; background: #c8f135; color: #1a2e32; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Complete your demo booking</a>
    </p>
    <p style="margin: 0 0 16px;">Or copy this link: <a href="${demoUrl}">${demoUrl}</a></p>
    <p style="margin: 0; color: #5a6b6f; font-size: 14px;">— The Opmaint team</p>
  </div>
</body>
</html>`;
}

export async function sendDemoStep1Email(input: {
	email: string;
	operationLabel: string;
}): Promise<BrevoSendResult> {
	const apiKey = import.meta.env.BREVO_API_KEY?.trim();
	const senderEmail = import.meta.env.BREVO_SENDER_EMAIL?.trim();
	const senderName = import.meta.env.BREVO_SENDER_NAME?.trim() || "Opmaint";
	const demoUrl =
		import.meta.env.PUBLIC_DEMO_URL?.trim() || "https://opmaint.com/demo";
	const templateId = import.meta.env.BREVO_DEMO_STEP1_TEMPLATE_ID?.trim();

	if (!apiKey || !senderEmail) {
		return { ok: false, status: 500, message: "Brevo is not configured." };
	}

	const body: Record<string, unknown> = {
		sender: { name: senderName, email: senderEmail },
		to: [{ email: input.email }],
	};

	if (templateId) {
		body.templateId = Number(templateId);
		body.params = {
			OPERATION: input.operationLabel,
			DEMO_URL: demoUrl,
		};
	} else {
		body.subject = "Finish booking your Opmaint demo";
		body.htmlContent = buildDemoStep1Html(input.operationLabel, demoUrl);
	}

	try {
		const res = await fetch(BREVO_EMAIL_API, {
			method: "POST",
			headers: {
				"api-key": apiKey,
				"content-type": "application/json",
				accept: "application/json",
			},
			body: JSON.stringify(body),
		});

		const json = (await res.json().catch(() => ({}))) as {
			messageId?: string;
			message?: string;
			code?: string;
		};

		if (!res.ok) {
			return {
				ok: false,
				status: res.status,
				message: json.message || `Brevo request failed (${res.status})`,
			};
		}

		return { ok: true, messageId: json.messageId };
	} catch (err) {
		return {
			ok: false,
			status: 502,
			message: err instanceof Error ? err.message : "Brevo request failed.",
		};
	}
}
