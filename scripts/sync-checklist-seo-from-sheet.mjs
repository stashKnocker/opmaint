/**
 * Fetches "Opmaint Checklist SEO" Google Sheet as CSV and writes
 * src/data/checklist-seo-overrides.json keyed by checklist slug.
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1CvfyXrdhumT8vZ9LudSDH4ShowMnYcwwEQ3ZoVQz11U/
 */
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/checklist-seo-overrides.json");
const SHEET_CSV =
	"https://docs.google.com/spreadsheets/d/1CvfyXrdhumT8vZ9LudSDH4ShowMnYcwwEQ3ZoVQz11U/export?format=csv";

function slugFromChecklistUrl(url) {
	const m = String(url || "")
		.trim()
		.match(/\/checklist\/([^/?#]+)\/?$/i);
	return m ? decodeURIComponent(m[1]) : null;
}

function cleanCell(s) {
	return String(s ?? "")
		.replace(/\r/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

const res = await fetch(SHEET_CSV);
if (!res.ok) {
	console.error("Failed to fetch sheet CSV:", res.status, res.statusText);
	process.exit(1);
}
const text = await res.text();

const rows = parse(text, {
	columns: (header) => header.map((h) => String(h).trim()),
	skip_empty_lines: false,
	relax_quotes: true,
	relax_column_count: true,
});

const out = {};
let skipped = 0;

for (const row of rows) {
	const pages = cleanCell(row.Pages ?? row["Pages"]);
	if (!pages || !pages.startsWith("http")) continue;

	const slug = slugFromChecklistUrl(pages);
	if (!slug) {
		skipped++;
		continue;
	}

	const primaryKeyword = cleanCell(row["Primary Keywords"]);
	const secondaryKeyword = cleanCell(row["Secondary Keyword"]);
	const metaTitle = cleanCell(row["Meta Title"]);
	const metaDescription = cleanCell(row["Meta Description"]);
	const canonical = cleanCell(row.Canonical ?? row["Canonical"]);

	if (!metaTitle || !metaDescription) {
		skipped++;
		continue;
	}

	out[slug] = {
		primaryKeyword,
		secondaryKeyword,
		metaTitle,
		metaDescription,
		...(canonical ? { canonical } : {}),
	};
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, "\t") + "\n", "utf8");
console.log(
	`Wrote ${Object.keys(out).length} checklist SEO overrides to ${path.relative(process.cwd(), OUT)} (skipped ${skipped} rows)`
);
