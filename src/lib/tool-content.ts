import type { ContentSection } from "./checklist-content";

export const toolsIndexContent: ContentSection[] = [
	{
		heading: "Free maintenance calculators for operations teams",
		paragraphs: [
			"Opmaint's tools library helps maintenance managers, reliability engineers, and plant leaders quantify performance without spreadsheets. Each calculator is free to use, requires no signup, and includes plain-language guidance on what the metric means and how to improve it.",
			"Use these utilities during daily stand-ups, post-incident reviews, capital planning, or CMMS rollout discussions. Pair the results with work-order history and asset records in Opmaint to turn one-off calculations into trend lines your team can act on.",
		],
	},
	{
		heading: "When to use each calculator",
		list: [
			"OEE, MTTR, and MTBF for production and reliability benchmarking.",
			"Downtime and ROI calculators for justifying repairs, upgrades, or software investments.",
			"Industry tools for car wash revenue, cold storage energy, laundry throughput, and corrugated yield.",
			"Unit converter for pressure, power, temperature, and energy readings on the plant floor.",
		],
	},
	{
		heading: "From metrics to action",
		paragraphs: [
			"Calculators are most valuable when results feed preventive schedules, KPI dashboards, and root-cause reviews. Document assumptions, revisit inputs monthly, and compare sites or lines using the same formula so leadership sees apples-to-apples trends.",
		],
	},
];

