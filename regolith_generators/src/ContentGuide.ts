import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { readContentGuideInventory } from "./ContentGuideInventory.ts";
import type { ContentGuideChunk, ContentGuideEntry } from "../../api/generators/ContentGuideTypes.ts";

type GuideKind = ContentGuideEntry["kind"];
type Audience = "player-facing" | "non-player-facing" | "unclassified" | "all";
interface RenderEntry {
	kind: GuideKind;
	identifier: string;
	name?: string;
	description?: string;
	playerFacing?: boolean;
}

export function readContentGuideOutput(raw: string | undefined, root: string): string | undefined {
	if (raw === undefined) return undefined;
	const settings = JSON.parse(raw);
	if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
		throw new Error("Regolith Generators settings must be a JSON object.");
	}
	if (settings.content_guide_output === undefined) return undefined;
	const output = settings.content_guide_output;
	if (typeof output !== "string" || !output.trim() || isAbsolute(output) || !/\.(md|pdf)$/i.test(output)) {
		throw new Error("content_guide_output must be a non-empty project-relative .md or .pdf path.");
	}
	const target = resolve(root, output);
	const rel = relative(root, target);
	if (rel === ".." || rel.startsWith("../") || rel.startsWith("..\\") || isAbsolute(rel)) {
		throw new Error("content_guide_output must stay inside the project.");
	}
	const firstDirectory = rel.replaceAll("\\", "/").split("/")[0]!.toLowerCase();
	if (["packs", "bp", "rp", ".regolith"].includes(firstDirectory)) {
		throw new Error("content_guide_output must be outside source packs and Regolith staging.");
	}
	return target;
}

function validateEntry(entry: ContentGuideEntry, source: string): void {
	if (
		!entry ||
		!["items", "blocks", "entities", "entity-group", "sounds"].includes(entry.kind) ||
		typeof entry.identifier !== "string" ||
		!entry.identifier.trim()
	) {
		throw new Error(`Invalid content guide entry in ${source}.`);
	}
	if (entry.name !== undefined && (typeof entry.name !== "string" || !entry.name.trim())) {
		throw new Error(`Invalid content guide name for ${entry.identifier} in ${source}.`);
	}
	if (entry.kind === "sounds") {
		if (!entry.name) throw new Error(`Missing sound name for ${entry.identifier} in ${source}.`);
	} else if (
		typeof entry.description !== "string" ||
		!entry.description.trim() ||
		typeof entry.playerFacing !== "boolean"
	) {
		throw new Error(`Content guide entry ${entry.identifier} in ${source} requires description and playerFacing.`);
	}
}

function sameEntry(a: ContentGuideEntry, b: ContentGuideEntry): boolean {
	return (
		a.kind === b.kind &&
		a.identifier === b.identifier &&
		a.name === b.name &&
		((a.kind === "sounds" && b.kind === "sounds") ||
			(a.kind !== "sounds" &&
				b.kind !== "sounds" &&
				a.description === b.description &&
				a.playerFacing === b.playerFacing))
	);
}

