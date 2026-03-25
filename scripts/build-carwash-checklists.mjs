/**
 * Builds car wash equipment checklists from the public Google Sheet CSV export.
 * Each equipment row produces two checklists (one per brand / source URL).
 *
 * Usage:
 *   node scripts/build-carwash-checklists.mjs
 *   node scripts/build-carwash-checklists.mjs --dry-run          # parse sheet only
 *   node scripts/build-carwash-checklists.mjs --limit 4        # first N source URLs (for testing)
 *   node scripts/build-carwash-checklists.mjs --openai           # use OPENAI_API_KEY to structure items (costs API usage)
 *   SHEET_URL=... node scripts/build-carwash-checklists.mjs      # override CSV export URL
 *
 * Output: carwash-usa-checklists.json (same schema as data.json categories)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CACHE_DIR = path.join(__dirname, ".carwash-cache");
const DEFAULT_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/12FQxLJIhaIIqQfZgkZ4qUiqTl9goKrbOpBHNcQEYyIs/export?format=csv";

function parseArgs(argv) {
  const out = { dryRun: false, limit: null, openai: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") out.dryRun = true;
    else if (argv[i] === "--openai") out.openai = true;
    else if (argv[i] === "--limit" && argv[i + 1]) {
      out.limit = Number(argv[++i]);
    }
  }
  return out;
}

/** @param {string} csvText */
function parseSheetRows(csvText) {
  const rows = parse(csvText, {
    relax_column_count: true,
    skip_empty_lines: false,
    bom: true,
  });

  let currentSection = "";
  /** @type {{ section: string, equipment: string, brand: string, url: string }[]} */
  const entries = [];

  for (const row of rows) {
    const a = String(row[0] ?? "").trim();
    const b = String(row[1] ?? "").trim();
    const c = String(row[2] ?? "").trim();
    const d = String(row[3] ?? "").trim();
    const e = String(row[4] ?? "").trim();

    if (/^\d+\.\s/.test(a) && b === "Brand" && c === "Checklist") {
      currentSection = a.replace(/^\s+/, "").trim();
      continue;
    }

    if (!a || /^location\s*:/i.test(a)) continue;

    const hasPrimary = c.startsWith("http");
    const hasSecondary = e.startsWith("http");
    if (!hasPrimary && !hasSecondary) continue;
    if (b === "Brand" && !hasPrimary && !hasSecondary) continue;

    if (hasPrimary) {
      entries.push({
        section: currentSection,
        equipment: a,
        brand: b,
        url: c.replace(/\?+$/, ""),
      });
    }
    if (hasSecondary) {
      entries.push({
        section: currentSection,
        equipment: a,
        brand: d,
        url: e.replace(/\?+$/, ""),
      });
    }
  }

  return entries;
}

function cachePath(url) {
  const h = crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
  return path.join(CACHE_DIR, `${h}.json`);
}

function readCache(url) {
  try {
    const p = cachePath(url);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function writeCache(url, payload) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(url), JSON.stringify(payload), "utf8");
}

/**
 * @param {Buffer} buf
 * @param {number} ms
 */
async function extractPdfTextWithTimeout(buf, ms) {
  const parser = new PDFParse({ data: buf });
  try {
    const tr = await Promise.race([
      parser.getText(),
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error(`PDF extract timed out after ${ms}ms`)), ms),
      ),
    ]);
    return tr.text || "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

/** @param {string} html */
function htmlToText(html) {
  const liBlocks = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((s) => s.length > 3);
  if (liBlocks.length >= 4) {
    return liBlocks.join("\n");
  }
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} url
 * @returns {Promise<{ text: string, contentType: string, error?: string }>}
 */
