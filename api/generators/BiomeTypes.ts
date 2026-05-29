/**
 * Version string used by behavior-pack biome JSON files.
 *
 * Modern server-side biome files should target `1.21.110` or newer.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_json_file
 */
export type BiomeFormatVersion = string;

/**
 * Namespaced biome identifier.
 */
export type BiomeIdentifier = string;

/**
 * RGB color accepted by biome map tint fields.
 */
export type BiomeColor = string | [number, number, number];

/**
 * Numeric range with exactly two entries.
 */
export type BiomeNumberRange = [number, number];

/**
 * Block descriptor accepted by biome terrain material fields.
 */
export interface BiomeBlockDescriptor {
    /**
     * Block identifier.
     */
    name: string;

    /**
     * Optional block state values.
     */
    states?: Record<string, string | number | boolean>;

    /**
     * Future descriptor fields.
     */
    [key: string]: unknown;
}

/**
 * Block reference accepted by biome terrain material fields.
 */
export type BiomeBlockReference = string | BiomeBlockDescriptor;

/**
 * Document root for a server-side biome definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_json_file
 */
export interface BiomeDocumentData {
    /**
     * File format version.
     */
    format_version: BiomeFormatVersion;

    /**
     * Server-side biome definition.
     */
    "minecraft:biome": BiomeDefinitionData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Server-side biome definition.
 */
export interface BiomeDefinitionData {
    /**
     * Non-component settings for the biome.
     */
    description: BiomeDescriptionData;

    /**
     * Biome components.
     */
    components: BiomeComponentsData;

    /**
     * Future definition fields.
     */
    [key: string]: unknown;
}

/**
 * Server-side biome description.
 */
export interface BiomeDescriptionData {
    /**
     * Biome identifier.
     */
    identifier: BiomeIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Component collection for a biome.
 */
export interface BiomeComponentsData {
    /**
     * Component payloads keyed by component id.
     */
    [componentId: string]: unknown;
}

/**
 * Server-side biome components documented by Microsoft.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/componentlist
 */
export type BiomeComponentId =
    | "minecraft:climate"
    | "minecraft:creature_spawn_probability"
    | "minecraft:humidity"
    | "minecraft:map_tints"
    | "minecraft:mountain_parameters"
    | "minecraft:multinoise_generation_rules"
    | "minecraft:noise_gradient"
    | "minecraft:overworld_generation_rules"
    | "minecraft:overworld_height"
    | "minecraft:partially_frozen"
    | "minecraft:replace_biomes"
    | "minecraft:subsurface_builder"
    | "minecraft:surface_builder"
    | "minecraft:surface_material_adjustments"
    | "minecraft:tags"
    | "minecraft:village_type"
    | (string & {});

/**
 * Built-in biome tags with hard-coded meanings in the game.
 *
 * Custom tags are also valid and are used by systems such as spawn rules.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_tags
 */
export type BiomeTag =
    | "birch"
    | "cold"
    | "deep"
    | "desert"
    | "extreme_hills"
    | "flower_forest"
    | "forest"
    | "forest_generation"
    | "frozen"
    | "hills"
    | "ice"
    | "ice_plains"
    | "jungle"
    | "meadow"
    | "mesa"
    | "mountain"
    | "mutated"
    | "no_legacy_worldgen"
    | "ocean"
    | "pale_garden"
    | "plains"
    | "rare"
    | "swamp"
    | "taiga"
    | (string & {});

/**
 * `minecraft:climate` component data.
 *
 * The Nether particle precipitation fields that older content placed here are
 * now client-side `minecraft:precipitation` fields.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_climate
 */
export interface BiomeClimateData {
    /**
     * Amount that precipitation affects colors and block changes.
     */
    downfall?: number;

    /**
     * Minimum and maximum snow level.
     */
    snow_accumulation?: BiomeNumberRange;

    /**
     * Temperature used for snow, ice, sponge drying, sky color, and similar
     * biome behavior.
     */
    temperature?: number;

