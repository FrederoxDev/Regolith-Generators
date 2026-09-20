export interface ContentGuideAssetDetails {
	name?: string;
	description: string;
	playerFacing: boolean;
}

export interface ContentGuideSoundDetails {
	name: string;
}

export type ContentGuideEntry =
	| ({ kind: "items" | "blocks" | "entities" | "entity-group"; identifier: string } & ContentGuideAssetDetails)
	| ({ kind: "sounds"; identifier: string } & ContentGuideSoundDetails);

export interface ContentGuideChunk {
	source: string;
	entries: ContentGuideEntry[];
}
