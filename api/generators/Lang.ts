import { GeneratorBase } from "../GeneratorBase.ts";
import { createFile, randomId } from "../mod.ts";
import { join } from "jsr:@std/path@1.0.8/join";
import { ensureDirSync, existsSync } from "jsr:@std/fs@1.0.13";

export class LangGenerator extends GeneratorBase<LangGenerator> {
    data: Record<string, string>;
    path: string;

    constructor(path: string = "RP/texts/en_US.lang") {
        super();
        this.data = {}
        this.path = path;
    }

    public override toJson(): Record<string, unknown> {
        throw new Error("LangGenerator does not support toJson(). Use generate() instead.");
    }

    public generate(): void {
        let output = "";
        for (const key in this.data) {
            output += `${key}=${this.data[key]}\n`;
        }
        createFile(output, `${this.path}.${randomId()}.chunk`);
    }

    public generateImmediately(): void {
        let existingContent = "";

        const existingFilePath = join(Deno.cwd(), this.path);
        console.log(`Generating lang file at ${existingFilePath}`);

        if (existsSync(existingFilePath)) {
            existingContent = Deno.readTextFileSync(existingFilePath);
        }

        const entries = existingContent.split("\n");
        for (const line of entries) {
            if (line.trim().length === 0) continue;
            const [key, value] = line.split("=");
            this.addLine(key, value);
        }

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