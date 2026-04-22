import type { APIRoute } from "astro";
import { buildLlmTxtBody } from "../../lib/llm-txt";

export const GET: APIRoute = ({ site }) => {
	const origin = site?.toString() ?? "https://www.opmaint.com";
	return new Response(buildLlmTxtBody(origin), {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
