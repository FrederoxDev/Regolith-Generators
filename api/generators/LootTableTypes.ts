/**
 * Numeric value accepted by loot table fields that can be fixed or ranged.
 *
 * Most current examples use `min` and `max`. The `match_tool` condition docs
 * also use `range_min` and `range_max`, so both forms are accepted.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_pool
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export interface LootNumberRange {
    /**
     * Minimum value in the range.
     */
    min?: number;

    /**
     * Maximum value in the range.
     */
    max?: number;

    /**
     * Minimum value used by some predicate-style loot conditions.
     */
    range_min?: number;

    /**
     * Maximum value used by some predicate-style loot conditions.
     */
    range_max?: number;
}

/**
 * Loot table number provider. A number is a fixed value; an object is a random
 * range selected by the game.
 */
export type LootNumberProvider = number | LootNumberRange;

/**
 * Root loot table JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_table
 */
export interface LootTableData {
    /**
     * Pools rolled independently to produce loot.
     */
    pools: LootPoolData[];

    /**
     * Future root loot table fields.
     */
    [key: string]: unknown;
}

/**
 * Tiered entry selection configuration for a loot pool.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_pool
 */
export interface LootPoolTiersData {
    /**
     * Upper bound for the starting tier position. The lower bound is always 1.
     */
    initial_range?: number;

    /**
     * Number of attempts to upgrade the selected tier.
     */
    bonus_rolls?: number;

    /**
     * Chance for each bonus roll to upgrade the selected tier.
     */
    bonus_chance?: number;
}

/**
 * Loot pool JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_pool
 */
export interface LootPoolData {
    /**
     * Number of times to roll this pool.
     */
    rolls?: LootNumberProvider;

    /**
     * Extra rolls added from luck.
     */
    bonus_rolls?: LootNumberProvider;

    /**
     * Entries that may be selected when the pool rolls.
     */
    entries: LootEntryData[];

    /**
     * Conditions that must pass before this pool rolls.
     */
    conditions?: LootConditionData[];

    /**
     * Optional tier selection rules.
     */
    tiers?: LootPoolTiersData;

    /**
     * Future or table-specific pool fields.
     */
    [key: string]: unknown;
}

/**
 * Built-in loot entry types. Additional string ids are accepted for forward
 * compatibility.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_entry
 */
export type LootEntryType =
    | "item"
    | "loot_table"
    | "empty"
    | (string & {});

/**
 * Loot table entry JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_entry
 */
export interface LootEntryData {
    /**
     * Entry type, such as `item`, `loot_table`, or `empty`.
     */
    type: LootEntryType;

    /**
     * Item identifier or referenced loot table path.
     */
    name?: string;

    /**
     * Relative chance for this entry to be selected.
     */
    weight?: number;

    /**
     * Luck modifier used by the runtime loot table API.
     */
    quality?: number;

    /**
     * Quantity used by trade-table style entries. Kept here because loot and
     * trade table functions are documented together by Microsoft.
     */
    quantity?: LootNumberProvider;

    /**
     * Functions applied to the selected entry.
     */
    functions?: LootFunctionData[];

    /**
     * Conditions that must pass before this entry can be selected.
     */
    conditions?: LootConditionData[];

    /**
     * Inline nested pools for `loot_table` entries.
     */
    pools?: LootPoolData[];

    /**
     * Future or table-specific entry fields.
     */
    [key: string]: unknown;
}

/**
 * Built-in loot function ids from the current content docs and script API.
 * Additional string ids are accepted for forward compatibility.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_function
 */
export type LootFunctionId =
    | "enchant_book_for_trading"
    | "enchant_random_gear"
    | "enchant_randomly"
    | "enchant_with_levels"
    | "exploration_map"
    | "explosion_decay"
    | "fill_container"
    | "furnace_smelt"
    | "looting_enchant"
    | "random_aux_value"
    | "random_block_state"
    | "random_dye"
    | "set_actor_id"
    | "set_armor_trim"
    | "set_banner_details"
    | "set_book_contents"
    | "set_count"
    | "set_damage"
    | "set_data"
    | "set_data_from_color_index"
    | "set_lore"
    | "set_name"
    | "set_nbt"
    | "set_ominous_bottle_amplifier"
    | "set_potion"
    | "set_stew_effect"
    | "minecraft:set_stew_effect"
    | "specific_enchants"
    | "trader_material_type"
    | (string & {});

/**
 * Specific enchantment descriptor accepted by `specific_enchants`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottabledefinitions/enchantingtables
 */
