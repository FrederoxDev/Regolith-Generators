import type { GeneratorOptions } from "../GeneratorOptions.ts";
import type { ContentGuideSoundDetails } from "./ContentGuide.ts";
import { existsSync } from "jsr:@std/fs@1.0.6";
import { GeneratorBase } from "../GeneratorBase.ts";

export enum SoundCategory {
    Ambient = "ambient",
    Block = "block",
    Bottle = "bottle",
    Bucket = "bucket",
    Hostile = "hostile",
    Music = "music",
    Neutral = "neutral",
    Player = "player",
    Record = "record",
    Ui = "ui",
    Weather = "weather"
}

export class SoundDefinitions extends GeneratorBase<SoundDefinitions> {
    data: Record<string, unknown>;
    projectNamespace: string;

    constructor(projectNamespace: string, private readonly options: GeneratorOptions = {}) {
        super();
        this.projectNamespace = projectNamespace;

        this.data = {
            "format_version": "1.26.40",
            "sound_definitions": {}
        };
    }

    static fromFile(projectNamespace: string, path: string, options: GeneratorOptions = {}): SoundDefinitions {
        const content = Deno.readTextFileSync(path);
        const definitions = new SoundDefinitions(projectNamespace, options);
        definitions.data.sound_definitions = JSON.parse(content).sound_definitions;
        return definitions;
    }

    private readonly guideDetails = new Map<string, ContentGuideSoundDetails>();

    public addContentGuide(id: string, details: ContentGuideSoundDetails): this {
        if (!this.options.guideGenerator) throw new Error("SoundDefinitions requires guideGenerator to add content guide entries.");
        this.guideDetails.set(`${this.projectNamespace}:${id}`, { ...details });
        return this;
    }

    public generate(): void {
        for (const [identifier, details] of this.guideDetails) {
            if (!this.getValueAtPath(`sound_definitions/${identifier}`, undefined)) {
                throw new Error(`Content guide references undefined sound "${identifier}".`);
            }
            this.options.guideGenerator!.addSound(identifier, details);
        }
        existsSync("RP/sounds") || Deno.mkdirSync("RP/sounds", { recursive: true });
        Deno.writeTextFileSync("RP/sounds/sound_definitions.json", JSON.stringify(this.data, null, 4));
    }

    addBasicSound(id: string, category: SoundCategory, path: string[]): SoundDefinitions;
    addBasicSound(id: string, category: SoundCategory, path: string): SoundDefinitions;
    addBasicSound(id: string, category: SoundCategory, path: string | string[]): SoundDefinitions {
        const key = `sound_definitions/${this.projectNamespace}:${id}`;

        if (!Array.isArray(path)) this.setValueAtPath(key, {
            "category": category,
            "sounds": [ path ]
        })
        else this.setValueAtPath(key, {
            "category": category,
            "sounds": path
        });

        return this;
    }
}