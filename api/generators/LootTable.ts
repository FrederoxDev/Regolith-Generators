import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import { createFile } from "../FileIO.ts";
import {
    type LootBannerPattern,
    type LootConditionData,
    type LootConditionId,
    type LootConditionOptions,
    type LootEntityProperties,
    type LootEntityTarget,
    type LootEntryData,
    type LootEntryType,
    type LootFunctionData,
    type LootFunctionId,
    type LootFunctionOptions,
    type LootMatchToolData,
    type LootNumberProvider,
    type LootPoolData,
    type LootPoolTiersData,
    type LootSpecificEnchant,
    type LootStewEffect,
    type LootTableData
} from "./LootTableTypes.ts";

export * from "./LootTableTypes.ts";

const LOOT_TABLE_PREFIX = "loot_tables/";
const JSON_EXTENSION = ".json";

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function hasToJson(value: unknown): value is { toJson(): Record<string, unknown> } {
    return typeof value === "object"
        && value !== null
        && "toJson" in value
        && typeof (value as { toJson: unknown }).toJson === "function";
}

function toPlainObject<T extends Record<string, unknown>>(value: T | { toJson(): Record<string, unknown> }): T {
    if (hasToJson(value)) {
        return value.toJson() as T;
    }

    return value;
}

function normalizeLootTablePath(path: string): string {
    let output = path.replace(/\\/g, "/").replace(/^\/+/, "");

    if (output.startsWith("BP/")) {
        output = output.slice("BP/".length);
    }

    if (output.startsWith(LOOT_TABLE_PREFIX)) {
        output = output.slice(LOOT_TABLE_PREFIX.length);
    }

    if (output.endsWith(JSON_EXTENSION)) {
        output = output.slice(0, -JSON_EXTENSION.length);
    }

    return output;
}

/**
 * Converts a loot table file path into the reference string Minecraft expects.
 *
 * `blocks/stone`, `loot_tables/blocks/stone.json`, and
 * `BP/loot_tables/blocks/stone.json` all become
 * `loot_tables/blocks/stone.json`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/introductiontoloottables
 */
export function getLootTableReference(path: string): string {
    return `${LOOT_TABLE_PREFIX}${normalizeLootTablePath(path)}${JSON_EXTENSION}`;
}

/**
 * Factory for behavior-pack loot table files.
 *
 * Generated files are written under `BP/loot_tables`. Loot tables are used by
 * block loot components, entity loot components, chests, equipment, fishing,
 * and other gameplay systems.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/introductiontoloottables
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_table
 */
export class LootTableGenerator extends GeneratorFactory<LootTableDef> {
    /**
     * Creates a loot table generator that writes into `BP/loot_tables`.
     *
     * The namespace is accepted for consistency with the other generators, but
     * loot table files themselves are path-based and do not contain namespaced
     * identifiers.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/loot_tables");
    }

    /**
     * Queues a loot table at a path relative to `BP/loot_tables`.
     *
     * @example
     * ```ts
     * lootTables.makeLootTable("blocks/my_block");
     * ```
     */
    makeLootTable(path: string): LootTableDef {
        const normalizedPath = normalizeLootTablePath(path);
        const def = new LootTableDef();
        this.filesToGenerate.set(normalizedPath, def);
        return def;
    }

    /**
     * Queues a block loot table under `BP/loot_tables/blocks`.
     */
    makeBlockLootTable(blockId: string): LootTableDef {
        return this.makeLootTable(`blocks/${sanitiseIdentifierForFilename(blockId)}`);
    }

    /**
     * Queues an entity loot table under `BP/loot_tables/entities`.
     */
    makeEntityLootTable(entityId: string): LootTableDef {
        return this.makeLootTable(`entities/${sanitiseIdentifierForFilename(entityId)}`);
    }

    /**
     * Queues a chest loot table under `BP/loot_tables/chests`.
     */
    makeChestLootTable(id: string): LootTableDef {
        return this.makeLootTable(`chests/${sanitiseIdentifierForFilename(id)}`);
    }

    /**
     * Queues a gameplay loot table under `BP/loot_tables/gameplay`.
     */
    makeGameplayLootTable(id: string): LootTableDef {
        return this.makeLootTable(`gameplay/${sanitiseIdentifierForFilename(id)}`);
    }

