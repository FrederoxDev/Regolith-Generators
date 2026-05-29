import { createFile } from "./FileIO.ts";

export abstract class GeneratorBase<IGenerator extends GeneratorBase<IGenerator>> {
    /**
     * The JSON-like object this generator is building.
     *
     * Concrete generators initialize this with the root shape for their output
     * file, component collection, or UI control.
     */
    abstract data: Record<string, unknown>;

    /**
     * Writes a value into the generator data using a slash-separated path.
     *
     * Missing parent objects are created automatically. Paths are relative to
     * this generator's `data` object, so a block component builder can write
     * `minecraft:geometry`, while a full block definition writes
     * `minecraft:block/components/minecraft:geometry`.
     *
     * @example
     * ```ts
     * generator.setValueAtPath("minecraft:block/description/identifier", "demo:stone");
     * ```
     */
    public setValueAtPath(path: string, value: unknown) {
        const pathArray = path.split('/');
        let current = this.data;

        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }

            current = current[pathArray[i]] as Record<string, unknown>;
        }

        current[pathArray[pathArray.length - 1]] = value;
    }

    /**
     * Reads a value from the generator data using a slash-separated path.
     *
     * Returns `defaultValue` if any path segment is missing. The generic type
     * only describes the expected shape for TypeScript; this method does not
     * validate the stored value at runtime.
     *
     * @example
     * ```ts
     * const components = generator.getValueAtPath<Record<string, unknown>>("minecraft:block/components", {});
     * ```
     */
    public getValueAtPath<T>(path: string, defaultValue: T): T {
        const pathArray = path.split('/');
        let current = this.data;

        for (let i = 0; i < pathArray.length; i++) {
            if (!current[pathArray[i]]) {
                return defaultValue;
            }
            current = current[pathArray[i]] as Record<string, unknown>;
        }

        return current as unknown as T;
    }

    /**
     * Calls a callback for every value in an iterable while preserving chaining.
     *
     * This is useful when a fluent generator needs to create repeated JSON
     * entries without breaking out of the chain.
     *
     * @example
     * ```ts
     * new BlockComponents()
     *     .iterate(["a", "b"], (components, value) => components.addTag(`demo:${value}`))
     *     .addLoot("loot_tables/blocks/demo.json");
     * ```
     */
    public iterate<T>(iteratable: Iterable<T>, callback: (generator: IGenerator, value: T) => void): this {
        for (const value of iteratable) {
            callback(this as unknown as IGenerator, value);
        }
        return this;
    }

    /**
     * Passes this generator to a callback and returns the generator.
     *
     * Use this to package reusable mutations without creating a new subclass
     * or helper method on the generator itself.
     *
     * @example
     * ```ts
     * const makeImmovable = (components: BlockComponents) => {
     *     components.addDestructibleByExplosion(false);
     * };
     *
     * new BlockComponents().applyFunc(makeImmovable);
     * ```
     */
    public applyFunc(callback: (generator: IGenerator) => void): IGenerator {
        callback(this as unknown as IGenerator);
        return (this as unknown as IGenerator);
    }

    /**
     * Returns the generated JSON object without serializing it.
     *
     * The returned value is the generator's internal data object, so callers
     * should treat it as mutable generator state rather than a defensive copy.
     */
    public toJson(): Record<string, unknown> {
        return this.data;
    }

    /**
     * Serializes the generated data as compact JSON.
     *
     * Factories use this when writing generated files.
     */
    public toString(): string {
        return JSON.stringify(this.data);
    }

    /**
     * Deep merges an object into the target object at a slash-separated path.
     *
     * Nested objects are merged recursively. Arrays are appended, and primitive
     * values overwrite existing values.
     */
    protected deepMerge(path: string, source: Record<string, unknown>) {
        const target = this.getValueAtPath<Record<string, unknown>>(path, {});

        for (const key in source) {
            if (source[key] instanceof Array) {
                if (!target[key]) {
                    target[key] = [];
                }
                (target[key] as Array<unknown>).push(...(source[key] as Array<unknown>));
            } else if (source[key] instanceof Object) {
                if (!target[key]) {
                    target[key] = {};
                }
                this.deepMerge(`${path}/${key}`, source[key] as Record<string, unknown>);
            } else {
                target[key] = source[key];
            }
        }
        this.setValueAtPath(path, target);
    }

    /**
     * Conditionally applies a mutation while preserving fluent chains.
     *
     * @example
     * ```ts
     * new BlockComponents()
     *     .if(includeLoot, (components) => components.addLoot("loot_tables/blocks/demo.json"));
     * ```
     */
    public if(condition: boolean, callback: (generator: IGenerator) => void): this {
        if (condition) {
            callback(this as unknown as IGenerator);
        }
        return this;
    }
}

export abstract class GeneratorFactory<IBase extends GeneratorBase<IBase>> {
    protected filesToGenerate: Map<string, IBase> = new Map();
    protected exportFolder: string;
    protected projectNamespace: string;

    /**
     * Creates a generator factory for one output folder.
     *
     * @param projectNamespace Namespace prepended by concrete generators when
     * building identifiers.
     * @param exportFolder Folder inside the Regolith temporary pack output
     * where generated files should be written.
     */
    constructor(projectNamespace: string, exportFolder: string) {
        this.projectNamespace = projectNamespace;
        this.exportFolder = exportFolder;
    }

    /**
     * Exports all files queued in this factory to the Regolith temporary pack.
     *
     * Concrete factories usually queue files through methods such as
     * `makeBlock`, `makeItem`, or `makeEntity`.
     */
    public generate() {
        for (const [id, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${id}.json`);
        }
    }
}
