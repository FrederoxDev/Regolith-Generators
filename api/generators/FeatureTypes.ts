import type { EntityFilterOperator, EntityFilterSubject } from "./EntityComponentTypes.ts";

/**
 * Version string used by feature and feature rule JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/feature_document
 */
export type FeatureFormatVersion = string;

/**
 * Version string used by feature rule JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featurerulesreference/examples/featurerulescomponents/feature_rules_document
 */
export type FeatureRuleFormatVersion = string;

/**
 * Namespaced feature or feature rule identifier.
 */
export type FeatureIdentifier = string;

/**
 * Named reference to another feature.
 */
export type FeatureReference = string;

/**
 * String or numeric Molang value accepted by feature distributions.
 */
export type FeatureMolangValue = string | number;

/**
 * Three-dimensional offset vector.
 */
export type FeatureVector3 = [number, number, number];

/**
 * Supported feature definition keys.
 *
 * The internal/deprecated feature types listed in the Microsoft docs are kept
 * out of this union so autocomplete focuses on custom-content-safe features.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featurelist
 */
export type FeatureType =
    | "minecraft:aggregate_feature"
    | "minecraft:cave_carver_feature"
    | "minecraft:fossil_feature"
    | "minecraft:geode_feature"
    | "minecraft:growing_plant_feature"
    | "minecraft:height_difference_filter_feature"
    | "minecraft:multiface_feature"
    | "minecraft:nether_cave_carver_feature"
    | "minecraft:ore_feature"
    | "minecraft:partially_exposed_blob_feature"
    | "minecraft:scatter_feature"
    | "minecraft:search_feature"
    | "minecraft:sequence_feature"
    | "minecraft:single_block_feature"
    | "minecraft:snap_to_surface_feature"
    | "minecraft:structure_template_feature"
    | "minecraft:surface_relative_threshold_feature"
    | "minecraft:tree_feature"
    | "minecraft:underwater_cave_carver_feature"
    | "minecraft:vegetation_patch_feature"
    | "minecraft:weighted_random_feature";

/**
 * Internal or deprecated feature ids documented by Microsoft, but not intended
 * for custom content.
 *
 * @deprecated Microsoft lists these as internal, deprecated, or unsupported.
 */
export type InternalFeatureType =
    | "minecraft:beards_and_shavers"
    | "minecraft:conditional_list"
    | "minecraft:rect_layout"
    | "minecraft:scan_surface"
    | "minecraft:sculk_patch_feature";

/**
 * Root feature definition document.
 */
export interface FeatureDocumentData<TFeatureData extends FeatureDefinitionData = FeatureDefinitionData> {
    /**
     * File format version.
     */
    format_version: FeatureFormatVersion;

    /**
     * The single feature definition keyed by its feature type.
     */
    [key: string]: FeatureFormatVersion | TFeatureData | unknown;
}

/**
 * Shared `description` object used by every feature type.
 */
export interface FeatureDescriptionData {
    /**
     * Feature identifier. The identifier's name part must match the filename.
     */
    identifier: FeatureIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Base shape shared by all feature definitions.
 */
export interface FeatureDefinitionData {
    /**
     * Feature description.
     */
    description: FeatureDescriptionData;

    /**
     * Future or feature-specific fields.
     */
    [key: string]: unknown;
}

/**
 * Block descriptor accepted by feature block fields.
 */
export interface FeatureBlockDescriptor {
    /**
     * Block identifier.
     */
    name?: string;

    /**
     * Block states.
     */
    states?: Record<string, string | number | boolean> | string | number | boolean;

    /**
     * Block tag query.
     */
    tags?: string;

    /**
     * Future block descriptor fields.
     */
    [key: string]: unknown;
}

/**
 * Block reference accepted by feature definitions.
 */
export type FeatureBlockReference = string | FeatureBlockDescriptor;

/**
 * One or more block references.
 */
export type FeatureBlockReferenceList = FeatureBlockReference | FeatureBlockReference[];

/**
 * Numeric range used by several feature distributions.
 */
export interface FeatureNumberRange {
    /**
     * Inclusive minimum.
     */
    range_min: number;