const TOOL_CONTENT: Record<string, ContentSection[]> = {
	"oee-calculator": [
		{
			heading: "What OEE tells you",
			paragraphs: [
				"Overall Equipment Effectiveness combines availability, performance, and quality into one productivity score. World-class manufacturing lines often target 85% OEE or higher, while many plants operate closer to 60% without realizing where losses accumulate.",
				"Breaking OEE into its three factors helps teams prioritize: stop chasing quality tweaks when availability losses from changeovers dominate, or when speed losses on bottleneck equipment cap throughput.",
			],
		},
		{
			heading: "How to improve OEE",
			list: [
				"Reduce unplanned stops with preventive maintenance tied to runtime meters.",
				"Cut micro-stops and speed losses with standardized changeover checklists.",
				"Lower scrap and rework with in-process inspection and calibrated instruments.",
				"Review OEE by shift, SKU, and line to find repeatable patterns.",
			],
		},
		{
			heading: "Track OEE over time",
			paragraphs: [
				"Save your inputs after each calculation and log them alongside downtime codes in your CMMS. Opmaint helps teams connect OEE trends to work orders, parts usage, and technician notes so improvements stick beyond a single spreadsheet snapshot.",
			],
		},
	],
	"mttr-calculator": [
		{
			heading: "Understanding MTTR",
			paragraphs: [
				"Mean Time To Repair measures how long equipment stays down from failure to restored operation. Lower MTTR usually means faster diagnosis, better spare-parts readiness, and clearer escalation paths—not rushed fixes that create repeat failures.",
				"Track MTTR by asset class, failure mode, and technician crew. A rising MTTR on one press or conveyor often signals training gaps, missing documentation, or parts stocking issues worth a root-cause review.",
			],
		},
		{
			heading: "Ways to reduce repair time",
			list: [
				"Standardize troubleshooting guides and attach them to asset records.",
				"Stage critical spares at the line and verify BOM accuracy quarterly.",
				"Use mobile work orders with photos, notes, and handoff timestamps.",
				"Hold short post-repair reviews when MTTR exceeds your target band.",
			],
		},
		{
			heading: "Pair MTTR with MTBF",
			paragraphs: [
				"MTTR shows repair speed; MTBF shows how often failures occur. Together they frame maintainability versus reliability trade-offs. Opmaint dashboards help teams monitor both metrics from the same work-order and downtime data.",
			],
		},
	],
	"mtbf-calculator": [
		{
			heading: "Why MTBF matters",
			paragraphs: [
				"Mean Time Between Failures estimates how long assets run between breakdowns. It is a core reliability indicator for pumps, compressors, drives, and any equipment where unplanned stops disrupt production or customer service.",
				"Use MTBF to justify redesigns, preventive interval changes, or vendor swaps. Compare MTBF before and after a PM program change to prove whether the intervention actually extended run life.",
			],
		},
		{
			heading: "Improving MTBF",
			list: [
				"Align lubrication, alignment, and filtration tasks with OEM guidance.",
				"Replace components on condition or age before catastrophic failure modes.",
				"Eliminate repeat root causes instead of closing tickets without analysis.",
				"Segment failures: operator error, wear, and design issues need different fixes.",
			],
		},
		{
			heading: "Data quality tips",
			paragraphs: [
				"MTBF is only as good as failure definitions. Agree on what counts as a failure, exclude planned maintenance windows, and timestamp events consistently. Digital work orders in Opmaint reduce gaps that skew reliability math.",
			],
		},
	],
	"downtime-calculator": [
		{
			heading: "Quantifying downtime cost",
			paragraphs: [
				"Downtime calculators translate lost hours into revenue, labor, and penalty exposure. That number helps maintenance leaders prioritize projects, justify overtime spares, or secure budget for predictive monitoring.",
				"Include direct production loss, scrap, expedited freight, and customer penalties where applicable. Even partial-hour stops on bottleneck equipment can exceed the cost of a preventive upgrade.",
			],
		},
		{
			heading: "Common downtime drivers",
			list: [
				"Waiting on parts or vendor technicians after a failure.",
				"Changeovers and setup errors on high-mix lines.",
				"Quality holds that stop upstream equipment.",
				"Deferred PM that turns into emergency repairs.",
			],
		},
		{
			heading: "Turn cost into action",
			paragraphs: [
				"Share downtime totals in weekly ops reviews and tie each major event to corrective work orders. Opmaint links downtime codes, assets, and follow-up tasks so the same issues do not recur silently.",
			],
		},
	],
	"roi-calculator": [
		{
			heading: "Building a credible maintenance ROI case",
			paragraphs: [
				"Return on investment models help secure approval for CMMS software, spare-parts programs, condition monitoring, or line upgrades. Include labor savings from fewer emergency calls, reduced downtime, inventory carrying-cost cuts, and compliance risk reduction.",
				"Be conservative with assumptions and document them. Finance teams trust ranges with clear inputs more than a single optimistic percentage.",
			],
		},
		{
			heading: "Typical CMMS ROI levers",
			list: [
				"Fewer hours spent searching for work history or paper logs.",
				"Lower overtime from better-planned preventive work.",
				"Reduced scrap and rework through inspection discipline.",
				"Better spare-parts turns and fewer rush shipments.",
			],
		},
		{
			heading: "After you calculate",
			paragraphs: [
				"Revisit ROI quarterly as real savings materialize. Opmaint customers often track payback through downtime reduction and wrench-time gains—use this calculator as a starting point, then validate with operational data.",
			],
		},
	],
	"unit-converter": [
		{
			heading: "Maintenance unit conversions on the floor",
			paragraphs: [
				"Technicians routinely switch between PSI and bar, kW and hp, °F and °C, or kWh and BTU when reading gauges, OEM manuals, and energy bills. A reliable converter prevents rounding errors that lead to mis-set limits or incorrect spare specifications.",
				"Bookmark common conversions for your plant standards so every shift uses the same reference values during inspections and calibrations.",
			],
		},
		{
			heading: "Where conversions matter most",
			list: [
				"Hydraulic and pneumatic systems with mixed imperial and metric fittings.",
				"Energy audits for HVAC, refrigeration, and compressed air systems.",
				"Torque, pressure, and temperature setpoints on imported equipment.",
				"Environmental and safety reports that require SI units.",
			],
		},
		{
			heading: "Keep readings in your CMMS",
			paragraphs: [
				"Store meter readings in consistent units inside Opmaint so trend charts and alarm thresholds stay comparable across sites and vendors.",
			],
		},
	],
	"laundry-throughput-calculator": [
		{
			heading: "Planning laundry capacity",
			paragraphs: [
				"Throughput calculators help hospitality, healthcare, and industrial laundry operations match machine capacity to daily poundage or piece counts. Underutilized equipment wastes capital; overloaded lines create bottlenecks, rewash, and missed SLA deliveries.",
				"Model different shift patterns, mix of goods, and dryer availability before peak seasons or new contract wins.",
			],
		},
		{
			heading: "Variables to validate",
			list: [
				"Actual cycle times versus nameplate ratings.",
				"Rewash and reject rates that steal effective capacity.",
				"Maintenance windows that remove machines from service.",
				"Staffing for sort, feed, and extract steps—not just wash aisles.",
			],
		},
		{
			heading: "Maintain for throughput",
			paragraphs: [
				"Preventive checks on bearings, steam traps, and chemical dosing protect the throughput you modeled. Schedule them in Opmaint alongside production calendars.",
			],
		},
	],
	"corrugated-box-yield-calculator": [
		{
			heading: "Box yield and material waste",
			paragraphs: [
				"Yield percentage compares good output to raw material input in corrugated and converting lines. Small yield losses compound into significant paper and adhesive cost across high-volume shifts.",
				"Use yield trends to justify knife changes, alignment work, or operator training before accepting higher scrap as normal.",
			],
		},
		{
			heading: "Drivers of low yield",
			list: [
				"Misalignment, worn tooling, and improper glue application.",
				"Moisture and warp issues from storage conditions.",
				"Setup scrap on frequent job changes.",
				"Unclear defect coding that hides recurring SKUs.",
			],
		},
		{
			heading: "Close the loop",
			paragraphs: [
				"Log defect reasons on work orders and tie PM tasks to the equipment stages that drive most scrap. Digital checklists help QA and maintenance share the same vocabulary.",
			],
		},
	],
	"cold-storage-energy-calculator": [
		{
			heading: "Energy cost in cold storage",
			paragraphs: [
				"Cold storage facilities spend a large share of operating budget on refrigeration, defrost cycles, and door losses. Estimating kWh and cost per pallet or cubic meter highlights which rooms or compressors deserve efficiency projects first.",
				"Compare results across seasons—ambient temperature swings often explain winter versus summer spikes better than production volume alone.",
			],
		},
		{
			heading: "Efficiency opportunities",
			list: [
				"Door seals, loading discipline, and strip-curtain maintenance.",
				"Condenser and evaporator cleaning on a fixed PM calendar.",
				"Setpoint reviews that avoid over-cooling low-turn inventory.",
				"Variable-speed drives and staging for multi-compressor plants.",
			],
		},
		{
			heading: "Monitor continuously",
			paragraphs: [
				"Pair energy estimates with temperature logs and maintenance history in Opmaint to catch drift before product integrity or utility bills spike.",
			],
		},
	],
	"car-wash-revenue-calculator": [
		{
			heading: "Modeling car wash revenue",
			paragraphs: [
				"Revenue projections combine cars per hour, average ticket, membership mix, and operating hours. Tunnel, in-bay, and self-serve sites each have different peak curves—model busy Saturdays separately from weekday baselines.",
				"Use the calculator when evaluating new packages, price increases, or extended hours, and sanity-check against POS data monthly.",
			],
		},
		{
			heading: "Levers that move revenue",
			list: [
				"Throughput losses from equipment downtime or staffing gaps.",
				"Upsell attachment on wash packages and add-on services.",
				"Membership churn and fleet contract renewals.",
				"Weather and seasonality in outdoor sites.",
			],
		},
		{
			heading: "Protect revenue with uptime",
			paragraphs: [
				"Revenue models assume equipment runs. Opmaint car wash checklists and work orders help teams keep tunnels, IBAs, and vacuums online during peak hours—where every missed car is lost margin.",
			],
		},
	],
};

