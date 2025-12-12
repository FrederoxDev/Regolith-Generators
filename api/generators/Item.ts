import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { LangGenerator, ToTitleCase } from "./Lang.ts";

export class ItemGenerator extends GeneratorFactory<ItemDef> {
    langFile: LangGenerator | undefined;

    constructor(projectNamespace: string, langFile: LangGenerator | undefined = undefined) {
        super(projectNamespace, "BP/items");
        this.langFile = langFile;
    }

    makeItem(id: string): ItemDef {
        const def = new ItemDef(this.projectNamespace, id, this.langFile);
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

// export type ItemCategory = "construction" | "equipment" | "items" | "nature" | "none";

export enum ItemCategory {
    Construction = "construction",
    Equipment = "equipment",
    Items = "items",
    Nature = "nature",
    None = "none"
}

export class ItemDef extends GeneratorBase<ItemDef> {
    data: Record<string, unknown>;
    langFile: LangGenerator | undefined;

    constructor(projectNamespace: string, id: string, langFile: LangGenerator | undefined) {
        super();

        this.langFile = langFile;

        this.data = {
            "format_version": "1.21.70",
            "minecraft:item": {
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

    addComponents(components: ItemComponents): this{
        const newComponents = components.toJson();
        this.deepMerge("minecraft:item/components", newComponents);
        return this;
    }

    setHiddenInCommands(): this {
        this.setValueAtPath("minecraft:item/description/menu_category/is_hidden_in_commands", true);
        return this;
    }

    setCategory(category: ItemCategory) {
        this.setValueAtPath("minecraft:item/description/menu_category/category", category);
        return this;
    }

    addDefaultLocalization(): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to ItemGenerator, cannot add localization.");
        }

        const id = this.getValueAtPath<string>("minecraft:item/description/identifier", "");
        if (id === "") {
            throw new Error("ItemDef has no identifier, cannot add localization.");
        }

        const name = id.split(":")[1];
        const titleCaseName = ToTitleCase(name);

        this.langFile.addLine(`item.${id}`, titleCaseName);
        return this;
    }

    addLocalization(value: string): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to ItemGenerator, cannot add localization.");
        }
        const id = this.getValueAtPath<string>("minecraft:item/description/identifier", "");
        if (id === "") {
            throw new Error("ItemDef has no identifier, cannot add localization.");
        }

        this.langFile.addLine(`item.${id}`, value);
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

    addGlint(): this {
        this.setValueAtPath("minecraft:glint", true);
        return this;
    }

    setBlockPlacer(block: string, replaceBlockItem: boolean = false, useOn?: string[]) {
        if (useOn === undefined) {
            this.setValueAtPath("minecraft:block_placer", {
                "block": block,
                "replace_block_item": replaceBlockItem
            });
            return this;
        }
        this.setValueAtPath("minecraft:block_placer", {
            "block": block,
            "replace_block_item": replaceBlockItem,
            "use_on": useOn
        });
        return this;
    }

    setStorageItem(maxSlots: number, bannedItems?: string[], allowNestedStorageItems?: boolean): this {
        const storageItemComponent: Record<string, unknown> = {
            "max_slots": maxSlots
        };

        if (bannedItems !== undefined) {
            storageItemComponent["banned_items"] = bannedItems;
        }

        if (allowNestedStorageItems !== undefined) {
            storageItemComponent["allow_nested_storage_items"] = allowNestedStorageItems;
        }

        this.setValueAtPath("minecraft:storage_item", storageItemComponent);;
        return this;
    }
}