    /**
     * Inclusive maximum.
     */
    range_max: number;

    /**
     * Future range fields.
     */
    [key: string]: unknown;
}

/**
 * Fixed number, Molang expression, or range object.
 */
export type FeatureRangeValue = number | string | FeatureNumberRange;

/**
 * Weighted feature reference tuple.
 */
export type FeatureWeightedReference = [FeatureReference, number];

/**
 * Weighted block tuple used by growing plants.
 */
export type FeatureWeightedBlock = [FeatureBlockReference, number];

/**
 * Weighted range tuple used by growing plant height selection.
 */
export type FeatureWeightedRange = [FeatureRangeValue, number];

/**
 * Supported coordinate evaluation orders.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#coordinate-evaluation-order
 */
export type FeatureCoordinateEvalOrder =
    | "xyz"
    | "xzy"
    | "yxz"
    | "yzx"
    | "zxy"
    | "zyx";

/**
 * Supported random distribution types for feature coordinate ranges.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#random-distribution-type
 */
export type FeatureRandomDistributionType =
    | "uniform"
    | "gaussian"
    | "inverse_gaussian"
    | "triangle"
    | "fixed_grid"
    | "jittered_grid"
    | (string & {});

/**
 * Coordinate range object used by scatter distributions.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#coordinate-range
 */
export interface FeatureCoordinateRangeData {
    /**
     * Distribution type.
     */
    distribution: FeatureRandomDistributionType;

    /**
     * Lower and upper bounds, as offsets from the input point.
     */
    extent: [number, number];

    /**
     * Grid offset for grid distributions.
     */
    grid_offset?: number;

    /**
     * Step size for grid distributions.
     */
    step_size?: number;

    /**
     * Future coordinate range fields.
     */
    [key: string]: unknown;
}

/**
 * Coordinate distribution value. Coordinates may be fixed numbers, Molang
 * expressions, or distribution objects.
 */
export type FeatureCoordinateDistribution = number | string | FeatureCoordinateRangeData;

/**
 * Scatter probability represented as a fraction.
 */
export interface FeatureScatterChanceData {
    /**
     * Probability numerator.
     */
    numerator: number;

    /**
     * Probability denominator.
     */
    denominator: number;

    /**
     * Future scatter chance fields.
     */
    [key: string]: unknown;
}

/**
 * Scatter probability accepted by feature and feature rule distributions.
 */
export type FeatureScatterChance = number | string | FeatureScatterChanceData;

/**
 * Scatter distribution parameters.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#scatter-params
 */
export interface FeatureScatterDistributionData {
    /**
     * Number of scattered positions to generate.
     */
    iterations?: number | string;

    /**
     * Probability that this scatter will occur.
     */
    scatter_chance?: FeatureScatterChance;

    /**
     * Coordinate evaluation order.
     */
    coordinate_eval_order?: FeatureCoordinateEvalOrder;

    /**
     * X coordinate distribution.
     */
    x?: FeatureCoordinateDistribution;

    /**
     * Y coordinate distribution.
     */
    y?: FeatureCoordinateDistribution;

    /**
     * Z coordinate distribution.
     */
    z?: FeatureCoordinateDistribution;

    /**
     * Future distribution fields.
     */
    [key: string]: unknown;
}

/**
 * Feature that places several child features at the same input position.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_aggregate_feature
 */
export interface FeatureAggregateData extends FeatureDefinitionData {
    /**
     * Child features to place.
     */
    features: FeatureReference[];

    /**
     * Stops placement after a first success or failure.
     */
    early_out?: "none" | "first_failure" | "first_success" | (string & {});
}

/**
 * Shared cave carver data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_cave_carver_feature
 */
export interface FeatureCarverData extends FeatureDefinitionData {
    /**
     * Block to fill the carved cave with.
     */
    fill_with?: FeatureBlockReference;

