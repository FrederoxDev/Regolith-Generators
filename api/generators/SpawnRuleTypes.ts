import type { EntityFilterOperator, EntityFilterSubject } from "./EntityComponentTypes.ts";

/**
 * Version string used by spawn rules JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_rules_document
 */
export type SpawnRuleFormatVersion = string;

/**
 * Population control groups used by data-driven spawning.
 *
 * The docs list `animal`, `water_animal`, `monster`, and `cat` as the active
 * pools. `villager` and `pillager` exist in game files but are not currently
 * used by vanilla spawn rules.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/datadrivenspawning
 */
export type SpawnPopulationControl =
    | "animal"
    | "water_animal"
    | "monster"
    | "cat"
    | "villager"
    | "pillager"
    | (string & {});

/**
 * Difficulty values accepted by `minecraft:difficulty_filter`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_difficultyfilter
 */
export type SpawnDifficulty =
    | "peaceful"
    | "easy"
    | "normal"
    | "hard"
    | (string & {});

/**
 * Common biome tags used by `has_biome_tag` filters.
 *
 * Additional string tags are accepted so custom and future biome tags can be
 * used before this library is updated.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/biome_filter
 */
export type SpawnBiomeTag =
    | "animal"
    | "basalt_deltas"
    | "beach"
    | "bee_habitat"
    | "birch"
    | "caves"
    | "cherry_grove"
    | "cold"
    | "crimson_forest"
    | "dark_oak"
    | "deep"
    | "deep_dark"
    | "desert"
    | "dripstone_caves"
    | "edge"
    | "extreme_hills"
    | "flower_forest"
    | "forest"
    | "frozen"
    | "frozen_peaks"
    | "grove"
    | "hills"
    | "ice"
    | "ice_plains"
    | "jagged_peaks"
    | "jungle"
    | "lakes"
    | "lukewarm"
    | "lush_caves"
    | "mangrove_swamp"
    | "mega"
    | "mesa"
    | "monster"
    | "mooshroom_island"
    | "mountain"
    | "mutated"
    | "nether"
    | "nether_wastes"
    | "netherwart_forest"
    | "no_legacy_worldgen"
    | "ocean"
    | "overworld"
    | "overworld_generation"
    | "plains"
    | "plateau"
    | "rare"
    | "river"
    | "roofed"
    | "savanna"
    | "shore"
    | "snowy_slopes"
    | "soulsand_valley"
    | "spawn_endermen"
    | "spawn_few_piglins"
    | "spawn_few_zombified_piglins"
    | "spawn_ghast"
    | "spawn_magma_cubes"
    | "spawn_many_magma_cubes"
    | "spawn_piglin"
    | "spawn_zombified_piglin"
    | "stone"
    | "swamp"
    | "taiga"
    | "the_end"
    | "warm"
    | "warped_forest"
    | (string & {});

/**
 * A single spawn filter test.
 *
 * Filters are used by `minecraft:biome_filter` and follow the same test,
 * subject, operator, value, and domain pattern used by entity filters.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_biomeconditions
 */
export interface SpawnFilterTest {
    /**
     * Name of the test to apply, such as `has_biome_tag`.
     */
    test: string;

    /**
     * Subject of the test.
     */
    subject?: EntityFilterSubject | string;

    /**
     * Comparison operator.
     */
    operator?: EntityFilterOperator | string;

    /**
     * Value compared by the test.
     */
    value?: unknown;

    /**
     * Domain the test runs in.
     */
    domain?: string;

    /**
     * Future or filter-specific fields.
     */
    [key: string]: unknown;
}

/**
 * Spawn filter group using current and legacy group keys.
 *
 * Generated forms list `all_of`, `any_of`, `none_of`, `all`, `any`, `AND`,
 * `OR`, and `NOT`, so the type accepts all of them.
 */
