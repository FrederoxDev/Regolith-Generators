import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "node:process";
import { randomUUID } from "node:crypto";
import { getGeneratorEntryPoint } from "../internal/GeneratorContext.ts";

import type {
	ContentGuideAssetDetails,
	ContentGuideSoundDetails,
	ContentGuideEntry,
	ContentGuideChunk,
} from "./ContentGuideTypes.ts";
export type { ContentGuideAssetDetails, ContentGuideSoundDetails } from "./ContentGuideTypes.ts";

/** Collects documentation separately from Minecraft definitions. */
export class ContentGuideGenerator {
	private readonly directory = env.ROOT_DIR ? join(env.ROOT_DIR, ".regolith", "tmp", "content_guide") : undefined;

	public constructor(private readonly source: string = getGeneratorEntryPoint()) {}
	private entries: ContentGuideEntry[] = [];

	public addItem(identifier: string, details: ContentGuideAssetDetails): this {
		return this.add({ ...details, kind: "items", identifier });
	}

	public addBlock(identifier: string, details: ContentGuideAssetDetails): this {
		return this.add({ ...details, kind: "blocks", identifier });
	}

	public addEntity(identifier: string, details: ContentGuideAssetDetails): this {
		return this.add({ ...details, kind: "entities", identifier });
	}

	public addEntityGroup(pattern: string, details: ContentGuideAssetDetails): this {
		return this.add({ ...details, kind: "entity-group", identifier: pattern });
	}

	public addSound(identifier: string, details: ContentGuideSoundDetails): this {
		return this.add({ ...details, kind: "sounds", identifier });
	}

	private add(entry: ContentGuideEntry): this {
		this.entries.push(entry);
		return this;
	}

	public generate(): void {
		if (this.entries.length === 0) return;
		if (!this.directory) throw new Error("Regolith did not provide ROOT_DIR.");
		mkdirSync(this.directory, { recursive: true });
		const chunk: ContentGuideChunk = { source: this.source, entries: this.entries };
		writeFileSync(join(this.directory, `${randomUUID()}.chunk.json`), JSON.stringify(chunk));
		this.entries = [];
	}
}
