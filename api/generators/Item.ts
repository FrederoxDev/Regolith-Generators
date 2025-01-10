import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";

export class ItemGenerator extends GeneratorFactory<ItemDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/items");
    }

    makeItem(id: string): ItemDef {
        const def = new ItemDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export class ItemDef extends GeneratorBase<ItemDef> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.21.10",
            "minecraft:item": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "components": {}
            }
        }
    }

    addComponents(components: ItemComponents) {
        const newComponents = components.toJson();
        this.deepMerge("minecraft:item/components", newComponents);
        return this;
    }
}

export class ItemComponents extends GeneratorBase<ItemComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    addComponent(id: string, data: Record<string, unknown> | string | number | boolean) {
        this.setValueAtPath(id, data);
        return this;
    }

    /**
     * The icon item componenent determines the icon to represent the item in the UI and elsewhere.
     */
    addIcon(iconIdentifier: string) {
        return this.addComponent("minecraft:icon", iconIdentifier);
    }
}