export type SpawnFilterGroup = SpawnFilterTest | {
    /**
     * All child filters must pass.
     */
    all_of?: SpawnFilterGroup[];

    /**
     * Any child filter may pass.
     */
    any_of?: SpawnFilterGroup[];

    /**
     * No child filters may pass.
     */
    none_of?: SpawnFilterGroup[];

    /**
     * Legacy all-of group key.
     */
    all?: SpawnFilterGroup[];

    /**
     * Legacy any-of group key.
     */
    any?: SpawnFilterGroup[];

    /**
     * Legacy uppercase all-of group key.
     */
    AND?: SpawnFilterGroup | SpawnFilterGroup[];

    /**
     * Legacy uppercase any-of group key.
     */
    OR?: SpawnFilterGroup | SpawnFilterGroup[];

    /**
     * Legacy uppercase none-of group key.
     */
    NOT?: SpawnFilterGroup | SpawnFilterGroup[];

    /**
     * Future group keys.
     */
    [key: string]: unknown;
};

/**
 * Biome filter accepted by `minecraft:biome_filter`.
 */
export type SpawnBiomeFilter = SpawnFilterGroup | SpawnFilterGroup[];

/**
 * Block descriptor accepted by spawn block filters.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_spawnaboveblockfilter
 */
export interface SpawnBlockDescriptor {
    /**
     * Block identifier.
     */
    name?: string;

    /**
     * Block states used by this descriptor.
     */
    states?: Record<string, string | number | boolean> | string | number | boolean;

    /**
     * Block tags query.
     */
    tags?: string;

    /**
     * Future block descriptor fields.
     */
    [key: string]: unknown;
}

/**
 * Value accepted by `minecraft:spawns_on_block_filter`.
 */
export type SpawnBlockFilter = string | string[] | SpawnBlockDescriptor | SpawnBlockDescriptor[];

/**
 * Value accepted by `minecraft:spawns_on_block_prevented_filter`.
 */
export type SpawnBlockedBlockFilter = string | string[];

/**
 * Root spawn rules document JSON.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_rules_document
 */
export interface SpawnRulesDocumentData {
    /**
     * File format version.
     */
    format_version: SpawnRuleFormatVersion;

