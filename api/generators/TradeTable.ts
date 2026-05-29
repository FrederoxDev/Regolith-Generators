import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import { createFile } from "../FileIO.ts";
import type { EntityFilterGroup } from "./EntityComponentTypes.ts";
import {
    type TradeBannerPattern,
    type TradeItemData,
    type TradeItemFunctionData,
    type TradeItemFunctionId,
    type TradeItemFunctionOptions,
    type TradeItemQuantity,
    type TradeGroupData,
    type TradeSingleData,
    type TradeSingleOptions,
    type TradeSpecificEnchant,
    type TradeStewEffect,
    type TradeTableData,
    type TradeTableFormatVersion,
    type TradeTierData
} from "./TradeTableTypes.ts";

export * from "./TradeTableTypes.ts";

const TRADING_PREFIX = "trading/";
const ECONOMY_TRADES_PREFIX = "economy_trades/";
const LOOT_TABLE_PREFIX = "loot_tables/";
const JSON_EXTENSION = ".json";

type TradeItemInput = string | TradeItem | TradeItemData;

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

function normalizeJsonPath(path: string, prefix: string): string {
    let output = path.replace(/\\/g, "/").replace(/^\/+/, "");

    if (output.startsWith("BP/")) {
        output = output.slice("BP/".length);
    }

    if (output.startsWith(prefix)) {
        output = output.slice(prefix.length);
    }

    if (output.endsWith(JSON_EXTENSION)) {
        output = output.slice(0, -JSON_EXTENSION.length);
    }

    return output;
}

function normalizeTradeTablePath(path: string): string {
    return normalizeJsonPath(path, TRADING_PREFIX);
}

function getLootTableReference(path: string): string {
    return `${LOOT_TABLE_PREFIX}${normalizeJsonPath(path, LOOT_TABLE_PREFIX)}${JSON_EXTENSION}`;
}

function toTradeItemData(item: TradeItemInput): TradeItemData {
    if (typeof item === "string") {
        return new TradeItem(item).toJson() as TradeItemData;
    }

    return toPlainObject<TradeItemData>(item);
}

/**
 * Converts a trade table file path into the reference string Minecraft expects
 * in `minecraft:economy_trade_table.table` or `minecraft:trade_table.table`.
 *
 * `economy_trades/butcher_trades`, `trading/economy_trades/butcher_trades.json`,
 * and `BP/trading/economy_trades/butcher_trades.json` all become
 * `trading/economy_trades/butcher_trades.json`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/createtradetable
 */
export function getTradeTableReference(path: string): string {
    return `${TRADING_PREFIX}${normalizeTradeTablePath(path)}${JSON_EXTENSION}`;
}

/**
 * Factory for behavior-pack trade table files.
 *
 * Generated files are written under `BP/trading`. Current Microsoft guidance
 * recommends `minecraft:economy_trade_table` and the `trading/economy_trades`
 * folder for villager-style economy trades.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/createtradetable
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/trade
 */
export class TradeTableGenerator extends GeneratorFactory<TradeTableDef> {
    /**
     * Creates a trade table generator that writes into `BP/trading`.
     *
     * The namespace is accepted for consistency with other generators. Trade
     * table files are path-based and do not contain namespaced identifiers.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/trading");
    }

    /**
     * Queues a trade table at a path relative to `BP/trading`.
     */
    makeTradeTable(path: string): TradeTableDef {
        const normalizedPath = normalizeTradeTablePath(path);
        const def = new TradeTableDef();
        this.filesToGenerate.set(normalizedPath, def);
        return def;
    }

    /**
     * Queues a current economy trade table under
     * `BP/trading/economy_trades`.
     */
    makeEconomyTradeTable(id: string): TradeTableDef {
        return this.makeTradeTable(`${ECONOMY_TRADES_PREFIX}${sanitiseIdentifierForFilename(id)}`);
    }

    /**
     * Queues a legacy trade table directly under `BP/trading`.
     */
    makeLegacyTradeTable(id: string): TradeTableDef {
        return this.makeTradeTable(sanitiseIdentifierForFilename(id));
    }

