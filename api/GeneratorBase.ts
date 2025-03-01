import { createFile } from "./mod.ts";

export abstract class GeneratorBase<IGenerator extends GeneratorBase<IGenerator>> {
    abstract data: Record<string, unknown>;

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
     * Utility to iterate over an iterable and call a callback with the generator and the value.
     */
    public iterate<T>(iteratable: Iterable<T>, callback: (generator: IGenerator, value: T) => void): this {
        for (const value of iteratable) {
            callback(this as unknown as IGenerator, value);
        }
        return this;
    }

    /**
     * Passes the generator to a callback function which can modify the generator.
     * - Useful for directly modifying the entire generator modularly.
     */
    public applyFunc(callback: (generator: IGenerator) => void): IGenerator {
        callback(this as unknown as IGenerator);
        return (this as unknown as IGenerator);
    }

    public toJson(): Record<string, unknown> {
        return this.data;
    }

    /**
     * Deep merges the source object into the target object at the specified path.
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
}

export abstract class GeneratorFactory<IBase extends GeneratorBase<IBase>> {
    protected filesToGenerate: Map<string, IBase> = new Map();
    private exportFolder: string;
    protected projectNamespace: string;

    constructor(projectNamespace: string, exportFolder: string) {
        this.projectNamespace = projectNamespace;
        this.exportFolder = exportFolder;
    }

    /**
     * Exports all of the generated files
     */
    public generate() {
        for (const [id, def] of this.filesToGenerate) {
            createFile(def.toJson(), `${this.exportFolder}/${id}.json`);
        }
    }
}