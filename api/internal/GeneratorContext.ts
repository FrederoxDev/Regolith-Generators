import { argv } from "node:process";
import { pathToFileURL } from "node:url";
let activeGeneratorEntryPoint: string | undefined;

export function getGeneratorEntryPoint(): string {
	return activeGeneratorEntryPoint ?? pathToFileURL(argv[1]).href;
}

export async function withGeneratorEntryPoint<T>(entryPoint: string, callback: () => Promise<T>): Promise<T> {
	if (activeGeneratorEntryPoint !== undefined) {
		throw new Error(`Cannot run generator "${entryPoint}" while "${activeGeneratorEntryPoint}" is active.`);
	}

	activeGeneratorEntryPoint = entryPoint;
	try {
		return await callback();
	} finally {
		activeGeneratorEntryPoint = undefined;
	}
}
