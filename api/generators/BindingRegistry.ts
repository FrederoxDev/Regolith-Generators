import { createFile } from "../mod.ts";

/**
 * Allocates named bindings → collection indices and writes a JSON file scripts can load.
 *
 * Used to keep script-side binding values in sync with UI-side `collection_index` slots.
 * - `register(name)` returns an integer index; the same name returns the same index.
 * - `export(path?)` writes a JSON file at `data/scripts/src/_generated/<name>.json` by default.
 *
 * The generated JSON has the shape `{ names: string[], indices: Record<string, number> }`.
 * Scripts import it via esbuild's JSON loader and pass it to `registerBindingsLayer`
 */
export class BindingRegistry {
    private readonly bindings: string[] = [];

    constructor(public readonly name: string) {}

    register(bindingName: string): number {
        const existing = this.bindings.indexOf(bindingName);
        if (existing !== -1) return existing;
        this.bindings.push(bindingName);
        return this.bindings.length - 1;
    }

    export(path?: string): void {
        const indices: Record<string, number> = {};
        this.bindings.forEach((name, idx) => {
            indices[name] = idx;
        });
        const json = {
            names: this.bindings,
            indices,
        };
        const outputPath = path ?? `data/scripts/src/_generated/${this.name}.json`;
        createFile(JSON.stringify(json, undefined, 4), outputPath);
    }
}
