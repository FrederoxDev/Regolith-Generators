import { existsSync } from "jsr:@std/fs@1.0.6/exists";
import { GeneratorBase } from "../GeneratorBase.ts";
import { createFile, readTextFile } from "../mod.ts";

export class LangGenerator extends GeneratorBase<LangGenerator> {
    data: Record<string, string>;
    path: string;

    constructor(path: string = "RP/texts/en_US.lang") {
        super();
        this.data = {}
        this.path = path;

        if (existsSync(path)) {
            const existing = LangGenerator.fromFile(path);
            this.data = existing;
        }
    }

    private static fromFile(path: string): Record<string, string> {
        const content = readTextFile(path);
        const definitions: Record<string, string> = {};
        
        // original is stored as key=value\n
        const lines = content.split("\n");
        for (const line of lines) {
            if (line.startsWith("#") || line.trim() === "") continue; // skip comments and empty lines
            const [key, ...rest] = line.split("=");
            definitions[key] = rest.join("=");
        }
    
        return definitions;
    }

    public override toJson(): Record<string, unknown> {
        throw new Error("LangGenerator does not support toJson(). Use generate() instead.");
    }

    public generate(): void {
        let output = "";
        for (const key in this.data) {
            output += `${key}=${this.data[key]}\n`;
        }
        createFile(output, this.path);
    }

    addLine(key: string, value: string): this {
        this.data[key] = value;
        return this;
    }
}

/**
 * Returns the input string converted to Title Case with underscores replaced by spaces.
 * @param str The string to convert
 * @returns The converted string
 */
export function ToTitleCase(str: string): string {
    str = str.replace(/_/g, ' ');
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}