const TOOL_FAQ: Record<string, ContentSection> = {
	"oee-calculator": {
		heading: "Common OEE questions",
		paragraphs: [
			"Plants often ask whether a single OEE number is enough for executive reporting. It is a useful headline metric, but the factor breakdown—availability, performance, and quality—should drive weekly improvement meetings. If quality is strong but availability lags, the fix is scheduling and PM, not more inspection at the end of the line.",
			"Another frequent question is how often to recalculate OEE. For bottleneck equipment, weekly or even daily snapshots during a improvement sprint are appropriate. For ancillary assets, monthly trending is usually sufficient as long as downtime and scrap are coded consistently in your CMMS.",
		],
	},
	"mttr-calculator": {
		heading: "Common MTTR questions",
		paragraphs: [
			"Teams sometimes confuse MTTR with total downtime. MTTR averages repair duration per event; total downtime also depends on how many failures occur. A low MTTR with frequent failures can still devastate output—pair this calculator with failure counts and MTBF for context.",
			"Should waiting for parts count in MTTR? Most reliability programs include diagnostic and repair time but exclude deliberate deferrals when the line is not needed. Document your definition so comparisons across sites stay fair.",
		],
	},
	"mtbf-calculator": {
		heading: "Common MTBF questions",
		paragraphs: [
			"MTBF works best on repairable assets with meaningful run time between failures. For disposable components or pure run-to-failure consumables, other indicators such as cost per unit or yield may be more actionable.",
			"When MTBF drops after a change—new vendor, faster line speed, or deferred PM—investigate before resetting targets. Short-term dips often reveal compatibility issues that a calculator alone will not explain.",
		],
	},
	"downtime-calculator": {
		heading: "Common downtime cost questions",
		paragraphs: [
			"Finance and operations may disagree on the right hourly downtime rate. Use fully loaded margin for bottleneck analysis and a conservative blended rate for portfolio views, but keep the same rate when comparing months.",
			"Include partial-hour events. A fifteen-minute jam on a high-speed filler can equal hours of loss on a slower downstream step if buffers are empty—capture the true production impact, not just clock time.",
		],
	},
	"roi-calculator": {
		heading: "Common ROI questions",
		paragraphs: [
			"Maintenance ROI is not only about new machines—it applies to CMMS rollouts, storeroom redesign, and training programs. Include soft benefits qualitatively if they cannot be quantified yet, but lead with hard savings leadership already trusts.",
			"Payback period and ROI percentage answer different questions. A project with modest ROI but sub-twelve-month payback may still win approval when cash is tight; use both outputs from this tool in your business case.",
		],
	},
	"unit-converter": {
		heading: "Conversion tips for technicians",
		paragraphs: [
			"When OEM manuals mix unit systems, convert setpoints once and post the plant-standard value on the asset tag. That reduces repeated math errors during night shifts.",
			"For energy projects, convert all meters to the same unit before comparing compressors, chillers, or dryers—mixed units are a common reason efficiency projects stall in review.",
		],
	},
	"laundry-throughput-calculator": {
		heading: "Throughput planning notes",
		paragraphs: [
			"Hospital and hotel laundries often peak on checkout days; industrial laundries peak on contract delivery windows. Model your worst day, not the annual average, when sizing equipment or overtime.",
			"Build maintenance blackouts into the model. A tunnel washer down for bearing service during a peak window can erase the margin from an entire week's volume.",
		],
	},
	"corrugated-box-yield-calculator": {
		heading: "Yield benchmarking",
		paragraphs: [
			"Compare yield by flute, customer, and shift—not only plant-wide averages. A single SKU with chronic warp can hide inside a healthy overall percentage.",
			"After mechanical improvements, recalculate yield weekly for a month to confirm the gain is sustained, not a short-term operator adjustment.",
		],
	},
	"cold-storage-energy-calculator": {
		heading: "Energy modeling notes",
		paragraphs: [
			"Door discipline and defrost strategy often beat capital projects for quick wins. Model baseline cost first, then simulate shorter hold-open times or night blinds before quoting new compressors.",
			"Track ambient temperature alongside kWh. A spike in energy without a weather correlate may indicate refrigerant loss or condenser fouling worth a work order.",
		],
	},
	"car-wash-revenue-calculator": {
		heading: "Revenue planning notes",
		paragraphs: [
			"Membership sites should model churn and redemption separately from retail tickets. A high car count with weak membership renewal still signals a revenue risk before equipment fails.",
			"After price changes, compare modeled revenue to POS for four full weeks—including two weekends—to catch mix shift between basic washes and premium packages.",
		],
	},
};

export function getToolEnrichment(slug: string): ContentSection[] {
	const sections = [...(TOOL_CONTENT[slug] ?? [])];
	const faq = TOOL_FAQ[slug];
	if (faq) sections.push(faq);
	return sections;
}