    /**
     * Spawn rules definition container.
     */
    "minecraft:spawn_rules": SpawnRulesData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:spawn_rules` container.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_rules
 */
export interface SpawnRulesData {
    /**
     * Entity description for these spawn rules.
     */
    description: SpawnDescriptionData;

    /**
     * Spawn condition entries.
     */
    conditions: SpawnConditionData[];

    /**
     * Future spawn rule fields.
     */
    [key: string]: unknown;
}

/**
 * Spawn rules description block.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_description
 */
export interface SpawnDescriptionData {
    /**
     * Entity identifier these rules apply to.
     */
    identifier: string;

    /**
     * Population control pool.
     */
    population_control: SpawnPopulationControl;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Light-level filter.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_brightnessfilter
 */
export interface SpawnBrightnessFilterData {
    /**
     * Minimum light level.
     */
    min?: number;

    /**
     * Maximum light level.
     */
    max?: number;

    /**
     * Whether weather modifies the effective brightness.
     */
    adjust_for_weather?: boolean;

    /**
     * Future brightness fields.
     */
    [key: string]: unknown;
}

/**
 * Spawn delay filter.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_delayfilter
 */
export interface SpawnDelayFilterData {
    /**
     * Optional delay identifier.
     */
    identifier?: string;

    /**
     * Minimum delay.
     */
    min?: number;

    /**
     * Maximum delay.
     */
    max?: number;

    /**
     * Percent chance to spawn after the delay.
     */
    spawn_chance?: number;

    /**
     * Future delay fields.
     */
    [key: string]: unknown;
}

/**
 * Density limit filter.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_densitylimit
 */
export interface SpawnDensityLimitData {
    /**
     * Surface spawn cap. `-1` means unlimited.
     */
    surface?: number;

    /**
     * Underground spawn cap. `-1` means unlimited.
     */
    underground?: number;

    /**
     * Future density fields.
     */
    [key: string]: unknown;
}

/**
 * Difficulty filter.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_difficultyfilter
 */
export interface SpawnDifficultyFilterData {
    /**
     * Minimum difficulty.
     */
    min?: SpawnDifficulty;

    /**
     * Maximum difficulty.
     */
    max?: SpawnDifficulty;

    /**
     * Future difficulty fields.
     */
    [key: string]: unknown;
}

/**
 * Distance or height range filter.
 */
export interface SpawnRangeFilterData {
    /**
     * Minimum value.
     */
    min?: number;

    /**
     * Maximum value.
     */
    max?: number;

    /**
     * Future range fields.
     */
    [key: string]: unknown;
}

/**
 * Herd spawning configuration.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_herd
 */
export interface SpawnHerdData {
    /**
     * Minimum group size.
     */
    min_size?: number;

    /**
     * Maximum group size.
     */
    max_size?: number;

    /**
     * Event run after `event_skip_count` spawned entities.
     */
    event?: string;

    /**
     * Number of spawned entities to skip before running `event`.
     */
    event_skip_count?: number;

    /**
     * Event run for the first `initial_event_count` spawned entities.
     */
    initial_event?: string;

    /**
     * Number of spawned entities that receive `initial_event`.
     */
    initial_event_count?: number;

    /**
     * Future herd fields.
     */
    [key: string]: unknown;
}

/**
 * Mob event or spawn event data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_mobeventfilter
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/spawn_event
 */
export interface SpawnMobEventFilterData {
    /**
     * Mob event or entity event id.
     */
    event?: string;

    /**
     * Future mob-event fields.
     */
    [key: string]: unknown;
}

/**
 * Weighted entity type permutation.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_permutetype
 */
export interface SpawnPermuteTypeData {
    /**
     * Relative selection weight.
     */
    weight: number;

    /**
     * Entity type to spawn when this permutation is selected.
     */
    entity_type?: string;

    /**
     * Minimum guaranteed count from this permutation.
     */
    min_guaranteed?: number;

    /**
     * Legacy docs also call this field `guaranteed_count`.
     */
    guaranteed_count?: number;

    /**
     * Future permutation fields.
     */
    [key: string]: unknown;
}

/**
 * Player-in-village filter.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_playerinvillagefilter
 */
export interface SpawnPlayerInVillageFilterData {
    /**
     * Distance from village.
     */
    distance: number;

    /**
     * Village border tolerance.
     */
    village_border_tolerance?: number;

    /**
     * Future village filter fields.
     */
    [key: string]: unknown;
}

/**
 * Deprecated above-block filter.
 *
 * @deprecated Microsoft notes this no longer works after format versions of at
 * least 1.18.0.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_spawnaboveblockfilter
 */
export interface SpawnAboveBlockFilterData {
    /**
     * Blocks above the spawn point.
     */
    blocks?: SpawnBlockFilter;

    /**
     * Distance above the spawn point.
     */
    distance?: number;

    /**
     * Future above-block fields.
     */
    [key: string]: unknown;
}

/**
 * Spawn weight configuration.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_weight
 */
export interface SpawnWeightData {
    /**
     * Default relative spawn weight.
     */
    default: number;

    /**
     * Optional rarity adjustment.
     */
    rarity?: number;

    /**
     * Future weight fields.
     */
    [key: string]: unknown;
}

/**
 * One entry in the `conditions` array.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_biomeconditions
 */
export interface SpawnConditionData {
    /**
     * Biome filter for this spawn condition.
     */
    "minecraft:biome_filter"?: SpawnBiomeFilter;

    /**
     * Blocks this entity may spawn on.
     */
    "minecraft:spawns_on_block_filter"?: SpawnBlockFilter;

    /**
     * Blocks this entity may not spawn on.
     */
    "minecraft:spawns_on_block_prevented_filter"?: SpawnBlockedBlockFilter;

    /**
     * Herd configuration.
     */
    "minecraft:herd"?: SpawnHerdData | SpawnHerdData[];

    /**
     * Weighted type permutations.
     */
    "minecraft:permute_type"?: SpawnPermuteTypeData | SpawnPermuteTypeData[];

    /**
     * Brightness filter.
     */
    "minecraft:brightness_filter"?: SpawnBrightnessFilterData;

    /**
     * Spawn delay filter.
     */
    "minecraft:delay_filter"?: SpawnDelayFilterData;

    /**
     * Density limit filter.
     */
    "minecraft:density_limit"?: SpawnDensityLimitData;

    /**
     * Difficulty filter.
     */
    "minecraft:difficulty_filter"?: SpawnDifficultyFilterData;

    /**
     * Distance-from-player filter.
     */
    "minecraft:distance_filter"?: SpawnRangeFilterData;

    /**
     * Height filter.
     */
    "minecraft:height_filter"?: SpawnRangeFilterData;

    /**
     * Mob event filter.
     */
    "minecraft:mob_event_filter"?: SpawnMobEventFilterData;

    /**
     * Player-in-village filter.
     */
    "minecraft:player_in_village_filter"?: SpawnPlayerInVillageFilterData;

    /**
     * Spawn event fired when this condition spawns the entity.
     */
    "minecraft:spawn_event"?: SpawnMobEventFilterData;

    /**
     * Deprecated above-block filter.
     *
     * @deprecated Microsoft notes this no longer works after format versions of
     * at least 1.18.0.
     */
    "minecraft:spawns_above_block_filter"?: SpawnAboveBlockFilterData;

    /**
     * Spawn weight.
     */
    "minecraft:weight"?: SpawnWeightData;

    /**
     * World age filter.
     */
    "minecraft:world_age_filter"?: SpawnRangeFilterData;

    /**
     * Allows spawning on the world surface.
     */
    "minecraft:spawns_on_surface"?: Record<string, never>;

    /**
     * Allows spawning underground.
     */
    "minecraft:spawns_underground"?: Record<string, never>;

    /**
     * Allows spawning underwater.
     */
    "minecraft:spawns_underwater"?: Record<string, never>;

    /**
     * Allows spawning in lava.
     */
    "minecraft:spawns_lava"?: Record<string, never>;

    /**
     * Prevents spawning in bubble columns.
     */
    "minecraft:disallow_spawns_in_bubble"?: Record<string, never>;

    /**
     * Marks this spawn condition as experimental.
     */
    "minecraft:is_experimental"?: Record<string, never>;

    /**
     * Makes spawned entities persistent.
     */
    "minecraft:is_persistent"?: Record<string, never>;

    /**
     * Future or vanilla-specific condition fields.
     */
    [key: string]: unknown;
}

/**
 * Documented spawn rule component ids.
 */
export type SpawnConditionComponentId =
    | "minecraft:biome_filter"
    | "minecraft:spawns_on_block_filter"
    | "minecraft:spawns_on_block_prevented_filter"
    | "minecraft:herd"
    | "minecraft:permute_type"
    | "minecraft:brightness_filter"
    | "minecraft:delay_filter"
    | "minecraft:density_limit"
    | "minecraft:difficulty_filter"
    | "minecraft:distance_filter"
    | "minecraft:height_filter"
    | "minecraft:mob_event_filter"
    | "minecraft:player_in_village_filter"
    | "minecraft:spawn_event"
    | "minecraft:spawns_above_block_filter"
    | "minecraft:weight"
    | "minecraft:world_age_filter"
    | "minecraft:spawns_on_surface"
    | "minecraft:spawns_underground"
    | "minecraft:spawns_underwater"
    | "minecraft:spawns_lava"
    | "minecraft:disallow_spawns_in_bubble"
    | "minecraft:is_experimental"
    | "minecraft:is_persistent"
    | (string & {});
