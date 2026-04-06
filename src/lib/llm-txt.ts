import { checklistEntries, stripEmojis } from "./checklists";

/** Plain-text index for LLM crawlers (llm.txt); built at /llm.txt and /.well-known/llm.txt */
export function buildLlmTxtBody(siteOrigin: string): string {
	const base = siteOrigin.replace(/\/$/, "");
	const lines: string[] = [
		"# Opmaint",
		"",
		"> Maintenance procedures, printable checklists, and operational tools for facilities and equipment. Use the Procedure Hub to browse by industry; each checklist has a stable URL and JSON-LD on the page.",
		"",
		"## Main entry points",
		"",
		`- Home (marketing): ${base}/`,
		`- Procedure Hub (all checklists): ${base}/procedure`,
		`- Tools: ${base}/tools`,
		`- Blog: ${base}/blog`,
		"",
		"## Maintenance checklists",
		"",
		"Each URL is a printable checklist page (HTML). Structured data (JSON-LD) on each page describes the checklist items.",
		"",
	];

	for (const { slug, categoryName } of checklistEntries) {
		const cat = stripEmojis(categoryName)
			.replace(/[\uFE00-\uFE0F]/g, "")
			.replace(/\s+/g, " ")
			.trim();
		lines.push(`- ${cat}: ${base}/checklist/${slug}`);
	}

	lines.push("");
	return lines.join("\n");
}