    /**
     * Queues an equipment loot table under `BP/loot_tables/equipment`.
     */
    makeEquipmentLootTable(id: string): LootTableDef {
        return this.makeLootTable(`equipment/${sanitiseIdentifierForFilename(id)}`);
    }

    /**
     * Writes queued loot table files, preserving nested table paths.
     */
    public override generate(): void {
        for (const [path, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${path}${JSON_EXTENSION}`);
        }
    }
}

/**
 * Fluent builder for root loot table JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_table
 */
export class LootTableDef extends GeneratorBase<LootTableDef> {
    data: LootTableData;

    /**
     * Creates an empty loot table.
     */
    constructor(pools: Array<LootPool | LootPoolData> = []) {
        super();

        this.data = {
            pools: []
        };

        this.setPools(pools);
    }

    /**
     * Replaces all loot pools.
     */
    setPools(pools: Array<LootPool | LootPoolData>): this {
        this.data.pools = pools.map((pool) => toPlainObject<LootPoolData>(pool));
        return this;
    }

    /**
     * Adds a loot pool.
     */
    addPool(pool: LootPool | LootPoolData): this {
        this.data.pools.push(toPlainObject<LootPoolData>(pool));
        return this;
    }

    /**
     * Creates, configures, and adds a loot pool.
     */
    addPoolWith(
        rolls: LootNumberProvider = 1,
        configure: ((pool: LootPool) => void) | undefined = undefined
    ): this {
        const pool = new LootPool(rolls);
        configure?.(pool);
        return this.addPool(pool);
    }

    /**
     * Adds a one-pool loot table entry for a single item.
     */
    addItem(
        itemId: string,
        weight: number = 1,
        rolls: LootNumberProvider = 1,
        configure: ((entry: LootEntry) => void) | undefined = undefined
    ): this {
        return this.addPoolWith(rolls, (pool) => {
            pool.addItem(itemId, weight, configure);
        });
    }
}

/**
 * Shared condition helpers for pools, entries, and functions.
 *
 * Conditions can be attached to a pool, an entry, or a function. All helpers
 * write into that object's `conditions` array.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export abstract class LootConditioned<TSelf extends LootConditioned<TSelf>> extends GeneratorBase<TSelf> {
    abstract data: Record<string, unknown>;

    /**
     * Replaces all conditions.
     */
    setConditions(conditions: Array<LootCondition | LootConditionData>): this {
        this.setValueAtPath(
            "conditions",
            conditions.map((condition) => toPlainObject<LootConditionData>(condition))
        );
        return this;
    }

    /**
     * Adds a condition object or condition id.
     */
    addCondition(condition: LootCondition | LootConditionData): this;
    addCondition(conditionId: LootConditionId, data?: LootConditionOptions): this;
    addCondition(
        condition: LootCondition | LootConditionData | LootConditionId,
        data: LootConditionOptions = {}
    ): this {
        const conditions = this.getValueAtPath<LootConditionData[]>("conditions", []);

        if (typeof condition === "string") {
            conditions.push({ condition, ...data });
        } else {
            conditions.push(toPlainObject<LootConditionData>(condition));
        }

        this.setValueAtPath("conditions", conditions);
        return this;
    }

    /**
     * Requires the loot source to have been damaged by a specific entity type.
     *
     * @see https://learn.microsoft.com/minecraft/creator/scriptapi/minecraft/server/damagedbyentitycondition
     */
    addDamagedByEntityCondition(entityType: string): this {
        return this.addCondition("damaged_by_entity", { entity_type: entityType });
    }

    /**
     * Requires the loot source to be an entity of the given type.
     */
    addEntityKilledCondition(entityType: string): this {
        return this.addCondition("entity_killed", { entity_type: entityType });
    }

    /**
     * Requires an entity property check to pass.
     */
    addEntityPropertiesCondition(entity: LootEntityTarget, properties: LootEntityProperties): this {
        return this.addCondition("entity_properties", { entity, properties });
    }

    /**
     * Requires a specific mark variant value.
     */
    addHasMarkVariantCondition(value: number): this {
        return this.addCondition("has_mark_variant", { value });
    }

    /**
     * Requires a specific variant value.
     */
    addHasVariantCondition(value: number): this {
        return this.addCondition("has_variant", { value });
    }

    /**
     * Requires the loot source to be a baby entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/scriptapi/minecraft/server/isbabycondition
     */
    addIsBabyCondition(): this {
        return this.addCondition("is_baby");
    }

    /**
     * Requires the loot source to have been killed by a specific entity type.
     */
    addKilledByEntityCondition(entityType: string): this {
        return this.addCondition("killed_by_entity", { entity_type: entityType });
    }

    /**
     * Requires the loot source to have been killed by a player.
     */
    addKilledByPlayerCondition(): this {
        return this.addCondition("killed_by_player");
    }

    /**
     * Requires the loot source to have been killed by a player or their pets.
     */
    addKilledByPlayerOrPetsCondition(): this {
        return this.addCondition("killed_by_player_or_pets");
    }

    /**
     * Requires the triggering tool to match item, enchantment, durability, or
     * item-tag predicates.
     */
    addMatchToolCondition(tool: LootMatchToolData): this {
        return this.addCondition("match_tool", tool);
    }

    /**
     * Requires the looting entity to be riding a specific entity type.
     *
     * @see https://learn.microsoft.com/minecraft/creator/scriptapi/minecraft/server/passengerofentitycondition
     */
    addPassengerOfEntityCondition(entityType: string): this {
        return this.addCondition("passenger_of_entity", { entity_type: entityType });
    }

    /**
     * Applies a fixed random chance.
     */
    addRandomChanceCondition(chance: number): this {
        return this.addCondition("random_chance", { chance });
    }

    /**
     * Applies a random chance modified by looting enchantment level.
     */
    addRandomChanceWithLootingCondition(chance: number, lootingMultiplier: number): this {
        return this.addCondition("random_chance_with_looting", {
            chance,
            looting_multiplier: lootingMultiplier
        });
    }

    /**
     * Applies difficulty-specific drop chances.
     */
    addRandomDifficultyChanceCondition(chances: {
        default_chance?: number;
        peaceful?: number;
        easy?: number;
        normal?: number;
        hard?: number;
    }): this {
        return this.addCondition("random_difficulty_chance", chances);
    }

    /**
     * Applies a chance modified by regional difficulty.
     */
    addRandomRegionalDifficultyChanceCondition(maxChance: number): this {
        return this.addCondition("random_regional_difficulty_chance", { max_chance: maxChance });
    }
}

/**
 * Fluent builder for a loot pool.
 *
 * A pool rolls one or more times and selects from its entries.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_pool
 */
export class LootPool extends LootConditioned<LootPool> {
    data: LootPoolData;

    /**
     * Creates a loot pool with an optional rolls value and starting entries.
     */
    constructor(rolls: LootNumberProvider = 1, entries: Array<LootEntry | LootEntryData> = []) {
        super();

        this.data = {
            rolls,
            entries: []
        };

        this.setEntries(entries);
    }

    /**
     * Replaces the number of times this pool rolls.
     */
    setRolls(rolls: LootNumberProvider): this {
        this.data.rolls = rolls;
        return this;
    }

    /**
     * Sets extra rolls added from luck.
     */
    setBonusRolls(bonusRolls: LootNumberProvider): this {
        this.data.bonus_rolls = bonusRolls;
        return this;
    }

    /**
     * Sets tiered entry selection values.
     */
    setTiers(tiers: LootPoolTiersData): this {
        this.data.tiers = tiers;
        return this;
    }

    /**
     * Sets tiered entry selection values using the documented fields.
     */
    setTierValues(initialRange: number, bonusRolls: number, bonusChance: number): this {
        return this.setTiers({
            initial_range: initialRange,
            bonus_rolls: bonusRolls,
            bonus_chance: bonusChance
        });
    }

    /**
     * Replaces all entries in this pool.
     */
    setEntries(entries: Array<LootEntry | LootEntryData>): this {
        this.data.entries = entries.map((entry) => toPlainObject<LootEntryData>(entry));
        return this;
    }

    /**
     * Adds a prebuilt entry.
     */
    addEntry(entry: LootEntry | LootEntryData): this {
        this.data.entries.push(toPlainObject<LootEntryData>(entry));
        return this;
    }

    /**
     * Adds an item entry.
     */
    addItem(
        itemId: string,
        weight: number = 1,
        configure: ((entry: LootEntry) => void) | undefined = undefined
    ): this {
        const entry = LootEntry.item(itemId, weight);
        configure?.(entry);
        return this.addEntry(entry);
    }

    /**
     * Adds an entry that references another loot table.
     */
    addLootTable(
        path: string,
        weight: number = 1,
        configure: ((entry: LootEntry) => void) | undefined = undefined
    ): this {
        const entry = LootEntry.lootTable(getLootTableReference(path), weight);
        configure?.(entry);
        return this.addEntry(entry);
    }

    /**
     * Adds an inline nested loot table entry.
     */
    addInlineLootTable(
        pools: Array<LootPool | LootPoolData>,
        weight: number = 1,
        configure: ((entry: LootEntry) => void) | undefined = undefined
    ): this {
        const entry = LootEntry.lootTable(undefined, weight).setPools(pools);
        configure?.(entry);
        return this.addEntry(entry);
    }

    /**
     * Adds an empty entry that produces no drops when selected.
     */
    addEmpty(
        weight: number = 1,
        configure: ((entry: LootEntry) => void) | undefined = undefined
    ): this {
        const entry = LootEntry.empty(weight);
        configure?.(entry);
        return this.addEntry(entry);
    }
}

/**
 * Fluent builder for a loot table entry.
 *
 * Entries can represent items, referenced loot tables, inline nested loot
 * tables, or empty results.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_entry
 */
export class LootEntry extends LootConditioned<LootEntry> {
    data: LootEntryData;

    /**
     * Creates a loot entry.
     */
    constructor(type: LootEntryType, name: string | undefined = undefined, weight: number | undefined = undefined) {
        super();

        this.data = {
            type
        };

        if (name !== undefined) {
            this.setName(name);
        }

        if (weight !== undefined) {
            this.setWeight(weight);
        }
    }

    /**
     * Creates an item entry.
     */
    static item(itemId: string, weight: number = 1): LootEntry {
        return new LootEntry("item", itemId, weight);
    }

    /**
     * Creates a referenced loot table entry.
     */
    static lootTable(path: string | undefined = undefined, weight: number = 1): LootEntry {
        return new LootEntry("loot_table", path, weight);
    }

    /**
     * Creates an empty entry.
     */
    static empty(weight: number = 1): LootEntry {
        return new LootEntry("empty", undefined, weight);
    }

    /**
     * Replaces the entry type.
     */
    setType(type: LootEntryType): this {
        this.data.type = type;
        return this;
    }

    /**
     * Sets the item id or referenced loot table path.
     */
    setName(name: string): this {
        this.data.name = name;
        return this;
    }

    /**
     * Sets the relative entry weight.
     */
    setWeight(weight: number): this {
        this.data.weight = weight;
        return this;
    }

    /**
     * Sets the luck quality value used by runtime loot table entries.
     */
    setQuality(quality: number): this {
        this.data.quality = quality;
        return this;
    }

    /**
     * Sets a trade-table style quantity on this entry.
     */
    setQuantity(quantity: LootNumberProvider): this {
        this.data.quantity = quantity;
        return this;
    }

    /**
     * Replaces inline nested pools.
     */
    setPools(pools: Array<LootPool | LootPoolData>): this {
        this.data.pools = pools.map((pool) => toPlainObject<LootPoolData>(pool));
        return this;
    }

    /**
     * Adds an inline nested pool.
     */
    addPool(pool: LootPool | LootPoolData): this {
        const pools = this.data.pools ?? [];
        pools.push(toPlainObject<LootPoolData>(pool));
        this.data.pools = pools;
        return this;
    }

    /**
     * Replaces all loot functions.
     */
    setFunctions(functions: Array<LootFunction | LootFunctionData>): this {
        this.data.functions = functions.map((func) => toPlainObject<LootFunctionData>(func));
        return this;
    }

    /**
     * Adds a loot function object or function id.
     */
    addFunction(func: LootFunction | LootFunctionData): this;
    addFunction(functionId: LootFunctionId, data?: LootFunctionOptions): this;
    addFunction(
        func: LootFunction | LootFunctionData | LootFunctionId,
        data: LootFunctionOptions = {}
    ): this {
        const functions = this.data.functions ?? [];

        if (typeof func === "string") {
            functions.push({ function: func, ...data });
        } else {
            functions.push(toPlainObject<LootFunctionData>(func));
        }

        this.data.functions = functions;
        return this;
    }

    /**
     * Adds `enchant_book_for_trading`.
     */
    addEnchantBookForTrading(
        baseCost: number,
        baseRandomCost: number,
        perLevelRandomCost: number,
        perLevelCost: number
    ): this {
        return this.addFunction("enchant_book_for_trading", {
            base_cost: baseCost,
            base_random_cost: baseRandomCost,
            per_level_random_cost: perLevelRandomCost,
            per_level_cost: perLevelCost
        });
    }

    /**
     * Adds `enchant_random_gear`.
     */
    addEnchantRandomGear(chance: number): this {
        return this.addFunction("enchant_random_gear", { chance });
    }

    /**
     * Adds `enchant_randomly`.
     */
    addEnchantRandomly(treasure: boolean | undefined = undefined): this {
        return this.addFunction("enchant_randomly", treasure === undefined ? {} : { treasure });
    }

    /**
     * Adds `enchant_with_levels`.
     */
    addEnchantWithLevels(levels: LootNumberProvider, treasure: boolean | undefined = undefined): this {
        return this.addFunction("enchant_with_levels", {
            levels,
            ...(treasure === undefined ? {} : { treasure })
        });
    }

    /**
     * Adds `exploration_map`.
     */
    addExplorationMap(destination: string): this {
        return this.addFunction("exploration_map", { destination });
    }

    /**
     * Adds `explosion_decay`.
     */
    addExplosionDecay(): this {
        return this.addFunction("explosion_decay");
    }

    /**
     * Adds `fill_container`.
     */
    addFillContainer(path: string): this {
        return this.addFunction("fill_container", { loot_table: getLootTableReference(path) });
    }

    /**
     * Adds `furnace_smelt`.
     */
    addFurnaceSmelt(configure: ((func: LootFunction) => void) | undefined = undefined): this {
        const func = new LootFunction("furnace_smelt");
        configure?.(func);
        return this.addFunction(func);
    }

    /**
     * Adds `looting_enchant`.
     */
    addLootingEnchant(count: LootNumberProvider): this {
        return this.addFunction("looting_enchant", { count });
    }

    /**
     * Adds `random_aux_value`.
     */
    addRandomAuxValue(values: LootNumberProvider): this {
        return this.addFunction("random_aux_value", { values });
    }

    /**
     * Adds `random_block_state`.
     */
    addRandomBlockState(blockState: string, values: LootNumberProvider): this {
        return this.addFunction("random_block_state", {
            block_state: blockState,
            values
        });
    }

    /**
     * Adds `random_dye`.
     */
    addRandomDye(): this {
        return this.addFunction("random_dye");
    }

    /**
     * Adds `set_actor_id`.
     */
    addSetActorId(id: string | undefined = undefined): this {
        return this.addFunction("set_actor_id", id === undefined ? {} : { id });
    }

    /**
     * Adds `set_armor_trim`.
     */
    addSetArmorTrim(material: string, pattern: string): this {
        return this.addFunction("set_armor_trim", { material, pattern });
    }

    /**
     * Adds `set_banner_details`.
     */
    addSetBannerDetails(
        type: number | string = 1,
        baseColor: string | undefined = undefined,
        patterns: LootBannerPattern[] | undefined = undefined
    ): this {
        return this.addFunction("set_banner_details", {
            type,
            ...(baseColor === undefined ? {} : { base_color: baseColor }),
            ...(patterns === undefined ? {} : { patterns })
        });
    }

    /**
     * Adds `set_book_contents`.
     */
    addSetBookContents(author: string, title: string, pages: string[]): this {
        return this.addFunction("set_book_contents", { author, title, pages });
    }

    /**
     * Adds `set_count`.
     */
    addSetCount(count: LootNumberProvider): this {
        return this.addFunction("set_count", { count });
    }

    /**
     * Adds `set_damage`.
     */
    addSetDamage(damage: LootNumberProvider): this {
        return this.addFunction("set_damage", { damage });
    }

    /**
     * Adds `set_data`.
     */
    addSetData(data: LootNumberProvider): this {
        return this.addFunction("set_data", { data });
    }

    /**
     * Adds `set_data_from_color_index`.
     */
    addSetDataFromColorIndex(): this {
        return this.addFunction("set_data_from_color_index");
    }

    /**
     * Adds `set_lore`.
     */
    addSetLore(lore: string | string[]): this {
        return this.addFunction("set_lore", { lore: toArray(lore) });
    }

    /**
     * Adds `set_name`.
     */
    addSetName(name: string): this {
        return this.addFunction("set_name", { name });
    }

    /**
     * Adds `set_nbt`.
     */
    addSetNbt(tag: string): this {
        return this.addFunction("set_nbt", { tag });
    }

    /**
     * Adds `set_ominous_bottle_amplifier`.
     */
    addSetOminousBottleAmplifier(amplifier: LootNumberProvider): this {
        return this.addFunction("set_ominous_bottle_amplifier", { amplifier });
    }

    /**
     * Adds `set_potion`.
     */
    addSetPotion(id: string): this {
        return this.addFunction("set_potion", { id });
    }

    /**
     * Adds `set_stew_effect`.
     */
    addSetStewEffect(effects: Array<number | LootStewEffect>): this {
        return this.addFunction("set_stew_effect", { effects });
    }

    /**
     * Adds `specific_enchants`.
     */
    addSpecificEnchants(enchants: LootSpecificEnchant | LootSpecificEnchant[]): this {
        return this.addFunction("specific_enchants", { enchants: toArray(enchants) });
    }

    /**
     * Adds `trader_material_type`.
     */
    addTraderMaterialType(): this {
        return this.addFunction("trader_material_type");
    }
}

/**
 * Fluent builder for a loot function.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_function
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export class LootFunction extends LootConditioned<LootFunction> {
    data: LootFunctionData;

    /**
     * Creates a loot function.
     */
    constructor(functionId: LootFunctionId, data: LootFunctionOptions = {}) {
        super();

        this.data = {
            function: functionId,
            ...data
        };
    }

    /**
     * Replaces the function id.
     */
    setFunction(functionId: LootFunctionId): this {
        this.data.function = functionId;
        return this;
    }

    /**
     * Sets a function-specific field.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Sets the count for `set_count` or `looting_enchant`.
     */
    setCount(count: LootNumberProvider): this {
        this.data.count = count;
        return this;
    }

    /**
     * Sets the data value for `set_data`.
     */
    setData(data: LootNumberProvider): this {
        this.data.data = data;
        return this;
    }

    /**
     * Sets the durability percentage for `set_damage`.
     */
    setDamage(damage: LootNumberProvider): this {
        this.data.damage = damage;
        return this;
    }

    /**
     * Sets whether treasure enchantments may be selected.
     */
    setTreasure(treasure: boolean): this {
        this.data.treasure = treasure;
        return this;
    }

    /**
     * Sets the level range for `enchant_with_levels`.
     */
    setLevels(levels: LootNumberProvider): this {
        this.data.levels = levels;
        return this;
    }

    /**
     * Sets the id field used by `set_actor_id` and `set_potion`.
     */
    setId(id: string): this {
        this.data.id = id;
        return this;
    }

    /**
     * Sets the destination for `exploration_map`.
     */
    setDestination(destination: string): this {
        this.data.destination = destination;
        return this;
    }

    /**
     * Sets the referenced loot table for `fill_container`.
     */
    setLootTable(path: string): this {
        this.data.loot_table = getLootTableReference(path);
        return this;
    }

    /**
     * Sets the SNBT tag for `set_nbt`.
     */
    setTag(tag: string): this {
        this.data.tag = tag;
        return this;
    }

    /**
     * Sets the chance field used by chance-based functions.
     */
    setChance(chance: number): this {
        this.data.chance = chance;
        return this;
    }

    /**
     * Sets the values range used by random value functions.
     */
    setValues(values: LootNumberProvider): this {
        this.data.values = values;
        return this;
    }

    /**
     * Sets the block state randomized by `random_block_state`.
     */
    setBlockState(blockState: string): this {
        this.data.block_state = blockState;
        return this;
    }

    /**
     * Sets trade enchant costs for `enchant_book_for_trading`.
     */
    setTradingEnchantCosts(
        baseCost: number,
        baseRandomCost: number,
        perLevelRandomCost: number,
        perLevelCost: number
    ): this {
        this.data.base_cost = baseCost;
        this.data.base_random_cost = baseRandomCost;
        this.data.per_level_random_cost = perLevelRandomCost;
        this.data.per_level_cost = perLevelCost;
        return this;
    }

    /**
     * Sets banner fields for `set_banner_details`.
     */
    setBannerDetails(
        type: number | string,
        baseColor: string | undefined = undefined,
        patterns: LootBannerPattern[] | undefined = undefined
    ): this {
        this.data.type = type;

        if (baseColor !== undefined) {
            this.data.base_color = baseColor;
        }

        if (patterns !== undefined) {
            this.data.patterns = patterns;
        }

        return this;
    }

    /**
     * Sets book fields for `set_book_contents`.
     */
    setBookContents(author: string, title: string, pages: string[]): this {
        this.data.author = author;
        this.data.title = title;
        this.data.pages = pages;
        return this;
    }

    /**
     * Sets the item display name for `set_name`.
     */
    setName(name: string): this {
        this.data.name = name;
        return this;
    }

    /**
     * Sets item lore for `set_lore`.
     */
    setLore(lore: string | string[]): this {
        this.data.lore = toArray(lore);
        return this;
    }

    /**
     * Sets specific enchantments for `specific_enchants`.
     */
    setSpecificEnchants(enchants: LootSpecificEnchant | LootSpecificEnchant[]): this {
        this.data.enchants = toArray(enchants);
        return this;
    }

    /**
     * Sets armor trim fields for `set_armor_trim`.
     */
    setArmorTrim(material: string, pattern: string): this {
        this.data.material = material;
        this.data.pattern = pattern;
        return this;
    }

    /**
     * Sets the ominous bottle amplifier range.
     */
    setOminousBottleAmplifier(amplifier: LootNumberProvider): this {
        this.data.amplifier = amplifier;
        return this;
    }

    /**
     * Sets suspicious stew effects.
     */
    setStewEffects(effects: Array<number | LootStewEffect>): this {
        this.data.effects = effects;
        return this;
    }
}

/**
 * Fluent builder for a loot condition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_condition
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export class LootCondition extends GeneratorBase<LootCondition> {
    data: LootConditionData;

    /**
     * Creates a loot condition.
     */
    constructor(conditionId: LootConditionId, data: LootConditionOptions = {}) {
        super();

        this.data = {
            condition: conditionId,
            ...data
        };
    }

    /**
     * Replaces the condition id.
     */
    setCondition(conditionId: LootConditionId): this {
        this.data.condition = conditionId;
        return this;
    }

    /**
     * Sets a condition-specific field.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Sets a base probability.
     */
    setChance(chance: number): this {
        this.data.chance = chance;
        return this;
    }

    /**
     * Sets the additional chance per looting level.
     */
    setLootingMultiplier(lootingMultiplier: number): this {
        this.data.looting_multiplier = lootingMultiplier;
        return this;
    }

    /**
     * Sets a variant value.
     */
    setValue(value: number): this {
        this.data.value = value;
        return this;
    }

    /**
     * Sets difficulty-specific chances.
     */
    setDifficultyChances(chances: {
        default_chance?: number;
        peaceful?: number;
        easy?: number;
        normal?: number;
        hard?: number;
    }): this {
        Object.assign(this.data, chances);
        return this;
    }

    /**
     * Sets the maximum regional difficulty chance.
     */
    setMaxChance(maxChance: number): this {
        this.data.max_chance = maxChance;
        return this;
    }

    /**
     * Sets the entity target for `entity_properties`.
     */
    setEntity(entity: LootEntityTarget): this {
        this.data.entity = entity;
        return this;
    }

    /**
     * Sets entity properties for `entity_properties`.
     */
    setProperties(properties: LootEntityProperties): this {
        this.data.properties = properties;
        return this;
    }

    /**
     * Sets the entity type used by entity-kill related conditions.
     */
    setEntityType(entityType: string): this {
        this.data.entity_type = entityType;
        return this;
    }

    /**
     * Sets direct `match_tool` predicates.
     */
    setMatchTool(tool: LootMatchToolData): this {
        Object.assign(this.data, tool);
        return this;
    }

    /**
     * Sets the generated-form `match_tool` object shape.
     */
    setMatchToolObject(tool: LootMatchToolData): this {
        this.data.match_tool = tool;
        return this;
    }
}
