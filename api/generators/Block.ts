import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";

export class BlockGenerator extends GeneratorFactory<BlockDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/blocks");
    }

    makeBlock(id: string): BlockDef {
        const def = new BlockDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export class BlockDef extends GeneratorBase<BlockDef> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.20.81",
            "minecraft:block": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`,
                    "menu_category": {
                        "category": "items"
                    }
                },
                "components": {}
            }
        }
    }

    addState(state: string, value: string[] | number[] | boolean[]): BlockDef {
        this.setValueAtPath(`minecraft:block/description/states/${state}`, value);
        return this;
    }

    /**
     * Allows the block to be rotated in 90 degree increments
     */
    addBasicRotation() {
        const enabledStatesPath = "minecraft:block/description/traits/minecraft:placement_direction/enabled_states";
        const enabledStates = this.getValueAtPath<string[]>(enabledStatesPath, []);
        enabledStates.push("minecraft:cardinal_direction");
        this.setValueAtPath(enabledStatesPath, enabledStates);

        const permutations = this.getValueAtPath<unknown[]>("minecraft:block/permutations", []);
        const values = [["east", 90], ["north", 180], ["west", 270]];

        for (const [state, rotation] of values) {
            permutations.push({
                "condition": `query.block_state('minecraft:cardinal_direction') == '${state}'`,
                "components": {
                    "minecraft:transformation": {
                        "rotation": [0, rotation, 0]
                    }
                }
            });
        }

        this.setValueAtPath("minecraft:block/permutations", permutations);
        return this;
    }

    addFacingDirection() {
        const enabledStatesPath = "minecraft:block/description/traits/minecraft:placement_direction/enabled_states";
        const enabledStates = this.getValueAtPath<string[]>(enabledStatesPath, []);
        enabledStates.push("minecraft:cardinal_direction");
        this.setValueAtPath(enabledStatesPath, enabledStates);
        return this;
    }

    addPermutation(condition: string, components: BlockComponents) {
        const permutations = this.getValueAtPath<unknown[]>("minecraft:block/permutations", []);

        permutations.push({
            condition: condition,
            components: components.toJson()
        });

        this.setValueAtPath("minecraft:block/permutations", permutations);
        return this;
    }

    /**
     * Adds an entire set of components at once
     */
    addComponents(components: BlockComponents) {
        const newComponents = components.toJson();
        this.deepMerge("minecraft:block/components", newComponents);
        return this;
    }
}

export class BlockComponents extends GeneratorBase<BlockComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    addComponent(id: string, data: Record<string, unknown> | string | number | boolean) {
        this.setValueAtPath(id, data);
        return this;
    }

    addTag(id: string) {
        this.setValueAtPath(`tag:${id}`, {});
        return this;
    }

    addBasicMaterial(textureName: string, renderMethod: string | undefined = undefined) {
        const materialData: Record<string, unknown> = {
            "*": {
                "texture": textureName
            }
        }

        if (renderMethod !== undefined) {
            (materialData["*"] as Record<string, string>)["render_method"] = renderMethod;
        }

        this.setValueAtPath("minecraft:material_instances", materialData);
        return this;
    }

    addBasicGeometry(
        modelIdentifier: string,
        boneVisibility: Record<string, string> | undefined = undefined
    ) {
        const geometryData: Record<string, unknown> = {
            identifier: modelIdentifier
        };

        if (boneVisibility !== undefined) {
            geometryData["bone_visibility"] = boneVisibility;
        }

        this.setValueAtPath("minecraft:geometry", geometryData);
        return this;
    }

    addTickComponent(interval: [number, number], looping = true) {
        return this.addComponent("minecraft:tick", {
            "looping": looping,
            "interval_range": interval
        });
    }

    addCustomComponent(id: string) {
        const components = this.getValueAtPath<string[]>("minecraft:custom_components", []);
        components.push(id);
        this.setValueAtPath("minecraft:custom_components", components);
        return this;
    }
}