    /**
     * How much to increase the cave radius.
     */
    width_modifier?: FeatureMolangValue;

    /**
     * Chance to skip carving, expressed as `1 / value`.
     */
    skip_carve_chance?: number;

    /**
     * Height limit where carving is attempted.
     */
    height_limit?: number;

    /**
     * Y scale.
     */
    y_scale?: FeatureRangeValue;

    /**
     * Horizontal radius multiplier.
     */
    horizontal_radius_multiplier?: FeatureRangeValue;

    /**
     * Vertical radius multiplier.
     */
    vertical_radius_multiplier?: FeatureRangeValue;

    /**
     * Floor level.
     */
    floor_level?: FeatureRangeValue;
}

/**
 * Fossil feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_fossil_feature
 */
export interface FeatureFossilData extends FeatureDefinitionData {
    /**
     * Ore block used in the fossil.
     */
    ore_block?: FeatureBlockReference;

    /**
     * Maximum empty corners allowed.
     */
    max_empty_corners: number;
}

/**
 * Geode feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_geode_feature
 */
export interface FeatureGeodeData extends FeatureDefinitionData {
    filler?: FeatureBlockReference;
    inner_layer?: FeatureBlockReference;
    alternate_inner_layer?: FeatureBlockReference;
    middle_layer?: FeatureBlockReference;
    outer_layer?: FeatureBlockReference;
    inner_placements?: FeatureBlockReference[];
    min_outer_wall_distance?: number;
    max_outer_wall_distance?: number;
    min_distribution_points?: number;
    max_distribution_points?: number;
    min_point_offset?: number;
    max_point_offset?: number;
    max_radius?: number;
    crack_point_offset?: number;
    generate_crack_chance?: number;
    base_crack_size?: number;
    noise_multiplier?: number;
    use_potential_placements_chance?: number;
    use_alternate_layer0_chance?: number;
    placements_require_layer0_alternate?: boolean;
    invalid_blocks_threshold?: number;
}

/**
 * Growing plant feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_growing_plant_feature
 */
export interface FeatureGrowingPlantData extends FeatureDefinitionData {
    height_distribution: FeatureWeightedRange[];
    growth_direction: "UP" | "DOWN" | (string & {});
    body_blocks: FeatureWeightedBlock[];
    head_blocks: FeatureWeightedBlock[];
    age?: FeatureRangeValue;
    allow_water?: boolean;
}

/**
 * Height-difference filter feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_height_difference_filter_feature
 */
export interface FeatureHeightDifferenceFilterData extends FeatureDefinitionData {
    search_radius: number;
    min_required_upward_height_diff?: number;
    min_required_downward_height_diff?: number;
    max_allowed_upward_height_diff?: number;
    max_allowed_downward_height_diff?: number;
}

/**
 * Multiface feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_multiface_feature
 */
export interface FeatureMultifaceData extends FeatureDefinitionData {
    places_block: FeatureBlockReference;
    search_range: number;
    can_place_on_floor: boolean;
    can_place_on_ceiling: boolean;
    can_place_on_wall: boolean;
    chance_of_spreading?: number;
    can_place_on?: FeatureBlockReference[];
}

/**
 * Ore replacement rule.
 */
export interface FeatureOreReplaceRuleData {
    /**
     * Block to place when this rule matches.
     */
    places_block: FeatureBlockReference;

    /**
     * Blocks this rule may replace.
     */
    may_replace?: FeatureBlockReference[];

