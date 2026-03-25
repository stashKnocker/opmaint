import dataJson from "../../data.json";
import carwashJson from "../../carwash-usa-checklists.json";

/** All procedure categories: base industries + car wash (USA) OEM checklists */
export const allChecklistCategories = [
	...dataJson,
	...carwashJson,
] as typeof dataJson;

export const toSlug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");

export const stripEmojis = (text: string) =>
	text
		.replace(
			/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
			""
		)
		.trim();

export type ChecklistEntry = {
	slug: string;
	checklist: (typeof dataJson)[0]["checklists"][0];
	categoryName: string;
	categoryRaw: string;
};

/** Stable ordering + unique slugs (handles duplicate titles across the corpus). */
export const checklistEntries: ChecklistEntry[] = (() => {
	const slugCount = new Map<string, number>();
	const makeUnique = (base: string) => {
		const n = slugCount.get(base) ?? 0;
		slugCount.set(base, n + 1);
		return n === 0 ? base : `${base}-${n + 1}`;
	};

	const entries: ChecklistEntry[] = [];
	for (const cat of allChecklistCategories) {
		for (const checklist of cat.checklists) {
			const base = toSlug(checklist.title);
			entries.push({
				slug: makeUnique(base),
				checklist,
				categoryName: stripEmojis(cat.category_name),
				categoryRaw: cat.category_name,
			});
		}
	}
	return entries;
})();

export const checklistSlugByChecklist = new Map(
	checklistEntries.map((e) => [e.checklist, e.slug])
);

export function getSlugForChecklist(
	checklist: (typeof dataJson)[0]["checklists"][0]
): string {
	return checklistSlugByChecklist.get(checklist) ?? toSlug(checklist.title);
}
