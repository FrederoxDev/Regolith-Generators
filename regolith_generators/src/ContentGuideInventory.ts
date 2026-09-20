import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export interface InventoryEntry {
	kind: "items" | "blocks" | "entities" | "sounds";
	identifier: string;
	name?: string;
	source: string;
}

async function readOptional(path: string): Promise<string | undefined> {
	try {
		return await readFile(path, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
		throw error;
	}
}

async function jsonFiles(directory: string): Promise<string[]> {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
	const files: string[] = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) files.push(...(await jsonFiles(path)));
		else if (entry.isFile() && entry.name.endsWith(".json")) files.push(path);
	}
	return files.sort();
}

export async function readContentGuideInventory(packDirectory: string): Promise<InventoryEntry[]> {
	const language = new Map<string, string>();
	const text = await readOptional(join(packDirectory, "RP", "texts", "en_US.lang"));
	for (const line of (text ?? "").split(/\r?\n/)) {
		const clean = line.split("##")[0]!.trim();
		const separator = clean.indexOf("=");
		if (separator > 0) language.set(clean.slice(0, separator).trim(), clean.slice(separator + 1).trim());
	}
	const inventory: InventoryEntry[] = [];
	const definitions = [
		{ kind: "items", directory: "items", key: "minecraft:item", translation: "item" },
		{ kind: "blocks", directory: "blocks", key: "minecraft:block", translation: "tile" },
		{ kind: "entities", directory: "entities", key: "minecraft:entity", translation: "entity" },
	] as const;
	for (const definition of definitions) {
		for (const path of await jsonFiles(join(packDirectory, "BP", definition.directory))) {
			const json = JSON.parse(await readFile(path, "utf8"));
			const asset = json[definition.key];
			const identifier = asset?.description?.identifier;
			if (typeof identifier !== "string") continue;
			const display = asset.components?.["minecraft:display_name"];
			const displayValue = typeof display === "string" ? display : display?.value;
			const name =
				(typeof displayValue === "string" ? language.get(displayValue) : undefined) ??
				language.get(`${definition.translation}.${identifier}.name`) ??
				language.get(`${definition.translation}.${identifier}`) ??
				(typeof displayValue === "string" && !/^(item|tile|entity)\./.test(displayValue)
					? displayValue
					: undefined);
			inventory.push({
				kind: definition.kind,
				identifier,
				name: name || undefined,
				source: relative(packDirectory, path).replaceAll("\\", "/"),
			});
		}
	}
	const soundPath = join(packDirectory, "RP", "sounds", "sound_definitions.json");
	const sounds = await readOptional(soundPath);
	if (sounds !== undefined) {
		for (const identifier of Object.keys(JSON.parse(sounds).sound_definitions ?? {})) {
			inventory.push({ kind: "sounds", identifier, source: "RP/sounds/sound_definitions.json" });
		}
	}
	return inventory.sort((a, b) => `${a.kind}:${a.identifier}`.localeCompare(`${b.kind}:${b.identifier}`));
}