    /**
     * Future climate fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:creature_spawn_probability` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_creature_spawn_probability
 */
export interface BiomeCreatureSpawnProbabilityData {
    /**
     * Probability between 0.0 and 0.75 of creatures spawning on chunk
     * generation.
     */
    probability: number;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:humidity` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_humidity
 */
export interface BiomeHumidityData {
    /**
     * Whether the biome is forced to be humid.
     */
    is_humid: boolean;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Grass map tint color or color-map selector.
 */
export type BiomeMapTintGrass = BiomeColor | {
    /**
     * Fixed RGB color.
     */
    color?: BiomeColor;

    /**
     * Noise-based color map name.
     */
    color_map?: string;

    /**
     * Future grass tint fields.
     */
    [key: string]: unknown;
};

/**
 * `minecraft:map_tints` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_map_tints
 */
export interface BiomeMapTintsData {
    /**
     * Grass map tint behavior.
     */
    grass: BiomeMapTintGrass;

    /**
     * Foliage map tint color.
     */
    foliage?: BiomeColor;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Material adjustment for steep slopes in `minecraft:mountain_parameters`.
 */
export interface BiomeSteepMaterialAdjustmentData {
    /**
     * Block used as the steep material.
     */
    material?: BiomeBlockReference;

    /**
     * Whether east-facing slopes use the material.
     */
    east_slopes?: boolean;

    /**
     * Whether north-facing slopes use the material.
     */
    north_slopes?: boolean;

    /**
     * Whether south-facing slopes use the material.
     */
    south_slopes?: boolean;

    /**
     * Whether west-facing slopes use the material.
     */
    west_slopes?: boolean;

    /**
     * Future adjustment fields.
     */
    [key: string]: unknown;
}

/**
 * Density tapering settings for `minecraft:mountain_parameters`.
 */
export interface BiomeTopSlideData {
    /**
     * Whether top slide is enabled.
     */
    enabled: boolean;

    /**
     * Future top slide fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:mountain_parameters` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_mountain_parameters
 */
export interface BiomeMountainParametersData {
    /**
     * Legacy direct steep material.
     */
    material?: BiomeBlockReference;

    /**
     * Legacy direct slope toggles.
     */
    east_slopes?: boolean;
    north_slopes?: boolean;
    south_slopes?: boolean;
    west_slopes?: boolean;

    /**
     * Surface material adjustment for steep slopes.
     */
    steep_material_adjustment?: BiomeSteepMaterialAdjustmentData;

    /**
     * Density tapering at the top of the world.
     */
    top_slide?: BiomeTopSlideData;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:multinoise_generation_rules` component data.
 *
 * @deprecated This is a pre-Caves-and-Cliffs component and is unused for custom biomes.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_multinoise_generation_rules
 */
export interface BiomeMultinoiseGenerationRulesData {
    target_altitude?: number;
    target_humidity?: number;
    target_temperature?: number;
    target_weirdness?: number;
    weight?: number;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Legacy climate categories used by overworld generation rules.
 */
export type BiomeOverworldClimateCategory =
    | "medium"
    | "warm"
    | "lukewarm"
    | "cold"
    | "frozen"
    | (string & {});

/**
 * Weighted legacy climate category.
 */
export type BiomeWeightedClimate = [BiomeOverworldClimateCategory, number];

/**
 * `minecraft:overworld_generation_rules` component data.
 *
 * @deprecated This is a pre-Caves-and-Cliffs component and is unused for custom biomes.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_overworld_generation_rules
 */
export interface BiomeOverworldGenerationRulesData {
    generate_for_climates?: BiomeWeightedClimate[];
    hills_transformation?: string | string[];
    mutate_transformation?: string | string[];
    river_transformation?: string | string[];
    shore_transformation?: string | string[];

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Preset names accepted by `minecraft:overworld_height`.
 *
 * @deprecated This component is pre-Caves-and-Cliffs and currently only
 * affects map item rendering.
 */
export type BiomeOverworldHeightNoiseType =
    | "beach"
    | "deep_ocean"
    | "default"
    | "default_mutated"
    | "extreme"
    | "highlands"
    | "less_extreme"
    | "lowlands"
    | "mountains"
    | "mushroom"
    | "ocean"
    | "river"
    | "stone_beach"
    | "swamp"
    | "taiga"
    | (string & {});

/**
 * `minecraft:overworld_height` component data.
 *
 * @deprecated This component is pre-Caves-and-Cliffs and currently only
 * affects map item rendering.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_overworld_height
 */
export interface BiomeOverworldHeightData {
    /**
     * Depth and scale noise parameters.
     */
    noise_params?: BiomeNumberRange;

    /**
     * Built-in terrain height preset.
     */
    noise_type?: BiomeOverworldHeightNoiseType;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:partially_frozen` marker data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_components
 */
export interface BiomePartiallyFrozenData {
    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Dimension accepted by biome replacement settings.
 */
export type BiomeReplacementDimension =
    | "minecraft:overworld"
    | "minecraft:nether"
    | (string & {});

/**
 * One replacement entry for `minecraft:replace_biomes`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_replacement
 */
export interface BiomeReplacementData {
    /**
     * Noise value that controls whether replacement is attempted.
     */
    amount: number;

