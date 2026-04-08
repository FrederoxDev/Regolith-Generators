import { join } from "jsr:@std/path";
import { walkSync } from "jsr:@std/fs";

const start = performance.now();
const ROOT_DIR = Deno.env.get("ROOT_DIR")!;

const DIRECTORIES = [
    join(Deno.cwd(), "BP"),
    join(Deno.cwd(), "RP"),
    join(Deno.cwd(), "data", "generated"),
]

const bpScriptsDir = join(Deno.cwd(), "BP", "scripts");
const regolithTmp = join(Deno.env.get("ROOT_DIR")!, ".regolith/tmp/");

const tsFiles: string[] = [];

for (const dir of DIRECTORIES) {
    for (const entry of walkSync(dir, { exts: [".ts", ".tsx"], includeFiles: true, skip: [bpScriptsDir] })) {
        tsFiles.push(entry.path);
    }
}

async function runScript(filePath: string) {
    const content = await Deno.readTextFile(filePath);
    if (content.startsWith("// @generator-skip")) {
        return;
    }

    try {
        await import(`file:///${filePath.replaceAll("\\", "/")}`);
    } catch (e) {
        console.error(`❌ Failed to run: ${filePath}`, e);
    }

    Deno.remove(filePath);
}

// Pre-warm shared modules so generators don't each pay the compile cost
await import("Regolith-Generators");

await Promise.all(tsFiles.map(runScript));

// Merge lang file chunks into single lang files
const languageChunksDir = join(regolithTmp, "RP", "texts");

// language : (key : value)
const allLangKeys: Record<string, Record<string, string>> = {};

for (const entry of walkSync(languageChunksDir, { exts: [".lang", ".chunk"], includeFiles: true })) {
    if (!entry.isFile) continue;
    const langCode = entry.name.split(".")[0];

    if (!(langCode in allLangKeys)) {
        allLangKeys[langCode] = {};
    }

    const lines = (await Deno.readTextFile(entry.path)).split("\n");
    for (const line of lines) {
        if (line.startsWith("#") || line.trim() === "") continue;

        const [key, value] = line.split("=");
        allLangKeys[langCode][key] = value;
    }

    Deno.remove(entry.path);
}

for (const [langCode, entries] of Object.entries(allLangKeys)) {
    const langFilePath = join(languageChunksDir, `${langCode}.lang`);
    const lines: string[] = [];
    for (const [key, value] of Object.entries(entries)) {
        lines.push(`${key}=${value}`);
    }
    await Deno.writeTextFile(langFilePath, lines.join("\n"));
}

const end = performance.now();
console.log(`\x1b[38;2;226;158;80m[Regolith-Generators]\x1b[0m Ran ${tsFiles.length} generators in ${(end - start).toFixed(2)}ms`);
