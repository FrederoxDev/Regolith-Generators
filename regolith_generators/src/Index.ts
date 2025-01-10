import { join } from "jsr:@std/path";
import { walkSync } from "jsr:@std/fs";

const ROOT_DIR = Deno.env.get("ROOT_DIR")!;

const DIRECTORIES = [
    join(Deno.cwd(), "BP"),
    join(Deno.cwd(), "RP"),
    join(Deno.cwd(), "data", "generated"),

]

const denoConfigPath = join(ROOT_DIR, "deno.json");

const tsFiles: string[] = [];

for (const dir of DIRECTORIES) {
    for (const entry of walkSync(dir, { exts: [".ts"], includeFiles: true })) {
        tsFiles.push(entry.path);
    }
}

async function runScript(filePath: string) {
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
await Promise.all(tsFiles.map((path) => Deno.remove(path)));