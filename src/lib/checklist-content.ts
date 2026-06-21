export type ContentSection = {
	heading: string;
	paragraphs?: string[];
	list?: string[];
};

const CATEGORY_TIPS: Record<string, string[]> = {
	"car wash": [
		"Log chemical levels, nozzle wear, and belt tension on every tunnel or IBA shift.",
		"Pair visual checks with photo evidence for insurance claims and vendor warranty disputes.",
		"Track repeat failures on the same asset to spot training gaps before peak season.",
	],
	"manufacturing & production": [
		"Align inspection frequency with OEM manuals and production criticality.",
		"Capture meter readings and lubrication dates to feed preventive schedules.",
		"Escalate safety-related misses immediately and document corrective actions.",
	],
	"logistics & supply chain": [
		"Verify dock equipment, racking, and fleet readiness before high-volume windows.",
		"Record tyre, brake, and hygiene checks with timestamps for audit trails.",
		"Use failed items to trigger work orders before the next dispatch cycle.",
	],
	"construction & real estate": [
		"Document site hazards, fall protection, and temporary power before crews start work.",
		"Photo-document soil, scaffolding, and excavation conditions after weather events.",
		"Share completed checklists with safety officers and general contractors daily.",
	],
	"hospitality & cloud kitchens": [
		"Run F&B and housekeeping checks before service windows and guest check-in peaks.",
		"Track temperature, sanitation, and stock rotation for health-code readiness.",
		"Close the loop on failed items with assigned owners and due times.",
	],
	"retail & malls": [
		"Inspect trial rooms, escalators, and expiry-sensitive inventory on a fixed cadence.",
		"Log security walk-throughs with time-stamped evidence for loss-prevention reviews.",
		"Prioritize customer-facing areas during high-traffic hours.",
	],
	"facility management (fm)": [
		"Coordinate DG sets, STP/WTP, and common-area systems with SLA-based schedules.",
		"Bundle pest control, washroom, and HVAC checks into one digital round.",
		"Route exceptions to vendors with photos and location tags attached.",
	],
};

function normalizeCategory(categoryName: string): string {
	return categoryName
		.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

export const procedureHubContent: ContentSection[] = [
	{
		heading: "Maintenance procedures and inspection templates",
		paragraphs: [
			"The Procedure Hub centralizes free checklists for manufacturing, logistics, construction, hospitality, retail, facilities, and car wash operations. Each template is ready for field use—download as PDF or Excel, or digitize checks in Opmaint with assignments, photos, and work orders.",
			"Browse by industry, search by equipment or process type, and open the checklist that matches your audit, PM round, or safety walk-through.",
		],
	},
	{
		heading: "Who uses these checklists",
		list: [
			"Maintenance technicians running daily or weekly equipment rounds.",
			"Supervisors preparing for OSHA, FSSAI, HACCP, or client audits.",
			"Facility managers standardizing FM, washroom, and utility inspections.",
			"Operations leaders building preventive programs on consistent templates.",
		],
	},
	{
		heading: "From checklist to closed-loop maintenance",
		paragraphs: [
			"Static PDFs help you start; digital execution helps you scale. Opmaint turns these procedures into mobile checklists tied to assets, parts, and KPIs so failed items automatically become tracked work.",
		],
	},
];

/** Unique on-page copy blocks to enrich thin checklist templates. */
export function getChecklistEnrichment(
	categoryName: string,
	title: string,
	itemCount: number
): ContentSection[] {
	const category = normalizeCategory(categoryName);
	const tips =
		CATEGORY_TIPS[category] ?? CATEGORY_TIPS["manufacturing & production"];

	return [
		{
			heading: "How to use this checklist",
			paragraphs: [
				`This ${itemCount}-point procedure for ${title} is designed for technicians, supervisors, and compliance teams who need a repeatable inspection workflow. Work through each item in order, record pass/fail or measured values, and attach notes or photos where the template allows.`,
				"Complete the checklist during scheduled preventive maintenance, after repairs, or before critical operating windows. Consistent use helps you spot drift early, reduce unplanned downtime, and keep audit evidence in one place.",
			],
		},
		{
			heading: `Why ${title} inspections matter`,
			paragraphs: [
				`Regular inspections for ${title} protect equipment life, operator safety, and service quality. Skipping steps—or relying on memory—creates blind spots that show up as breakdowns, rework, or failed audits.`,
				`Standardizing this ${categoryName.trim()} checklist gives every shift the same baseline. Teams can compare results over time, hand off issues clearly, and justify maintenance spend with documented findings.`,
			],
		},
		{
			heading: "Best practices for field teams",
			list: tips,
		},
		{
			heading: "Digitize this procedure with Opmaint",
			paragraphs: [
				"Export this checklist as PDF or Excel for free, or run it digitally in Opmaint to assign tasks, capture signatures, and trigger work orders when items fail. Mobile-first checklists help frontline staff complete inspections on the plant floor, in the tunnel, or on site—without paper binders.",
				"Pair preventive schedules with parts inventory and asset history so repeat failures on the same equipment surface in reports. Book a demo to see how Opmaint turns static procedures into closed-loop maintenance workflows.",
			],
		},
	];
}