    /**
     * Dimension where the replacement can happen.
     */
    dimension: BiomeReplacementDimension;

    /**
     * Frequency scale for replacement attempts.
     */
    noise_frequency_scale: number;

    /**
     * Vanilla biome names to replace. Target biomes must not contain
     * namespaces.
     */
    targets: string[];

    /**
     * Future replacement fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:replace_biomes` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_replace_biomes
 */
export interface BiomeReplaceBiomesData {
    /**
     * Replacement entries. Add new entries to the end of the list to avoid
     * changing existing world generation.
     */
    replacements: BiomeReplacementData[];

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Surface builder ids accepted by biome surface builder data.
 */
export type BiomeSurfaceBuilderType =
    | "minecraft:capped"
    | "minecraft:frozen_ocean"
    | "minecraft:mesa"
    | "minecraft:noise_gradient"
    | "minecraft:overworld"
    | "minecraft:swamp"
    | "minecraft:the_end"
    | (string & {});

/**
 * Shared surface material slots.
 */
export interface BiomeSurfaceMaterialSet {
    foundation_material?: BiomeBlockReference;
    mid_material?: BiomeBlockReference;
    sea_floor_material?: BiomeBlockReference;
    sea_material?: BiomeBlockReference;
    top_material?: BiomeBlockReference;

    /**
     * Future material fields.
     */
    [key: string]: unknown;
}

/**
 * Default Overworld surface builder data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_surface_builder
 */
export interface BiomeOverworldSurfaceBuilderData extends BiomeSurfaceMaterialSet {
    type: "minecraft:overworld";
    foundation_material: BiomeBlockReference;
    mid_material: BiomeBlockReference;
    sea_floor_depth: number;
    sea_floor_material: BiomeBlockReference;
    sea_material: BiomeBlockReference;
    top_material: BiomeBlockReference;
}

/**
 * Frozen ocean surface builder data.
 */
export interface BiomeFrozenOceanSurfaceBuilderData extends BiomeSurfaceMaterialSet {
    type: "minecraft:frozen_ocean";
    sea_floor_depth?: number;
}

/**
 * Mesa surface builder data.
 */
export interface BiomeMesaSurfaceBuilderData extends BiomeSurfaceMaterialSet {
    type: "minecraft:mesa";
    bryce_pillars?: boolean;
    clay_material?: BiomeBlockReference;
    hard_clay_material?: BiomeBlockReference;
    has_forest?: boolean;
    sea_floor_depth?: number;
}

/**
 * Swamp surface builder data.
 */
export interface BiomeSwampSurfaceBuilderData extends BiomeSurfaceMaterialSet {
    type: "minecraft:swamp";
    sea_floor_depth?: number;
    swamp_water_depth?: number;
}

/**
 * Capped surface builder data.
 */
export interface BiomeCappedSurfaceBuilderData {
    type: "minecraft:capped";
    beach_material?: BiomeBlockReference;
    ceiling_materials: BiomeBlockReference[];
    floor_materials: BiomeBlockReference[];
    foundation_material: BiomeBlockReference;
    sea_material: BiomeBlockReference;

