import { readdirSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = process.env.ROOT_DIR;
if (!ROOT_DIR) throw new Error("Regolith did not provide ROOT_DIR.");

const DIRECTORIES = [
    join(process.cwd(), "BP"),
    join(process.cwd(), "RP"),
    join(process.cwd(), "data", "generated"),
];

const denoConfigPath = join(ROOT_DIR, "packs", "data", "generated", "deno.json");
const runnerPath = join(dirname(fileURLToPath(import.meta.url)), "Runner.ts");
const bpScriptsDirectory = join(process.cwd(), "BP", "scripts").toLowerCase();

function collectGeneratorFiles(root: string): string[] {
    const files: string[] = [];
    const visit = (directory: string): void => {
        if (directory.toLowerCase() === bpScriptsDirectory) return;
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) visit(path);
            else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) files.push(path);
        }
    };
    visit(root);
    return files;
}

async function runScripts(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return;
    const process = Bun.spawn([
        "deno",
        "run",
        "--cached-only",
        "--config",
        denoConfigPath,
        "--unstable-sloppy-imports",
        "--allow-all",
        runnerPath,
        ...filePaths,
    ], {
        cwd: join(ROOT_DIR, "packs"),
        env: { ...globalThis.process.env, DENO_NO_UPDATE_CHECK: "1" },
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
    });

    if (await process.exited !== 0) throw new Error("Failed to run generator scripts from cache.");
}

const tsFiles = DIRECTORIES.flatMap(collectGeneratorFiles).sort();
const runnableFiles = (
    await Promise.all(tsFiles.map(async (filePath) => {
        const content = await readFile(filePath, "utf8");
        return content.startsWith("// @generator-skip") ? undefined : filePath;
    }))
).filter((filePath): filePath is string => filePath !== undefined);

await runScripts(runnableFiles);
await Promise.all(tsFiles.map((path) => rm(path)));

const languageChunksDirectory = join(ROOT_DIR, ".regolith", "tmp", "RP", "texts");
const languageFiles = readdirSync(languageChunksDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (entry.name.endsWith(".lang") || entry.name.endsWith(".chunk")))
    .map((entry) => join(languageChunksDirectory, entry.name))
    .sort();
const allLanguageKeys = new Map<string, Map<string, string>>();

for (const path of languageFiles) {
    const languageCode = basename(path).split(".")[0]!;
    const entries = allLanguageKeys.get(languageCode) ?? new Map<string, string>();
    for (const line of (await readFile(path, "utf8")).split("\n")) {
        if (line.startsWith("#") || line.trim() === "") continue;
        const [key, ...value] = line.split("=");
        entries.set(key!, value.join("="));
    }
    allLanguageKeys.set(languageCode, entries);
}

await Promise.all(languageFiles.map((path) => rm(path)));
await Promise.all([...allLanguageKeys].map(([languageCode, entries]) =>
    writeFile(
        join(languageChunksDirectory, `${languageCode}.lang`),
        [...entries].map(([key, value]) => `${key}=${value}`).join("\n"),
    )
));