async function fetchDocumentText(url) {
  const cached = readCache(url);
  if (cached?.text) return { text: cached.text, contentType: cached.contentType || "" };

  /** @type {Response | null} */
  let res = null;
  try {
    res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(90_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OpmaintChecklistBuilder/1.0; +https://opmaint.com)",
        Accept: "application/pdf,text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    writeCache(url, { text: "", contentType: "", error: err });
    return { text: "", contentType: "", error: err };
  }

  if (!res.ok) {
    const err = `HTTP ${res.status}`;
    writeCache(url, { text: "", contentType: "", error: err });
    return { text: "", contentType: "", error: err };
  }

  const contentType = res.headers.get("content-type") || "";
  let buf;
  try {
    buf = Buffer.from(await res.arrayBuffer());
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    writeCache(url, { text: "", contentType, error: err });
    return { text: "", contentType, error: err };
  }

  let text = "";
  if (contentType.includes("pdf") || /\.pdf(\?|$)/i.test(url)) {
    try {
      text = await extractPdfTextWithTimeout(buf, 75_000);
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      writeCache(url, { text: "", contentType, error: err });
      return { text: "", contentType, error: err };
    }
  } else {
    const raw = buf.toString("utf8");
    text = htmlToText(raw);
  }

  writeCache(url, { text, contentType });
  return { text, contentType };
}

const CHECKLIST_VERB =
  /^(verify|check|inspect|ensure|clean|lubricate|replace|record|test|confirm|perform|examine|assess|monitor|drain|tighten|adjust|calibrat)/i;

/** @param {string} text */
function heuristicTextToItems(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && l.length < 450);

  const candidates = [];
  for (const line of lines) {
    let s = line;
    const num = s.match(/^[\d]{1,3}[\.\)]\s+(.+)/);
    if (num) {
      candidates.push(num[1].trim());
      continue;
    }
    const bullet = s.match(/^[•\-\*▪►]\s*(.+)/);
    if (bullet) {
      candidates.push(bullet[1].trim());
      continue;
    }
    const letter = s.match(/^[a-z][\.\)]\s*(.+)/i);
    if (letter) {
      candidates.push(letter[1].trim());
      continue;
    }
    if (CHECKLIST_VERB.test(s) && !/table of contents|page \d/i.test(s)) {
      candidates.push(s);
    }
  }

  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    const k = c.toLowerCase().slice(0, 120);
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(c);
    if (uniq.length >= 28) break;
  }

  return uniq.map((question) => ({
    question,
    type: "radio",
    options: ["Pass", "Fail", "N/A"],
    allow_notes: true,
    allow_media: true,
  }));
}

function fallbackItems(equipment, brand, url) {
  return [
    {
      question: `Pre-operation / safety: confirm lockout-tagout and safe access before servicing ${equipment} (${brand}).`,
      type: "radio",
      options: ["Confirmed", "Not applicable", "Issue noted"],
      allow_notes: true,
      allow_media: true,
    },
    {
      question: `Record observations, measurements, or deficiencies for ${equipment}.`,
      type: "text",
      placeholder: "Notes, readings, follow-up actions",
      allow_notes: true,
      allow_media: true,
    },
    {
      question: `Overall equipment condition (${brand}).`,
      type: "rating",
      min: 1,
      max: 5,
      allow_notes: true,
      allow_media: true,
    },
  ];
}

/**
 * @param {string} text
 * @param {string} equipment
 * @param {string} brand
 */
async function openAiToItems(text, equipment, brand) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You convert maintenance or inspection document text into a checklist for a CMMS app. " +
          "Each item must use only these types: radio, text, slider, checkbox, rating. " +
          "Include allow_notes: true and allow_media: true on every item. " +
          "Use radio with options like Pass/Fail/N/A or Compliant/Non-Compliant where appropriate. " +
          "Return JSON: {\"items\":[...]} with at least 5 and at most 25 items when the source allows.",
      },
      {
        role: "user",
        content: `Equipment: ${equipment}\nBrand: ${brand}\n\nDocument text:\n${text.slice(0, 14000)}`,
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const items = parsed.items;
    if (!Array.isArray(items) || items.length === 0) return null;
    return normalizeItems(items);
  } catch {
    return null;
  }
}

/** @param {unknown[]} items */
function normalizeItems(items) {
  return items.map((raw) => {
    const it = /** @type {Record<string, unknown>} */ (raw);
    const base = {
      question: String(it.question ?? "").slice(0, 2000),
      type: ["radio", "text", "slider", "checkbox", "rating"].includes(String(it.type))
        ? String(it.type)
        : "radio",
      allow_notes: true,
      allow_media: true,
    };
    if (base.type === "radio" || base.type === "checkbox") {
      const opts = it.options;
      if (Array.isArray(opts) && opts.length) {
        return { ...base, options: opts.map((o) => String(o).slice(0, 200)) };
      }
      return { ...base, type: "radio", options: ["Pass", "Fail", "N/A"] };
    }
    if (base.type === "text") {
      return {
        ...base,
        placeholder: it.placeholder ? String(it.placeholder).slice(0, 200) : "Enter value",
      };
    }
    if (base.type === "slider") {
      return {
        ...base,
        min: Number(it.min ?? 0),
        max: Number(it.max ?? 100),
        unit: it.unit ? String(it.unit) : "%",
      };
    }
    if (base.type === "rating") {
      return {
        ...base,
        min: Number(it.min ?? 1),
        max: Number(it.max ?? 5),
      };
    }
    return base;
  });
}

