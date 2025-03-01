import { existsSync } from "jsr:@std/fs";
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

    constructor(projectNamespace: string) {
        super();
        this.projectNamespace = projectNamespace;

        this.data = {
            "format_version": "1.20.81",
            "sound_definitions": {}
        };
    }

    static fromFile(projectNamespace: string, path: string) {
        const content = Deno.readTextFileSync(path);
        const definitions = new SoundDefinitions(projectNamespace);
        definitions.data.sound_definitions = JSON.parse(content).sound_definitions;
        return definitions;
    }

    public generate() {
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