    /**
     * Future capped builder fields.
     */
    [key: string]: unknown;
}

/**
 * End surface builder data.
 */
export interface BiomeTheEndSurfaceBuilderData {
    type: "minecraft:the_end";

    /**
     * Future End builder fields.
     */
    [key: string]: unknown;
}

/**
 * Noise descriptor used by `minecraft:noise_gradient`.
 */
export interface BiomeNoiseDescriptorData {
    amplitudes: number[];
    first_octave: number;
    name: string;

    /**
     * Future noise descriptor fields.
     */
    [key: string]: unknown;
}

/**
 * Noise range used by `minecraft:noise_gradient`.
 */
export interface BiomeNoiseRangeData {
    min?: number;
    max?: number;

    /**
     * Future range fields.
     */
    [key: string]: unknown;
}

/**
 * One block range used by `minecraft:noise_gradient`.
 */
export interface BiomeNoiseBlockSpecifierData {
    block: BiomeBlockReference;
    noise?: string;
    range?: BiomeNoiseRangeData;
    threshold?: number;

    /**
     * Future block specifier fields.
     */
    [key: string]: unknown;
}

/**
 * Noise-gradient surface builder data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_noise_gradient
 */
export interface BiomeNoiseGradientData {
    type: "minecraft:noise_gradient";
    noise_block_specifiers: BiomeNoiseBlockSpecifierData[];
    noise_descriptor: BiomeNoiseDescriptorData;
    non_replaceable_blocks?: BiomeBlockReference[];

    /**
     * Future noise-gradient fields.
     */
    [key: string]: unknown;
}

/**
 * Surface builder payload accepted by `minecraft:surface_builder`.
 */
export type BiomeSurfaceBuilderData =
    | BiomeOverworldSurfaceBuilderData
    | BiomeFrozenOceanSurfaceBuilderData
    | BiomeMesaSurfaceBuilderData
    | BiomeSwampSurfaceBuilderData
    | BiomeCappedSurfaceBuilderData
    | BiomeTheEndSurfaceBuilderData
    | BiomeNoiseGradientData
    | ({ type: BiomeSurfaceBuilderType } & Record<string, unknown>);

/**
 * `minecraft:surface_builder` component data.
 */
export interface BiomeSurfaceBuilderComponentData {
    /**
     * Surface builder strategy and materials.
     */
    builder: BiomeSurfaceBuilderData;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:subsurface_builder` component data.
 */
export interface BiomeSubsurfaceBuilderData {
    /**
     * Surface builder to apply below regular terrain surface.
     */
    builder: BiomeSurfaceBuilderData;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * One material adjustment used by `minecraft:surface_material_adjustments`.
 */
export interface BiomeSurfaceMaterialAdjustmentData {
    /**
     * Optional vertical range for the adjustment.
     */
    height_range?: BiomeNumberRange | boolean | string;

    /**
     * Replacement material slots used when the adjustment is active.
     */
    materials: BiomeSurfaceMaterialSet;

    /**
     * Noise frequency scale.
     */
    noise_frequency_scale?: number;

    /**
     * Noise range for the adjustment.
     */
    noise_range?: BiomeNumberRange;

    /**
     * Future adjustment fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:surface_material_adjustments` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_surface_material_adjustments
 */
export interface BiomeSurfaceMaterialAdjustmentsData {
    /**
     * Ordered material adjustments.
     */
    adjustments: BiomeSurfaceMaterialAdjustmentData[];

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:tags` component data.
 */
export interface BiomeTagsData {
    /**
     * Tags attached to the biome.
     */
    tags: BiomeTag[];

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Built-in village styles accepted by `minecraft:village_type`.
 */
export type BiomeVillageType =
    | "default"
    | "desert"
    | "ice"
    | "savanna"
    | "taiga"
    | (string & {});

/**
 * `minecraft:village_type` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_village_type
 */
export interface BiomeVillageTypeData {
    /**
     * Village style for the biome.
     */
    type: BiomeVillageType;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}
