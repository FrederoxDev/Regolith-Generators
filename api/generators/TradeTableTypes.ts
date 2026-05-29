import type { EntityFilterGroup } from "./EntityComponentTypes.ts";
import type {
    LootBannerPattern,
    LootFunctionData,
    LootFunctionId,
    LootFunctionOptions,
    LootNumberProvider,
    LootSpecificEnchant,
    LootStewEffect
} from "./LootTableTypes.ts";

/**
 * Version string used by trade table JSON files.
 *
 * The current tutorial examples omit `format_version`; it is still listed by
 * the generated reference, so the API exposes it without forcing a default.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/trade
 */
export type TradeTableFormatVersion = string;

/**
 * Quantity for an item in a trade. A number is fixed; an object with `min` and
 * `max` lets the game randomly choose the quantity.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradeitem_quantity
 */
export type TradeItemQuantity = LootNumberProvider;

/**
 * Loot/trade table function ids accepted by trade item `functions`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export type TradeItemFunctionId = LootFunctionId;

/**
 * Loot/trade table function data accepted by trade item `functions`.
 */
export type TradeItemFunctionData = LootFunctionData;

/**
 * Loot/trade table function options without the required function id.
 */
export type TradeItemFunctionOptions = LootFunctionOptions;

/**
 * Root trade table JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/trade
 */
export interface TradeTableData {
    /**
     * Trade tiers unlocked as the trader gains trading experience.
     */
    tiers: TradeTierData[];

    /**
     * Optional table selection weight.
     */
    weight?: number;

    /**
     * Optional table format version.
     */
    format_version?: TradeTableFormatVersion;

    /**
     * Future or vanilla-specific root fields.
     */
    [key: string]: unknown;
}

/**
 * A tier of trades unlocked by total trader experience.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradetier
 */
export interface TradeTierData {
    /**
     * Total trader experience required to unlock this tier. The first tier is
     * always available even when this value is omitted or greater than zero.
     */
    total_exp_required?: number;

    /**
     * Random trade groups available at this tier.
     */
    groups?: TradeGroupData[];

    /**
     * Direct trades available at this tier, without grouping.
     */
    trades?: TradeSingleData[];

    /**
     * Future or vanilla-specific tier fields.
     */
    [key: string]: unknown;
}

/**
 * A group of possible trades where `num_to_select` controls how many trades
 * are offered from the group.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradegroup
 */
export interface TradeGroupData {
    /**
     * Number of trades randomly selected from this group.
     */
    num_to_select?: number;

    /**
     * Possible trades in this group.
     */
    trades?: TradeSingleData[];

    /**
     * Future or vanilla-specific group fields.
     */
    [key: string]: unknown;
}

/**
 * A single trade offered by a villager-style trader.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradesingle
 */
export interface TradeSingleData {
    /**
     * Items the player must provide.
     */
    wants: TradeItemData[];

    /**
     * Items the trader gives to the player.
     */
    gives: TradeItemData[];

    /**
     * Experience the trader gains when the trade is completed.
     */
    trader_exp?: number;

    /**
     * Maximum uses before the trade locks until restock.
     */
    max_uses?: number;

    /**
     * Whether the player receives experience orbs for this trade.
     */
    reward_exp?: boolean;

    /**
     * Future or vanilla-specific trade fields.
     */
    [key: string]: unknown;
}

/**
 * Options for constructing or configuring a single trade.
 */
export interface TradeSingleOptions {
    /**
     * Experience the trader gains when the trade is completed.
     */
    trader_exp?: number;

    /**
     * Maximum uses before the trade locks until restock.
     */
    max_uses?: number;

    /**
     * Whether the player receives experience orbs for this trade.
     */
    reward_exp?: boolean;

    /**
     * Future or vanilla-specific trade fields.
     */
    [key: string]: unknown;
}

/**
 * Item used by a trade as input or output.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/tradetablereference/examples/tradetablecomponents/tradeitem
 */
export interface TradeItemData {
    /**
     * Item identifier. Vanilla tables may include legacy data suffixes such as
     * `minecraft:coal:0`.
     */
    item: string;

    /**
     * Quantity used in the trade.
     */
    quantity?: TradeItemQuantity;

    /**
     * Price multiplier used for supply and demand changes.
     */
    price_multiplier?: number;

    /**
     * Optional filters that must pass before this item is included.
     */
    filters?: EntityFilterGroup;

    /**
     * Functions applied to this trade item.
     */
    functions?: TradeItemFunctionData[];

    /**
     * Alternative items that can satisfy or be produced by this trade item.
     */
    choice?: TradeItemData[];

    /**
     * Future or vanilla-specific trade item fields.
     */
    [key: string]: unknown;
}

/**
 * Specific enchantment descriptor accepted by `specific_enchants` on trade
 * items.
 */
export type TradeSpecificEnchant = LootSpecificEnchant;

/**
 * Banner pattern descriptor accepted by `set_banner_details` on trade items.
 */
export type TradeBannerPattern = LootBannerPattern;

/**
 * Suspicious stew effect descriptor accepted by `set_stew_effect` on trade
 * items.
 */
export type TradeStewEffect = LootStewEffect;
