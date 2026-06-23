/** Trim and cap SEO title tags (Google ~60 visible chars). */
export function capSeoTitle(text: string, max = 60): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= max) return normalized;
	return `${normalized.slice(0, max - 1).trim()}…`;
}

/** Trim and cap meta descriptions (Google ~155–160 visible chars). */
export function capSeoDescription(text: string, max = 158): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (normalized.length <= max) return normalized;
	return `${normalized.slice(0, max - 1).trim()}…`;
}

type WebPageJsonLdOptions = {
	site: string;
	url: string;
	name: string;
	description: string;
	breadcrumbs?: { name: string; item: string }[];
};

/** WebPage (+ optional BreadcrumbList) JSON-LD for Astro marketing/tool pages. */
export function buildWebPageJsonLd({
	site,
	url,
	name,
	description,
	breadcrumbs = [],
}: WebPageJsonLdOptions): Record<string, unknown> {
	const graph: Record<string, unknown>[] = [
		{
			"@type": "WebPage",
			"@id": `${url}#webpage`,
			url,
			name,
			description,
			isPartOf: {
				"@type": "WebSite",
				name: "Opmaint",
				url: site,
			},
		},
	];

	if (breadcrumbs.length > 0) {
		graph.push({
			"@type": "BreadcrumbList",
			itemListElement: breadcrumbs.map((crumb, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: crumb.name,
				item: crumb.item,
			})),
		});
	}

	return {
		"@context": "https://schema.org",
		"@graph": graph,
	};
}

type ToolPageJsonLdOptions = {
	site: string;
	slug: string;
	name: string;
	description: string;
	breadcrumbName: string;
};

/** JSON-LD for individual /tools/* calculator pages. */
export function buildToolPageJsonLd({
	site,
	slug,
	name,
	description,
	breadcrumbName,
}: ToolPageJsonLdOptions): Record<string, unknown> {
	const pageUrl = new URL(`/tools/${slug}`, site).href;
	return buildWebApplicationJsonLd({
		site,
		url: pageUrl,
		name,
		description,
		breadcrumbs: [
			{ name: "Home", item: site },
			{ name: "Tools", item: new URL("/tools", site).href },
			{ name: breadcrumbName, item: pageUrl },
		],
	});
}

type WebApplicationJsonLdOptions = {
	site: string;
	url: string;
	name: string;
	description: string;
	breadcrumbs: { name: string; item: string }[];
};

/** WebApplication JSON-LD for free calculator/tool pages. */
export function buildWebApplicationJsonLd({
	site,
	url,
	name,
	description,
	breadcrumbs,
}: WebApplicationJsonLdOptions): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebApplication",
				"@id": `${url}#application`,
				url,
				name,
				description,
				applicationCategory: "BusinessApplication",
				operatingSystem: "Web",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "USD",
				},
				isPartOf: {
					"@type": "WebSite",
					name: "Opmaint",
					url: site,
				},
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: breadcrumbs.map((crumb, i) => ({
					"@type": "ListItem",
					position: i + 1,
					name: crumb.name,
					item: crumb.item,
				})),
			},
		],
	};
}
