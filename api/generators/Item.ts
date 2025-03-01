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

    getItem(id: string): ItemDef {
        const item = this.filesToGenerate.get(id);
        if (!item) {
            throw new Error(`Item with id ${id} not found`);
        }

        return item;
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

    addComponents(components: ItemComponents): this{
        const newComponents = components.toJson();
        this.deepMerge("minecraft:item/components", newComponents);
        return this;
    }
}

export enum ItemSlot {
    Offhand = "slot.weapon.offhand",
    Head = "slot.armor.head",
    Chest = "slot.armor.chest",
    Legs = "slot.armor.legs",
    Feet = "slot.armor.feet"
}

export class ItemComponents extends GeneratorBase<ItemComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    addComponent(id: string, data: Record<string, unknown> | string | number | boolean): this {
        this.setValueAtPath(id, data);
        return this;
    }

    addCustomComponent(id: string): this {
        const existingComponents = this.getValueAtPath<string[]>("minecraft:custom_components", []);
        existingComponents.push(id);
        this.setValueAtPath("minecraft:custom_components", existingComponents);
        return this;
    }

    /**
     * The icon item componenent determines the icon to represent the item in the UI and elsewhere.
     */
    addIcon(iconIdentifier: string): this {
        return this.addComponent("minecraft:icon", iconIdentifier);
    }

    setMaxStackSize(maxStackSize: number): this {
        return this.addComponent("minecraft:max_stack_size", {
            "value": maxStackSize
        });
    }

    setWearable(protection: number, slot: ItemSlot): this {
        return this.addComponent("minecraft:wearable", {
            "protection": protection,
            "slot": slot
        });
    }

    addTag(tag: string): this {
        const existingTags = this.getValueAtPath<string[]>("minecraft:tags/tags", []);
        existingTags.push(tag);
        this.setValueAtPath("minecraft:tags/tags", existingTags);
        return this;
    }
}