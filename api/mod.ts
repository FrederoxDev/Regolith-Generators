import { basename, dirname, extname, join } from "jsr:@std/path@^1.0.8";

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