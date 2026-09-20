import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { assembleContentGuide, readContentGuideOutput } from "./ContentGuide.ts";

const root = process.env.ROOT_DIR;
if (!root) throw new Error("Regolith did not provide ROOT_DIR.");
const directory = join(root, ".regolith", "tmp", "content_guide");
try {
	const output = readContentGuideOutput(process.argv[2], root);
	if (output) {
		await mkdir(directory, { recursive: true });
		await assembleContentGuide(
			directory,
			join(process.cwd(), "data", "guide", "template.md"),
			output,
			process.cwd(),
		);
	}
} finally {
	await rm(directory, { recursive: true, force: true });
}
