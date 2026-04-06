import raw from "../data/checklist-seo-overrides.json";

export type ChecklistSeoOverride = {
	primaryKeyword: string;
	secondaryKeyword: string;
	metaTitle: string;
	metaDescription: string;
	canonical?: string;
};

export const checklistSeoBySlug: Record<string, ChecklistSeoOverride> = raw;

export function getChecklistSeo(slug: string): ChecklistSeoOverride | undefined {
	return checklistSeoBySlug[slug];
}

/** Comma-separated meta keywords from sheet primary + secondary fields. */
export function keywordsFromSeo(seo: ChecklistSeoOverride): string | undefined {
	const p = seo.primaryKeyword.replace(/,\s*$/g, "").replace(/\s+/g, " ").trim();
	const s = seo.secondaryKeyword.replace(/\s+/g, " ").trim();
	if (p && s) return `${p}, ${s}`;
	if (p) return p;
	if (s) return s;
	return undefined;
}
