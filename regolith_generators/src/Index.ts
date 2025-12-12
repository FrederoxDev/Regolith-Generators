import { join } from "jsr:@std/path";
import { walkSync } from "jsr:@std/fs";

const ROOT_DIR = Deno.env.get("ROOT_DIR")!;

const DIRECTORIES = [
    join(Deno.cwd(), "BP"),
    join(Deno.cwd(), "RP"),
    join(Deno.cwd(), "data", "generated"),
]

const denoConfigPath = join(ROOT_DIR, "packs", "data", "generated", "deno.json");
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

    const process = new Deno.Command("deno", {
        args: ["run", "--config", denoConfigPath, "--unstable-sloppy-imports", "--allow-all", filePath],
        stdout: "inherit",
        stdin: "inherit",
        cwd: join(ROOT_DIR, "packs")
    }).spawn();

    const status = await process.status;

    if (!status.success) {
        console.error(`❌ Failed to run: ${filePath}`)
    }
}

await Promise.all(tsFiles.map(runScript));

await Promise.all(tsFiles.map((path) => {
    Deno.remove(path)
}));

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