function escapeText(value: string): string {
	return value.replace(/[\\`*_{}\[\]<>#!|]/g, "\\$&").replace(/[\r\n]+/g, " ");
}

function renderEntries(
	entries: RenderEntry[],
	kind: GuideKind,
	audience: Audience,
	groups: Map<string, string[]>,
): string {
	const selected = entries.filter(
		(entry) =>
			(entry.kind === kind || (kind === "entities" && entry.kind === "entity-group")) &&
			(entry.kind === "sounds" ||
				audience === "all" ||
				(audience === "unclassified"
					? entry.playerFacing === undefined
					: entry.playerFacing === (audience === "player-facing"))),
	);
	if (selected.length === 0) return "n/a";
	return selected
		.map((entry) => {
			const title = entry.name
				? `${escapeText(entry.name)} (${escapeText(entry.identifier)})`
				: escapeText(entry.identifier);
			if (entry.kind === "sounds") return `- ${title}`;
			const description = entry.description ? `${title} - ${entry.description}` : title;
			if (entry.kind !== "entity-group") return description;
			const identifiers = groups.get(entry.identifier)!;
			return `${description}\n\n<details>\n<summary>Entity IDs (${identifiers.length})</summary>\n\n${identifiers.map((id) => `- ${escapeText(id)}`).join("\n")}\n\n</details>`;
		})
		.join("\n\n");
}

export async function assembleContentGuide(
	chunkDirectory: string,
	templatePath: string,
	outputPath: string,
	packDirectory: string,
): Promise<void> {
	const merged = new Map<string, { entry: ContentGuideEntry; source: string }>();
	for (const filename of (await readdir(chunkDirectory)).filter((name) => name.endsWith(".chunk.json")).sort()) {
		const chunk: ContentGuideChunk = JSON.parse(await readFile(join(chunkDirectory, filename), "utf8"));
		if (!chunk || typeof chunk.source !== "string" || !Array.isArray(chunk.entries)) {
			throw new Error(`Invalid content guide chunk ${filename}.`);
		}
		for (const entry of chunk.entries) {
			validateEntry(entry, chunk.source);
			const key = `${entry.kind}:${entry.identifier}`;
			const previous = merged.get(key);
			if (previous && !sameEntry(previous.entry, entry)) {
				throw new Error(`Conflicting content guide entry ${key} from ${previous.source} and ${chunk.source}.`);
			}
			merged.set(key, { entry, source: chunk.source });
		}
	}
	const inventory = await readContentGuideInventory(packDirectory);
	const groups = new Map<string, string[]>();
	const groupEntries = [...merged.values()].filter(({ entry }) => entry.kind === "entity-group");
	const patterns = groupEntries.map(({ entry, source }) => ({
		entry,
		source,
		pattern: new RegExp("^" + entry.identifier.split("*").map(escapeRegex).join(".*") + "$"),
	}));
	for (const { entry } of patterns) groups.set(entry.identifier, []);
	const documentedEntries: RenderEntry[] = [];
	const issues: string[] = [];
	const present = new Set<string>();
	const matchedGroups = new Set<string>();
	for (const asset of inventory) {
		const key = `${asset.kind}:${asset.identifier}`;
		present.add(key);
		const explicit = merged.get(key)?.entry;
		const matches =
			asset.kind === "entities" ? patterns.filter(({ pattern }) => pattern.test(asset.identifier)) : [];
		for (const { entry } of matches) matchedGroups.add(entry.identifier);
		if (!explicit && matches.length > 1) {
			throw new Error(
				`Entity ${asset.identifier} matches multiple guide groups: ${matches.map(({ entry, source }) => `${entry.identifier} (${source})`).join(", ")}`,
			);
		}
		if (!explicit && matches.length === 1) {
			groups.get(matches[0]!.entry.identifier)!.push(asset.identifier);
			continue;
		}
		const resolved: RenderEntry = { ...asset, ...explicit, name: explicit?.name ?? asset.name };
		documentedEntries.push(resolved);
		const missing: string[] = [];
		if (asset.kind !== "sounds") {
			if (!resolved.description) missing.push("description");
			if (resolved.playerFacing === undefined) missing.push("player-facing classification");
			if (!resolved.name) missing.push("display name");
		}
		if (missing.length) {
			issues.push(
				`- ${escapeText(asset.identifier)} (${asset.kind}) - Missing ${missing.join(", ")}. File: ${escapeText(asset.source)}`,
			);
		}
	}
	for (const { entry } of groupEntries) {
		if (groups.get(entry.identifier)!.length) documentedEntries.push(entry);
	}
	documentedEntries.sort((a, b) => a.identifier.localeCompare(b.identifier));
	const stale = [...merged.values()].filter(({ entry }) =>
		entry.kind === "entity-group"
			? !matchedGroups.has(entry.identifier)
			: !present.has(`${entry.kind}:${entry.identifier}`),
	);
	const report =
		[
			"# Undocumented Content",
			"## Missing Documentation",
			issues.length ? issues.join("\n") : "n/a",
			"## Documentation Without Matching Content",
			stale.length
				? stale
						.map(
							({ entry, source }) =>
								`- ${escapeText(entry.identifier)} (${entry.kind}) - Source: ${escapeText(source)}`,
						)
						.join("\n")
				: "n/a",
		].join("\n\n") + "\n";
	const template = await readFile(templatePath, "utf8");
	const renderedSections = new Set<string>();
	let rendered = template
		.split(/\r?\n/)
		.map((line, index) => {
			if (!/^\s*<!--\s*guide:/.test(line)) return line;
			const match =
				/^\s*<!--\s*guide:(items|blocks|entities):(player-facing|non-player-facing|unclassified|all)\s*-->\s*$/.exec(
					line,
				);
			if (match) {
				renderedSections.add(`${match[1]}:${match[2]}`);
				return renderEntries(documentedEntries, match[1] as GuideKind, match[2] as Audience, groups);
			}
			if (/^\s*<!--\s*guide:sounds\s*-->\s*$/.test(line)) {
				renderedSections.add("sounds:all");
				return renderEntries(documentedEntries, "sounds", "all", groups);
			}
			throw new Error(`Unknown content guide directive at ${templatePath}:${index + 1}: ${line}`);
		})
		.join("\n");
	for (const kind of ["items", "blocks", "entities", "sounds"] as const) {
		if (renderedSections.has(`${kind}:all`)) continue;
		const audiences: Audience[] =
			kind === "sounds" ? ["all"] : ["player-facing", "non-player-facing", "unclassified"];
		for (const audience of audiences) {
			if (renderedSections.has(`${kind}:${audience}`)) continue;
			const section = renderEntries(documentedEntries, kind, audience, groups);
			const labels: Record<Audience, string> = {
				all: "",
				unclassified: "Unclassified ",
				"player-facing": "Player Facing ",
				"non-player-facing": "Non Player Facing ",
			};
			if (section !== "n/a")
				rendered += `\n\n## ${labels[audience]}${kind[0]!.toUpperCase()}${kind.slice(1)}\n\n${section}`;
		}
	}
	const reportPath = outputPath.replace(/\.(md|pdf)$/i, "-undocumented.md");
	await mkdir(dirname(outputPath), { recursive: true });
	const pendingPath = `${outputPath}.tmp`;
	const pendingReport = `${reportPath}.tmp`;
	try {
		if (outputPath.toLowerCase().endsWith(".pdf")) {
			const { writeContentGuidePdf } = await import("./ContentGuidePdf.ts");
			await writeContentGuidePdf(rendered, pendingPath, templatePath);
		} else {
			await writeFile(pendingPath, rendered, "utf8");
		}
		await writeFile(pendingReport, report, "utf8");
		await rename(pendingPath, outputPath);
		await rename(pendingReport, reportPath);
	} finally {
		await rm(pendingPath, { force: true });
		await rm(pendingReport, { force: true });
	}
	console.log(
		`[regolith_generators] Wrote content guide ${outputPath} and report ${reportPath} (${issues.length} incomplete entries, ${stale.length} unmatched entries).`,
	);
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
