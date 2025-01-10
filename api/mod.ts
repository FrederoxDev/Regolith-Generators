import { basename, dirname, extname, join } from "jsr:@std/path@^1.0.8";
export * from "./generators/Block.ts";
export * from "./generators/ServerEntity.ts";
export * from "./generators/ClientEntity.ts";
export * from "./generators/Item.ts";
export * from "./common/OreSet.ts";

/**
 * Simple wrapper to writing files in the regolith temp directory
 * @param content What the file contains
 * @param path Where to save the file, if left blank it will use the same name as location as the script running it.
 */
export function createFile(content: string | object, path: string | undefined = undefined) {
    let output: string | undefined = undefined;
    
    if (typeof content === "string") {
        output = content;
    }
    else {
        output = JSON.stringify(content);
    }

    let outputPath = path;

    if (outputPath === undefined) {
        const entryPoint = Deno.mainModule.replace("file:///", "");
        const baseName = basename(entryPoint, extname(entryPoint));
        const relativePath = dirname(entryPoint.split("/.regolith/tmp/")[1]);
        outputPath = join(Deno.cwd(), "../.regolith/tmp/", relativePath, baseName + ".json");
    }
    else {
        outputPath = join(Deno.cwd(), "../.regolith/tmp/", outputPath);
    }

    const outputDir = dirname(outputPath);
    Deno.mkdirSync(outputDir, { recursive: true });
    Deno.writeTextFileSync(outputPath, output, { create: true });
}