/**
 * @param {{ section: string, equipment: string, brand: string, url: string }[]} entries
 * @param {{ limit: number | null, openai: boolean }} opts
 */
function uniqueUrlsInOrder(entries) {
  const seen = new Set();
  const urls = [];
  for (const e of entries) {
    if (!seen.has(e.url)) {
      seen.add(e.url);
      urls.push(e.url);
    }
  }
  return urls;
}

async function buildChecklists(entries, opts) {
  const urls = uniqueUrlsInOrder(entries);
  const toFetch = opts.limit != null ? urls.slice(0, opts.limit) : urls;
  const urlSet = new Set(toFetch);

  /** @type {Map<string, { text: string, error?: string }>} */
  const textByUrl = new Map();

  let i = 0;
  const batchSize = 4;
  for (let j = 0; j < toFetch.length; j += batchSize) {
    const batch = toFetch.slice(j, j + batchSize);
    const results = await Promise.all(
      batch.map(async (url) => {
        process.stdout.write(`\rFetching ${++i}/${toFetch.length}…`);
        const r = await fetchDocumentText(url);
        return { url, r };
      }),
    );
    for (const { url, r } of results) {
      textByUrl.set(url, { text: r.text || "", error: r.error });
    }
  }
  if (toFetch.length) process.stdout.write("\n");

  /** @type {Map<string, { category_name: string, checklists: object[] }>} */
  const bySection = new Map();

  for (const entry of entries) {
    if (opts.limit != null && !urlSet.has(entry.url)) continue;

    const fetched = textByUrl.get(entry.url);
    const text = fetched?.text || "";
    let items;

    if (opts.openai && text.length > 80) {
      items = await openAiToItems(text, entry.equipment, entry.brand);
    }
    if (!items || items.length === 0) {
      items = text.length > 40 ? heuristicTextToItems(text) : [];
    }
    if (items.length === 0) {
      items = fallbackItems(entry.equipment, entry.brand, entry.url);
    }

    const title = `${entry.equipment} — ${entry.brand}`;
    const descParts = [
      `Preventive maintenance and inspection checklist for ${entry.equipment} (${entry.brand}), USA car wash operations.`,
      `Source document: ${entry.url}`,
    ];
    if (fetched?.error) descParts.push(`Fetch note: ${fetched.error}`);

    const checklist = {
      title,
      description: descParts.join(" "),
      items,
    };

    const catKey = entry.section || "Uncategorized";
    if (!bySection.has(catKey)) {
      bySection.set(catKey, {
        category_name: `🚗 Car wash (USA) — ${catKey}`,
        checklists: [],
      });
    }
    bySection.get(catKey).checklists.push(checklist);
  }

  return [...bySection.values()];
}

async function main() {
  const args = parseArgs(process.argv);
  const sheetUrl = process.env.SHEET_URL || DEFAULT_SHEET_CSV;

  if (args.dryRun) {
    const res = await fetch(sheetUrl);
    const csv = await res.text();
    const entries = parseSheetRows(csv);
    console.log(`Parsed ${entries.length} brand rows (${new Set(entries.map((e) => e.url)).size} unique URLs).`);
    console.log(entries.slice(0, 6));
    return;
  }

  const res = await fetch(sheetUrl);
  if (!res.ok) throw new Error(`Sheet CSV failed: ${res.status}`);
  const csv = await res.text();
  const allEntries = parseSheetRows(csv);

  const uniqueUrls = new Set(allEntries.map((e) => e.url)).size;
  console.log(`Sheet: ${allEntries.length} checklists (${uniqueUrls} unique URLs).`);

  const categories = await buildChecklists(allEntries, {
    limit: args.limit,
    openai: args.openai,
  });

  const outPath = path.join(ROOT, "carwash-usa-checklists.json");
  fs.writeFileSync(outPath, JSON.stringify(categories, null, 4) + "\n", "utf8");
  console.log(`Wrote ${outPath} (${categories.length} categories).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