export type LootSpecificEnchant = string | {
    /**
     * Enchantment id.
     */
    id: string;

    /**
     * Enchantment level.
     */
    level?: number;

    /**
     * Future enchantment fields.
     */
    [key: string]: unknown;
};

/**
 * Banner pattern descriptor accepted by `set_banner_details`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export interface LootBannerPattern {
    /**
     * Pattern color.
     */
    color: string;

    /**
     * Pattern id.
     */
    pattern: string;
}

/**
 * Suspicious stew effect descriptor accepted by `set_stew_effect`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export interface LootStewEffect {
    /**
     * Effect id.
     */
    id: number;

    /**
     * Optional effect duration.
     */
    duration?: number;

    /**
     * Future stew effect fields.
     */
    [key: string]: unknown;
}

/**
 * Loot function JSON.
 *
 * The generated reference page lists the common cross-cutting fields. The
 * function tutorial and script API document additional function-specific fields
 * such as `loot_table`, `material`, `pattern`, and banner patterns.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_function
 * @see https://learn.microsoft.com/minecraft/creator/documents/lootandtradetablefunctions
 */
export interface LootFunctionData {
    /**
     * Function id.
     */
    function: LootFunctionId;

    /**
     * Conditions that must pass before this function applies.
     */
    conditions?: LootConditionData[];

    /**
     * Count used by `set_count` and `looting_enchant`.
     */
    count?: LootNumberProvider;

    /**
     * Data value used by `set_data`.
     */
    data?: LootNumberProvider;

    /**
     * Durability percentage used by `set_damage`.
     */
    damage?: LootNumberProvider;

    /**
     * Whether treasure enchantments may be selected.
     */
    treasure?: boolean;

    /**
     * Enchantment level range used by `enchant_with_levels`.
     */
    levels?: LootNumberProvider;

    /**
     * Entity id for `set_actor_id` or potion id for `set_potion`.
     */
    id?: string;

    /**
     * Exploration map destination.
     */
    destination?: string;

    /**
     * Referenced loot table used by `fill_container`.
     */
    loot_table?: string;

    /**
     * SNBT tag used by `set_nbt`.
     */
    tag?: string;

    /**
     * Base enchantment cost used by `enchant_book_for_trading`.
     */
    base_cost?: number;

    /**
     * Random base enchantment cost used by `enchant_book_for_trading`.
     */
    base_random_cost?: number;

    /**
     * Random per-level enchantment cost used by `enchant_book_for_trading`.
     */
    per_level_random_cost?: number;

    /**
     * Per-level enchantment cost used by `enchant_book_for_trading`.
     */
    per_level_cost?: number;

    /**
     * Chance used by `enchant_random_gear`.
     */
    chance?: number;

    /**
     * Range used by `random_aux_value` and `random_block_state`.
     */
    values?: LootNumberProvider;

    /**
     * Block state randomized by `random_block_state`.
     */
    block_state?: string;

    /**
     * Banner type used by `set_banner_details`.
     */
    type?: number | string;

    /**
     * Banner base color used by `set_banner_details`.
     */
    base_color?: string;

    /**
     * Banner patterns used by `set_banner_details`.
     */
    patterns?: LootBannerPattern[];

    /**
     * Written book author.
     */
    author?: string;

    /**
     * Written book title.
     */
    title?: string;

    /**
     * Written book page contents.
     */
    pages?: string[];

    /**
     * Item lore lines.
     */
    lore?: string[];

    /**
     * Item display name.
     */
    name?: string;

    /**
     * Specific enchantments. Current JSON examples use this property.
     */
    enchants?: LootSpecificEnchant[];

    /**
     * Specific enchantments. The script API describes the same concept with
     * this property name, so both forms are accepted.
     */
    enchantments?: LootSpecificEnchant[];

    /**
     * Armor trim material.
     */
    material?: string;

    /**
     * Armor trim pattern.
     */
    pattern?: string;

    /**
     * Ominous bottle amplifier range.
     */
    amplifier?: LootNumberProvider;

    /**
     * Suspicious stew effects.
     */
    effects?: Array<number | LootStewEffect>;

    /**
     * Future or function-specific fields.
     */
    [key: string]: unknown;
}

/**
 * Function properties without the required `function` discriminator.
 */
export type LootFunctionOptions = Omit<LootFunctionData, "function">;

/**
 * Entity selector target used by `entity_properties`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_condition
 */
export type LootEntityTarget =
    | "this"
    | "attacker"
    | "attacking_player"
    | (string & {});

/**
 * Built-in loot condition ids from the current condition docs and script API.
 * Additional string ids are accepted for forward compatibility.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_condition
 */