    /**
     * Writes queued trade table files, preserving nested table paths.
     */
    public override generate(): void {
        for (const [path, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${path}${JSON_EXTENSION}`);
        }
    }
}

/**
 * Fluent builder for root trade table JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/trade
 */
export class TradeTableDef extends GeneratorBase<TradeTableDef> {
    data: TradeTableData;

    /**
     * Creates an empty trade table.
     */
    constructor(tiers: Array<TradeTier | TradeTierData> = []) {
        super();

        this.data = {
            tiers: []
        };

        this.setTiers(tiers);
    }

    /**
     * Sets the optional root `format_version`.
     */
    setFormatVersion(version: TradeTableFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Sets the optional table selection weight.
     */
    setWeight(weight: number): this {
        this.data.weight = weight;
        return this;
    }

    /**
     * Sets a root trade table property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Replaces all trade tiers.
     */
    setTiers(tiers: Array<TradeTier | TradeTierData>): this {
        this.data.tiers = tiers.map((tier) => toPlainObject<TradeTierData>(tier));
        return this;
    }

    /**
     * Adds a prebuilt tier or creates a new tier from `totalExpRequired`.
     */
    addTier(tier: TradeTier | TradeTierData): this;
    addTier(totalExpRequired?: number, configure?: (tier: TradeTier) => void): this;
    addTier(
        tierOrTotalExpRequired: TradeTier | TradeTierData | number = 0,
        configure: ((tier: TradeTier) => void) | undefined = undefined
    ): this {
        if (typeof tierOrTotalExpRequired === "number") {
            const tier = new TradeTier(tierOrTotalExpRequired);
            configure?.(tier);
            this.data.tiers.push(tier.toJson() as TradeTierData);
            return this;
        }

        this.data.tiers.push(toPlainObject<TradeTierData>(tierOrTotalExpRequired));
        return this;
    }

    /**
     * Adds a single direct trade in a new tier.
     */
    addSimpleTrade(
        wants: TradeItemInput | TradeItemInput[],
        gives: TradeItemInput | TradeItemInput[],
        options: TradeSingleOptions = {},
        totalExpRequired: number = 0
    ): this {
        return this.addTier(totalExpRequired, (tier) => {
            tier.addSimpleTrade(wants, gives, options);
        });
    }
}

/**
 * Fluent builder for a trade tier.
 *
 * Tiers should be ordered from lowest to highest `total_exp_required`; once
 * the game reaches a tier above the trader's experience, later tiers are not
 * checked.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/createtradetable
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradetier
 */
export class TradeTier extends GeneratorBase<TradeTier> {
    data: TradeTierData;

    /**
     * Creates a trade tier.
     */
    constructor(totalExpRequired: number = 0) {
        super();

        this.data = {
            total_exp_required: totalExpRequired
        };
    }

    /**
     * Sets the total trader experience required to unlock this tier.
     */
    setTotalExpRequired(totalExpRequired: number): this {
        this.data.total_exp_required = totalExpRequired;
        return this;
    }

    /**
     * Sets a tier property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Replaces all trade groups in this tier.
     */
    setGroups(groups: Array<TradeGroup | TradeGroupData>): this {
        this.data.groups = groups.map((group) => toPlainObject<TradeGroupData>(group));
        return this;
    }

    /**
     * Adds a prebuilt group or creates a new group from `numToSelect`.
     */
    addGroup(group: TradeGroup | TradeGroupData): this;
    addGroup(numToSelect?: number, configure?: (group: TradeGroup) => void): this;
    addGroup(
        groupOrNumToSelect: TradeGroup | TradeGroupData | number = 1,
        configure: ((group: TradeGroup) => void) | undefined = undefined
    ): this {
        const groups = this.data.groups ?? [];

        if (typeof groupOrNumToSelect === "number") {
            const group = new TradeGroup(groupOrNumToSelect);
            configure?.(group);
            groups.push(group.toJson() as TradeGroupData);
        } else {
            groups.push(toPlainObject<TradeGroupData>(groupOrNumToSelect));
        }

        this.data.groups = groups;
        return this;
    }

    /**
     * Replaces direct trades in this tier.
     */
    setTrades(trades: Array<Trade | TradeSingleData>): this {
        this.data.trades = trades.map((trade) => toPlainObject<TradeSingleData>(trade));
        return this;
    }

    /**
     * Adds a direct trade to this tier.
     */
    addTrade(trade: Trade | TradeSingleData): this {
        const trades = this.data.trades ?? [];
        trades.push(toPlainObject<TradeSingleData>(trade));
        this.data.trades = trades;
        return this;
    }

    /**
     * Creates, configures, and adds a direct trade to this tier.
     */
    addTradeWith(configure: (trade: Trade) => void): this {
        const trade = new Trade();
        configure(trade);
        return this.addTrade(trade);
    }

    /**
     * Adds a direct trade from wants and gives item lists.
     */
    addSimpleTrade(
        wants: TradeItemInput | TradeItemInput[],
        gives: TradeItemInput | TradeItemInput[],
        options: TradeSingleOptions = {}
    ): this {
        return this.addTrade(new Trade(wants, gives, options));
    }
}

/**
 * Fluent builder for a trade group.
 *
 * The game randomly offers `num_to_select` trades from the group's `trades`
 * array.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradegroup
 */
export class TradeGroup extends GeneratorBase<TradeGroup> {
    data: TradeGroupData;

    /**
     * Creates a trade group.
     */
    constructor(numToSelect: number = 1, trades: Array<Trade | TradeSingleData> = []) {
        super();

        this.data = {
            num_to_select: numToSelect,
            trades: []
        };

        this.setTrades(trades);
    }

    /**
     * Sets how many trades are selected from this group.
     */
    setNumToSelect(numToSelect: number): this {
        this.data.num_to_select = numToSelect;
        return this;
    }

    /**
     * Sets a group property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Replaces all possible trades in this group.
     */
    setTrades(trades: Array<Trade | TradeSingleData>): this {
        this.data.trades = trades.map((trade) => toPlainObject<TradeSingleData>(trade));
        return this;
    }

    /**
     * Adds a possible trade to this group.
     */
    addTrade(trade: Trade | TradeSingleData): this {
        const trades = this.data.trades ?? [];
        trades.push(toPlainObject<TradeSingleData>(trade));
        this.data.trades = trades;
        return this;
    }

    /**
     * Creates, configures, and adds a possible trade to this group.
     */
    addTradeWith(configure: (trade: Trade) => void): this {
        const trade = new Trade();
        configure(trade);
        return this.addTrade(trade);
    }

    /**
     * Adds a possible trade from wants and gives item lists.
     */
    addSimpleTrade(
        wants: TradeItemInput | TradeItemInput[],
        gives: TradeItemInput | TradeItemInput[],
        options: TradeSingleOptions = {}
    ): this {
        return this.addTrade(new Trade(wants, gives, options));
    }
}

/**
 * Fluent builder for a single trade.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradesingle
 */
export class Trade extends GeneratorBase<Trade> {
    data: TradeSingleData;

    /**
     * Creates a trade from optional wants, gives, and behavior options.
     */
    constructor(
        wants: TradeItemInput | TradeItemInput[] = [],
        gives: TradeItemInput | TradeItemInput[] = [],
        options: TradeSingleOptions = {}
    ) {
        super();

        this.data = {
            wants: [],
            gives: []
        };

        this.setWants(toArray(wants));
        this.setGives(toArray(gives));
        this.applyOptions(options);
    }

    private applyOptions(options: TradeSingleOptions): void {
        for (const [key, value] of Object.entries(options)) {
            this.data[key] = value;
        }
    }

    /**
     * Sets a trade property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Replaces the items the player must provide.
     */
    setWants(wants: TradeItemInput[]): this {
        this.data.wants = wants.map(toTradeItemData);
        return this;
    }

    /**
     * Adds an item the player must provide.
     */
    addWant(item: TradeItemInput, quantity: TradeItemQuantity | undefined = undefined): this {
        const wants = this.data.wants;
        wants.push(typeof item === "string" ? new TradeItem(item, quantity).toJson() as TradeItemData : toTradeItemData(item));
        return this;
    }

    /**
     * Replaces the items the trader gives.
     */
    setGives(gives: TradeItemInput[]): this {
        this.data.gives = gives.map(toTradeItemData);
        return this;
    }

    /**
     * Adds an item the trader gives.
     */
    addGive(item: TradeItemInput, quantity: TradeItemQuantity | undefined = undefined): this {
        const gives = this.data.gives;
        gives.push(typeof item === "string" ? new TradeItem(item, quantity).toJson() as TradeItemData : toTradeItemData(item));
        return this;
    }

    /**
     * Sets trader experience gained when this trade is completed.
     */
    setTraderExp(traderExp: number): this {
        this.data.trader_exp = traderExp;
        return this;
    }

    /**
     * Sets maximum uses before this trade locks until restock.
     */
    setMaxUses(maxUses: number): this {
        this.data.max_uses = maxUses;
        return this;
    }

    /**
     * Sets whether the player receives experience orbs for this trade.
     */
    setRewardExp(rewardExp: boolean): this {
        this.data.reward_exp = rewardExp;
        return this;
    }
}

/**
 * Fluent builder for a trade item.
 *
 * Trade items can be used in `wants`, `gives`, or `choice` arrays. Functions
 * use the same loot/trade table function objects as loot table entries.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradeitem
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export class TradeItem extends GeneratorBase<TradeItem> {
    data: TradeItemData;

    /**
     * Creates a trade item.
     */
    constructor(item: string, quantity: TradeItemQuantity | undefined = undefined) {
        super();

        this.data = {
            item
        };

        if (quantity !== undefined) {
            this.setQuantity(quantity);
        }
    }

    /**
     * Creates a trade item.
     */
    static item(item: string, quantity: TradeItemQuantity | undefined = undefined): TradeItem {
        return new TradeItem(item, quantity);
    }

    /**
     * Replaces the item identifier.
     */
    setItem(item: string): this {
        this.data.item = item;
        return this;
    }

    /**
     * Sets the fixed or random quantity used in the trade.
     */
    setQuantity(quantity: TradeItemQuantity): this {
        this.data.quantity = quantity;
        return this;
    }

    /**
     * Sets the supply-and-demand price multiplier.
     */
    setPriceMultiplier(priceMultiplier: number): this {
        this.data.price_multiplier = priceMultiplier;
        return this;
    }

    /**
     * Sets optional filters that must pass before this item is included.
     */
    setFilters(filters: EntityFilterGroup): this {
        this.data.filters = filters;
        return this;
    }

    /**
     * Sets a trade item property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Replaces alternative choice items.
     */
    setChoices(choices: TradeItemInput[]): this {
        this.data.choice = choices.map(toTradeItemData);
        return this;
    }

    /**
     * Adds an alternative choice item.
     */
    addChoice(item: TradeItemInput, quantity: TradeItemQuantity | undefined = undefined): this {
        const choices = this.data.choice ?? [];
        choices.push(typeof item === "string" ? new TradeItem(item, quantity).toJson() as TradeItemData : toTradeItemData(item));
        this.data.choice = choices;
        return this;
    }

    /**
     * Replaces all functions applied to this trade item.
     */
    setFunctions(functions: TradeItemFunctionData[]): this {
        this.data.functions = functions;
        return this;
    }

    /**
     * Adds a function object or function id.
     */
    addFunction(func: TradeItemFunctionData): this;
    addFunction(functionId: TradeItemFunctionId, data?: TradeItemFunctionOptions): this;
    addFunction(
        func: TradeItemFunctionData | TradeItemFunctionId,
        data: TradeItemFunctionOptions = {}
    ): this {
        const functions = this.data.functions ?? [];

        if (typeof func === "string") {
            functions.push({ function: func, ...data });
        } else {
            functions.push(func);
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
    addEnchantWithLevels(levels: TradeItemQuantity, treasure: boolean | undefined = undefined): this {
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
    addFurnaceSmelt(): this {
        return this.addFunction("furnace_smelt");
    }

    /**
     * Adds `looting_enchant`.
     */
    addLootingEnchant(count: TradeItemQuantity): this {
        return this.addFunction("looting_enchant", { count });
    }

    /**
     * Adds `random_aux_value`.
     */
    addRandomAuxValue(values: TradeItemQuantity): this {
        return this.addFunction("random_aux_value", { values });
    }

    /**
     * Adds `random_block_state`.
     */
    addRandomBlockState(blockState: string, values: TradeItemQuantity): this {
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
        patterns: TradeBannerPattern[] | undefined = undefined
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
    addSetCount(count: TradeItemQuantity): this {
        return this.addFunction("set_count", { count });
    }

    /**
     * Adds `set_damage`.
     */
    addSetDamage(damage: TradeItemQuantity): this {
        return this.addFunction("set_damage", { damage });
    }

    /**
     * Adds `set_data`.
     */
    addSetData(data: TradeItemQuantity): this {
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
    addSetOminousBottleAmplifier(amplifier: TradeItemQuantity): this {
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
    addSetStewEffect(effects: Array<number | TradeStewEffect>): this {
        return this.addFunction("set_stew_effect", { effects });
    }

    /**
     * Adds `specific_enchants`.
     */
    addSpecificEnchants(enchants: TradeSpecificEnchant | TradeSpecificEnchant[]): this {
        return this.addFunction("specific_enchants", { enchants: toArray(enchants) });
    }

    /**
     * Adds `trader_material_type`.
     */
    addTraderMaterialType(): this {
        return this.addFunction("trader_material_type");
    }
}
