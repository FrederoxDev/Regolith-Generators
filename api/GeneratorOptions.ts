import type { LangGenerator } from "./generators/Lang.ts";
import type { ContentGuideGenerator } from "./generators/ContentGuide.ts";

export interface GeneratorOptions {
	langGenerator?: LangGenerator;
	guideGenerator?: ContentGuideGenerator;
}
