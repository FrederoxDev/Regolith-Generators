import { toFileUrl } from "jsr:@std/path";
import { withGeneratorEntryPoint } from "../../api/internal/GeneratorContext.ts";

for (const filePath of Deno.args) {
    const moduleUrl = toFileUrl(filePath).href;
    try {
        await withGeneratorEntryPoint(moduleUrl, () => import(moduleUrl));
    } catch (error) {
        throw new Error(`Generator failed: ${filePath}`, { cause: error });
    }
}