    /**
     * Future rule fields.
     */
    [key: string]: unknown;
}

/**
 * Ore feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_ore_feature
 */
export interface FeatureOreData extends FeatureDefinitionData {
    count: number;
    replace_rules: FeatureOreReplaceRuleData[];
    discard_chance_on_air_exposure?: number;
}

/**
 * Partially exposed blob feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_partially_exposed_blob_feature
 */
export interface FeaturePartiallyExposedBlobData extends FeatureDefinitionData {
    places_block: FeatureBlockReference;
    placement_radius_around_floor: number;
    placement_probability_per_valid_position: number;
    exposed_face?: "up" | "down" | "north" | "south" | "east" | "west" | (string & {});
}

/**
 * Scatter feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_scatter_feature
 */
export interface FeatureScatterData extends FeatureDefinitionData {
    places_feature: FeatureReference;
    distribution: FeatureScatterDistributionData;
    project_input_to_floor?: boolean;
}

/**
 * Search volume used by `minecraft:search_feature`.
 */
export interface FeatureSearchVolumeData {
    min: FeatureVector3;
    max: FeatureVector3;
    [key: string]: unknown;
}

/**
 * Search axis used by `minecraft:search_feature`.
 */
export type FeatureSearchAxis = "-x" | "+x" | "-y" | "+y" | "-z" | "+z" | (string & {});

/**
 * Search feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_search_feature
 */
export interface FeatureSearchData extends FeatureDefinitionData {
    places_feature: FeatureReference;
    search_volume: FeatureSearchVolumeData;
    search_axis: FeatureSearchAxis;
    required_successes?: number;
}

/**
 * Sequence feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_sequence_feature
 */
export interface FeatureSequenceData extends FeatureDefinitionData {
    features: FeatureReference[];
}

/**
 * Side attachment rules for `minecraft:single_block_feature`.
 */
export interface FeatureSingleBlockAttachData {
    min_sides_must_attach?: number;
    auto_rotate?: boolean;
    top?: FeatureBlockReferenceList;
    bottom?: FeatureBlockReferenceList;
    north?: FeatureBlockReferenceList;
    south?: FeatureBlockReferenceList;
    east?: FeatureBlockReferenceList;
    west?: FeatureBlockReferenceList;
    sides?: FeatureBlockReferenceList;
    diagonal?: FeatureBlockReferenceList;
    all?: FeatureBlockReferenceList;
    [key: string]: unknown;
}

/**
 * Weighted block entry used by `minecraft:single_block_feature`.
 */
export interface FeatureSingleBlockWeightedBlockData {
    block: FeatureBlockReference;
    weight: number;
    [key: string]: unknown;
}

/**
 * Block placement value accepted by `minecraft:single_block_feature`.
 */
export type FeatureSingleBlockPlacement =
    | FeatureBlockReference
    | FeatureBlockReference[]
    | FeatureSingleBlockWeightedBlockData[];

/**
 * Single block feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_single_block_feature
 */
export interface FeatureSingleBlockData extends FeatureDefinitionData {
    places_block: FeatureSingleBlockPlacement;
    enforce_placement_rules?: boolean;
    enforce_survivability_rules?: boolean;
    randomize_rotation?: boolean;
    may_attach_to?: FeatureSingleBlockAttachData;
    may_not_attach_to?: FeatureSingleBlockAttachData;
    may_replace?: FeatureBlockReference[];
}

/**
 * Surface target for `minecraft:snap_to_surface_feature`.
 */
export type FeatureSnapSurface = "ceiling" | "floor" | "random_horizontal" | (string & {});

/**
 * Snap-to-surface feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_snap_to_surface_feature
 */
export interface FeatureSnapToSurfaceData extends FeatureDefinitionData {
    feature_to_snap: FeatureReference;
    vertical_search_range: number;
    surface?: FeatureSnapSurface;
    allow_air_placement?: boolean;
    allow_underwater_placement?: boolean;
    allowed_surface_blocks?: FeatureBlockReference[];
    embed_in_surface?: boolean;
}

/**
 * Structure facing direction.
 */
export type FeatureStructureFacingDirection =
    | "north"
    | "south"
    | "east"
    | "west"
    | "random"
    | (string & {});

/**
 * Structure template placement constraints.
 */
export interface FeatureStructureConstraintsData {
    grounded?: Record<string, unknown>;
    unburied?: Record<string, unknown>;
    block_intersection?: {
        block_allowlist?: FeatureBlockReference[];
        block_whitelist?: FeatureBlockReference[];
        only_check_intersection_for_motion_blocking_blocks?: boolean;
        [key: string]: unknown;
    };
    leveled?: {
        max_steepness?: number;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

/**
 * Structure template feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_structure_template_feature
 */
export interface FeatureStructureTemplateData extends FeatureDefinitionData {
    structure_name: string;
    adjustment_radius?: number;
    facing_direction?: FeatureStructureFacingDirection;
    constraints?: FeatureStructureConstraintsData;
    ground_level?: number;
    rotate_around_center?: boolean;
}

/**
 * Surface-relative threshold feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_surface_relative_threshold_feature
 */
export interface FeatureSurfaceRelativeThresholdData extends FeatureDefinitionData {
    feature_to_place: FeatureReference;
    minimum_distance_below_surface?: number;
}

/**
 * Tree feature data.
 *
 * Tree features have a large set of trunk, canopy, root, and decoration
 * sub-objects. The top-level documented fields are named here and each nested
 * object remains open so vanilla and future tree shapes can be represented.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_tree_feature
 */
export interface FeatureTreeData extends FeatureDefinitionData {
    base_block?: FeatureBlockReferenceList;
    base_cluster?: Record<string, unknown>;
    may_grow_on?: FeatureBlockReference[];
    may_replace?: FeatureBlockReference[];
    may_grow_through?: FeatureBlockReference[];
    trunk?: Record<string, unknown>;
    acacia_trunk?: Record<string, unknown>;
    cherry_trunk?: Record<string, unknown>;
    fancy_trunk?: Record<string, unknown>;
    fallen_trunk?: Record<string, unknown>;
    mangrove_trunk?: Record<string, unknown>;
    mega_trunk?: Record<string, unknown>;
    canopy?: Record<string, unknown>;
    acacia_canopy?: Record<string, unknown>;
    cherry_canopy?: Record<string, unknown>;
    fancy_canopy?: Record<string, unknown>;
    mangrove_canopy?: Record<string, unknown>;
    mega_canopy?: Record<string, unknown>;
    mega_pine_canopy?: Record<string, unknown>;
    pine_canopy?: Record<string, unknown>;
    roofed_canopy?: Record<string, unknown>;
    spruce_canopy?: Record<string, unknown>;
    random_spread_canopy?: Record<string, unknown>;
    mangrove_roots?: Record<string, unknown>;
}

/**
 * Vegetation patch feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_vegetation_patch_feature
 */
export interface FeatureVegetationPatchData extends FeatureDefinitionData {
    replaceable_blocks: FeatureBlockReference[];
    ground_block: FeatureBlockReference;
    vegetation_feature: FeatureReference;
    vertical_range: number;
    surface?: "floor" | "ceiling" | (string & {});
    depth?: FeatureRangeValue;
    extra_deep_block_chance?: number;
    vegetation_chance?: number;
    horizontal_radius?: FeatureRangeValue;
    extra_edge_column_chance?: number;
    waterlogged?: boolean;
}

/**
 * Weighted random feature data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_weighted_random_feature
 */
export interface FeatureWeightedRandomData extends FeatureDefinitionData {
    features: FeatureWeightedReference[];
}

/**
 * Map from feature id to its documented data type.
 */
export interface FeatureDataByType {
    "minecraft:aggregate_feature": FeatureAggregateData;
    "minecraft:cave_carver_feature": FeatureCarverData;
    "minecraft:fossil_feature": FeatureFossilData;
    "minecraft:geode_feature": FeatureGeodeData;
    "minecraft:growing_plant_feature": FeatureGrowingPlantData;
    "minecraft:height_difference_filter_feature": FeatureHeightDifferenceFilterData;
    "minecraft:multiface_feature": FeatureMultifaceData;
    "minecraft:nether_cave_carver_feature": FeatureCarverData;
    "minecraft:ore_feature": FeatureOreData;
    "minecraft:partially_exposed_blob_feature": FeaturePartiallyExposedBlobData;
    "minecraft:scatter_feature": FeatureScatterData;
    "minecraft:search_feature": FeatureSearchData;
    "minecraft:sequence_feature": FeatureSequenceData;
    "minecraft:single_block_feature": FeatureSingleBlockData;
    "minecraft:snap_to_surface_feature": FeatureSnapToSurfaceData;
    "minecraft:structure_template_feature": FeatureStructureTemplateData;
    "minecraft:surface_relative_threshold_feature": FeatureSurfaceRelativeThresholdData;
    "minecraft:tree_feature": FeatureTreeData;
    "minecraft:underwater_cave_carver_feature": FeatureCarverData;
    "minecraft:vegetation_patch_feature": FeatureVegetationPatchData;
    "minecraft:weighted_random_feature": FeatureWeightedRandomData;
}

/**
 * Data type for a specific feature key.
 */
export type FeatureDataFor<TFeatureType extends FeatureType> = FeatureDataByType[TFeatureType];

/**
 * World generation pass used by feature rules.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#feature-rules
 */
export type FeatureRulePlacementPass =
    | "first_pass"
    | "before_underground_pass"
    | "underground_pass"
    | "after_underground_pass"
    | "before_surface_pass"
    | "surface_pass"
    | "after_surface_pass"
    | "before_sky_pass"
    | "sky_pass"
    | "after_sky_pass"
    | "final_pass"
    | (string & {});

/**
 * Common biome tags used by `has_biome_tag` filters in feature rules.
 */
export type FeatureBiomeTag =
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
    | "stone"
    | "swamp"
    | "taiga"
    | "the_end"
    | "warm"
    | "warped_forest"
    | (string & {});

/**
 * A single feature-rule filter test.
 */
export interface FeatureFilterTest {
    test: string;
    subject?: EntityFilterSubject | string;
    operator?: EntityFilterOperator | string;
    value?: unknown;
    domain?: string;
    [key: string]: unknown;
}

/**
 * Feature-rule filter group.
 */
export type FeatureFilterGroup = FeatureFilterTest | {
    all_of?: FeatureFilterGroup[];
    any_of?: FeatureFilterGroup[];
    none_of?: FeatureFilterGroup[];
    all?: FeatureFilterGroup[];
    any?: FeatureFilterGroup[];
    AND?: FeatureFilterGroup | FeatureFilterGroup[];
    OR?: FeatureFilterGroup | FeatureFilterGroup[];
    NOT?: FeatureFilterGroup | FeatureFilterGroup[];
    [key: string]: unknown;
};

/**
 * Biome filter accepted by feature rules.
 */
export type FeatureBiomeFilter = FeatureFilterGroup | FeatureFilterGroup[];

/**
 * Feature rule description data.
 */
export interface FeatureRuleDescriptionData {
    identifier: FeatureIdentifier;
    places_feature: FeatureReference;
    [key: string]: unknown;
}

/**
 * Feature rule condition data.
 */
export interface FeatureRuleConditionsData {
    placement_pass: FeatureRulePlacementPass;
    "minecraft:biome_filter"?: FeatureBiomeFilter;
    [key: string]: unknown;
}

/**
 * `minecraft:feature_rules` object.
 */
export interface FeatureRulesData {
    description: FeatureRuleDescriptionData;
    conditions: FeatureRuleConditionsData;
    distribution?: FeatureScatterDistributionData;
    [key: string]: unknown;
}

/**
 * Root feature rule document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featurerulesreference/examples/featurerulescomponents/feature_rules_document
 */
export interface FeatureRulesDocumentData {
    format_version: FeatureRuleFormatVersion;
    "minecraft:feature_rules": FeatureRulesData;
    [key: string]: unknown;
}