export type LootConditionId =
    | "damaged_by_entity"
    | "entity_killed"
    | "entity_properties"
    | "has_mark_variant"
    | "has_variant"
    | "is_baby"
    | "killed_by_entity"
    | "killed_by_player"
    | "killed_by_player_or_pets"
    | "match_tool"
    | "passenger_of_entity"
    | "random_chance"
    | "random_chance_with_looting"
    | "random_difficulty_chance"
    | "random_regional_difficulty_chance"
    | (string & {});

/**
 * Entity properties accepted by `entity_properties`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_condition
 */
export interface LootEntityProperties {
    /**
     * Whether the entity is on fire.
     */
    on_fire?: boolean;

    /**
     * Whether the entity is on the ground.
     */
    on_ground?: boolean;

    /**
     * Future entity property checks.
     */
    [key: string]: unknown;
}

/**
 * Enchantment predicate used by `match_tool`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export interface LootToolEnchantment {
    /**
     * Enchantment id.
     */
    enchantment: string;

    /**
     * Accepted enchantment level or range.
     */
    levels?: LootNumberProvider;

    /**
     * Future enchantment predicate fields.
     */
    [key: string]: unknown;
}

/**
 * Tool predicate used by `match_tool`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export interface LootMatchToolData {
    /**
     * Required item id.
     */
    item?: string;

    /**
     * Required item count.
     */
    count?: LootNumberProvider;

    /**
     * Required durability range.
     */
    durability?: LootNumberProvider;

    /**
     * Required enchantments.
     */
    enchantments?: LootToolEnchantment[];

    /**
     * Any matching item tag is accepted.
     */
    "minecraft:match_tool_filter_any"?: string[];

    /**
     * All listed item tags must be present.
     */
    "minecraft:match_tool_filter_all"?: string[];

    /**
     * None of the listed item tags may be present.
     */
    "minecraft:match_tool_filter_none"?: string[];

    /**
     * Future tool predicate fields.
     */
    [key: string]: unknown;
}

/**
 * Loot condition JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/loottablereference/examples/loottablecomponents/loot_condition
 * @see https://learn.microsoft.com/minecraft/creator/documents/loottableconditions
 */
export interface LootConditionData {
    /**
     * Condition id.
     */
    condition: LootConditionId;

    /**
     * Base probability used by chance conditions.
     */
    chance?: number;

    /**
     * Additional chance per looting level.
     */
    looting_multiplier?: number;

    /**
     * Variant or mark variant value.
     */
    value?: number;

    /**
     * Default probability used by `random_difficulty_chance`.
     */
    default_chance?: number;

    /**
     * Peaceful difficulty probability.
     */
    peaceful?: number;

    /**
     * Easy difficulty probability.
     */
    easy?: number;

    /**
     * Normal difficulty probability.
     */
    normal?: number;

    /**
     * Hard difficulty probability.
     */
    hard?: number;

    /**
     * Maximum chance used by `random_regional_difficulty_chance`.
     */
    max_chance?: number;

    /**
     * Entity target used by `entity_properties`.
     */
    entity?: LootEntityTarget;

    /**
     * Entity properties used by `entity_properties`.
     */
    properties?: LootEntityProperties;

    /**
     * Entity id used by entity-kill related conditions.
     */
    entity_type?: string;

    /**
     * Generated form shape for `match_tool`.
     */
    match_tool?: LootMatchToolData;

    /**
     * Direct `match_tool` item predicate used by the prose docs.
     */
    item?: string;

    /**
     * Direct `match_tool` count predicate used by the prose docs.
     */
    count?: LootNumberProvider;

    /**
     * Direct `match_tool` durability predicate used by the prose docs.
     */
    durability?: LootNumberProvider;

    /**
     * Direct `match_tool` enchantment predicates used by the prose docs.
     */
    enchantments?: LootToolEnchantment[];

    /**
     * Direct `match_tool` any-tag predicate used by the prose docs.
     */
    "minecraft:match_tool_filter_any"?: string[];

    /**
     * Direct `match_tool` all-tags predicate used by the prose docs.
     */
    "minecraft:match_tool_filter_all"?: string[];

    /**
     * Direct `match_tool` none-tags predicate used by the prose docs.
     */
    "minecraft:match_tool_filter_none"?: string[];

    /**
     * Future or condition-specific fields.
     */
    [key: string]: unknown;
}

/**
 * Condition properties without the required `condition` discriminator.
 */
export type LootConditionOptions = Omit<LootConditionData, "condition">;
