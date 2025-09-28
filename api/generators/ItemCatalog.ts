import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { ItemComponents, ItemCategory } from "./Item.ts";

export class ItemCatalogGenerator extends GeneratorFactory<ItemCatalogDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/item_catalog");
    }

    makeCatalog(): ItemCatalogDef {
        const def = new ItemCatalogDef();
        this.filesToGenerate.set("crafting_item_catalog", def);
        return def;
    }
}

interface CustomItemCatalogGroup {
    icon: string,
    name: string
}

export enum VanillaItemGroup {
    Planks = "minecraft:itemGroup.name.planks",
    Walls = "minecraft:itemGroup.name.walls",
    Fence = "minecraft:itemGroup.name.fence",
    FenceGate = "minecraft:itemGroup.name.fenceGate",
    Stairs = "minecraft:itemGroup.name.stairs",
    Door = "minecraft:itemGroup.name.door",
    Trapdoor = "minecraft:itemGroup.name.trapdoor",
    Glass = "minecraft:itemGroup.name.glass",
    GlassPane = "minecraft:itemGroup.name.glassPane",
    Slab = "minecraft:itemGroup.name.slab",
    StoneBrick = "minecraft:itemGroup.name.stoneBrick",
    Sandstone = "minecraft:itemGroup.name.sandstone",
    Copper = "minecraft:itemGroup.name.copper",
    Wool = "minecraft:itemGroup.name.wool",
    WoolCarpet = "minecraft:itemGroup.name.woolCarpet",
    ConcretePowder = "minecraft:itemGroup.name.concretePowder",
    Concrete = "minecraft:itemGroup.name.concrete",
    StainedClay = "minecraft:itemGroup.name.stainedClay",
    GlazedTerracotta = "minecraft:itemGroup.name.glazedTerracotta",
    Ore = "minecraft:itemGroup.name.ore",
    Stone = "minecraft:itemGroup.name.stone",
    Log = "minecraft:itemGroup.name.log",
    Wood = "minecraft:itemGroup.name.wood",
    Leaves = "minecraft:itemGroup.name.leaves",
    Sapling = "minecraft:itemGroup.name.sapling",
    Seed = "minecraft:itemGroup.name.seed",
    Crop = "minecraft:itemGroup.name.crop",
    Grass = "minecraft:itemGroup.name.grass",
    CoralDecorations = "minecraft:itemGroup.name.coral_decorations",
    Flower = "minecraft:itemGroup.name.flower",
    Dye = "minecraft:itemGroup.name.dye",
    RawFood = "minecraft:itemGroup.name.rawFood",
    Mushroom = "minecraft:itemGroup.name.mushroom",
    MonsterStoneEgg = "minecraft:itemGroup.name.monsterStoneEgg",
    MobEgg = "minecraft:itemGroup.name.mobEgg",
    Coral = "minecraft:itemGroup.name.coral",
    Sculk = "minecraft:itemGroup.name.sculk",
    Helmet = "minecraft:itemGroup.name.helmet",
    Chestplate = "minecraft:itemGroup.name.chestplate",
    Leggings = "minecraft:itemGroup.name.leggings",
    Boots = "minecraft:itemGroup.name.boots",
    Sword = "minecraft:itemGroup.name.sword",
    Axe = "minecraft:itemGroup.name.axe",
    Pickaxe = "minecraft:itemGroup.name.pickaxe",
    Shovel = "minecraft:itemGroup.name.shovel",
    Hoe = "minecraft:itemGroup.name.hoe",
    Arrow = "minecraft:itemGroup.name.arrow",
    CookedFood = "minecraft:itemGroup.name.cookedFood",
    MiscFood = "minecraft:itemGroup.name.miscFood",
    GoatHorn = "minecraft:itemGroup.name.goatHorn",
    Bundles = "minecraft:itemGroup.name.bundles",
    HorseArmor = "minecraft:itemGroup.name.horseArmor",
    Potion = "minecraft:itemGroup.name.potion",
    SplashPotion = "minecraft:itemGroup.name.splashPotion",
    LingeringPotion = "minecraft:itemGroup.name.lingeringPotion",
    OminousBottle = "minecraft:itemGroup.name.ominousBottle",
    Bed = "minecraft:itemGroup.name.bed",
    Candles = "minecraft:itemGroup.name.candles",
    Anvil = "minecraft:itemGroup.name.anvil",
    Chest = "minecraft:itemGroup.name.chest",
    ShulkerBox = "minecraft:itemGroup.name.shulkerBox",
    Record = "minecraft:itemGroup.name.record",
    Sign = "minecraft:itemGroup.name.sign",
    HangingSign = "minecraft:itemGroup.name.hanging_sign",
    Skull = "minecraft:itemGroup.name.skull",
    Boat = "minecraft:itemGroup.name.boat",
    ChestBoat = "minecraft:itemGroup.name.chestboat",
    Rail = "minecraft:itemGroup.name.rail",
    Minecart = "minecraft:itemGroup.name.minecart",
    Buttons = "minecraft:itemGroup.name.buttons",
    PressurePlate = "minecraft:itemGroup.name.pressurePlate",
    BannerPattern = "minecraft:itemGroup.name.banner_pattern",
    PotterySherds = "minecraft:itemGroup.name.potterySherds",
    SmithingTemplates = "minecraft:itemGroup.name.smithing_templates"
}

interface VanillaItemCatalogGroup {
    name: VanillaItemGroup
}

interface ItemCatalogStructure {
    category_name: ItemCategory;
    groups: {
        group_identifier?: CustomItemCatalogGroup | VanillaItemCatalogGroup,
        items: string[]
    }[]
}

export class ItemCatalogDef extends GeneratorBase<ItemCatalogDef> {
    data: Record<string, unknown>;

    constructor() {
        super();

        this.data = {
            "format_version": "1.21.60",
            "minecraft:crafting_items_catalog": {
                "categories": []
            }
        }
    }

    addGroup(category: ItemCategory, group: CustomItemCatalogGroup | VanillaItemCatalogGroup | undefined, items: string[]): this {
        const allCategories = this.getValueAtPath<ItemCatalogStructure[]>("minecraft:crafting_items_catalog/categories", []);

        let thisCategory = allCategories.find(e => e.category_name === category);

        if (!thisCategory) {
            thisCategory = {
                category_name: category,
                groups: []
            };

            allCategories.push(thisCategory);
        }

        if (group) thisCategory.groups.push({
            group_identifier: group,
            items: items
        });
        else {
            thisCategory.groups.push({
                items: items
            });
        }

        

        this.setValueAtPath("minecraft:crafting_items_catalog/categories", allCategories);
        return this;
    }
}
