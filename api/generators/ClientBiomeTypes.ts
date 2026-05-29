/**
 * Version string used by resource-pack client biome JSON files.
 *
 * Client biome files are the modern replacement for most per-biome settings
 * that used to live in `biomes_client.json`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/clientbiomesoverview
 */
export type ClientBiomeFormatVersion = string;

/**
 * Biome identifier paired with a server-side biome definition.
 */
export type ClientBiomeIdentifier = string;

/**
 * RGB color accepted by client biome rendering fields.
 */
export type ClientBiomeColor = string | [number, number, number];

/**
 * Document root for a modern client biome definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/client_biome_json_file
 */
export interface ClientBiomeDocumentData {
    /**
     * File format version.
     */
    format_version: ClientBiomeFormatVersion;

    /**
     * Client biome definition.
     */
    "minecraft:client_biome": ClientBiomeDefinitionData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Client-side visual and audio biome definition.
 */
export interface ClientBiomeDefinitionData {
    /**
     * Non-component settings for the client biome.
     */
    description: ClientBiomeDescriptionData;

    /**
     * Client biome components.
     */
    components: ClientBiomeComponentsData;

    /**
     * Future definition fields.
     */
    [key: string]: unknown;
}

/**
 * Client biome description.
 */
export interface ClientBiomeDescriptionData {
    /**
     * Client biome identifier. For custom biomes, this should match the
     * server-side behavior-pack biome identifier.
     */
    identifier: ClientBiomeIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Component collection for a client biome.
 */
export interface ClientBiomeComponentsData {
    /**
     * Component payloads keyed by component id.
     */
    [componentId: string]: unknown;
}

/**
 * Modern client biome components documented by Microsoft.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/client_biome_components
 */
export type ClientBiomeComponentId =
    | "minecraft:ambient_sounds"
    | "minecraft:atmosphere_identifier"
    | "minecraft:biome_music"
    | "minecraft:color_grading_identifier"
    | "minecraft:cubemap_identifier"
    | "minecraft:dry_foliage_color"
    | "minecraft:fog_appearance"
    | "minecraft:foliage_appearance"
    | "minecraft:grass_appearance"
    | "minecraft:lighting_identifier"
    | "minecraft:precipitation"
    | "minecraft:sky_color"
    | "minecraft:water_appearance"
    | "minecraft:water_identifier"
    | (string & {});

/**
 * Occasional ambient sound data.
 */
export interface ClientBiomeSoundAdditionData {
    /**
     * Name of the sound asset to play.
     */
    asset: string;

    /**
     * Probability between 0.0 and 1.0 of the sound playing each interval.
     */
    chance: number;

    /**
     * Future addition fields.
     */
    [key: string]: unknown;
}

/**
 * Ambient loop or mood sound reference.
 */
export type ClientBiomeSoundReference = string | {
    /**
     * Sound asset or event identifier.
     */
    asset?: string;

    /**
     * Future sound fields.
     */
    [key: string]: unknown;
};

/**
 * `minecraft:ambient_sounds` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_ambient_sounds
 */
export interface ClientBiomeAmbientSoundsData {
    /**
     * Sound that occasionally plays at the listener position.
     */
    addition?: ClientBiomeSoundAdditionData;

    /**
     * Sound that loops while the listener is inside the biome.
     */
    loop?: ClientBiomeSoundReference;

    /**
     * Sound that rarely plays near low-light air blocks.
     */
    mood?: ClientBiomeSoundReference;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:atmosphere_identifier` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_atmosphere_identifier
 */
export interface ClientBiomeAtmosphereIdentifierData {
    /**
     * Atmospheric scattering definition under `atmospherics`.
     */
    atmosphere_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:biome_music` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_biome_music
 */
export interface ClientBiomeMusicData {
    /**
     * Music definition to play inside this biome.
     */
    music_definition?: string;

    /**
     * Volume multiplier between 0 and 1.
     */
    volume_multiplier?: number;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:color_grading_identifier` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_color_grading_identifier
 */
export interface ClientBiomeColorGradingIdentifierData {
    /**
     * Color grading definition under `color_grading`.
     */
    color_grading_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:cubemap_identifier` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_cubemap_identifier
 */
export interface ClientBiomeCubemapIdentifierData {
    /**
     * Cubemap definition under `cubemaps`.
     */
    cubemap_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:dry_foliage_color` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_dry_foliage_color
 */
export interface ClientBiomeDryFoliageColorData {
    /**
     * Dry foliage RGB color.
     */
    color: ClientBiomeColor;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:fog_appearance` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_fog_appearance
 */
export interface ClientBiomeFogAppearanceData {
    /**
     * Fog definition identifier.
     */
    fog_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Foliage color-map names documented by Microsoft.
 */
export type ClientBiomeFoliageColorMap =
    | "birch"
    | "dry_foliage"
    | "evergreen"
    | "foliage"
    | "mangrove_swamp_foliage"
    | "swamp_foliage"
    | (string & {});

/**
 * Grass color-map names documented by Microsoft.
 */
export type ClientBiomeGrassColorMap =
    | "grass"
    | "swamp_grass"
    | (string & {});

/**
 * Color or color-map object used by foliage and grass appearance.
 */
export type ClientBiomeAppearanceColor<TColorMap extends string> = ClientBiomeColor | {
    /**
     * Texture color-map name.
     */
    color_map: TColorMap;

    /**
     * Future color-map fields.
     */
    [key: string]: unknown;
};

/**
 * `minecraft:foliage_appearance` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_foliage_appearance
 */
export interface ClientBiomeFoliageAppearanceData {
    /**
     * Fixed foliage color or foliage color map.
     */
    color: ClientBiomeAppearanceColor<ClientBiomeFoliageColorMap>;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:grass_appearance` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_grass_appearance
 */
export interface ClientBiomeGrassAppearanceData {
    /**
     * Fixed grass color or grass color map.
     */
    color: ClientBiomeAppearanceColor<ClientBiomeGrassColorMap>;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:lighting_identifier` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_lighting_identifier
 */
export interface ClientBiomeLightingIdentifierData {
    /**
     * Lighting definition under `lighting`.
     */
    lighting_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:sky_color` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_sky_color
 */
export interface ClientBiomeSkyColorData {
    /**
     * Sky RGB color.
     */
    sky_color: ClientBiomeColor;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * Client-side precipitation visual types.
 *
 * At most one type can be set for a biome.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_precipitation
 */
export type ClientBiomePrecipitationType =
    | "ash"
    | "blue_spores"
    | "red_spores"
    | "white_ash";

/**
 * `minecraft:precipitation` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_precipitation
 */
export type ClientBiomePrecipitationData = Partial<Record<ClientBiomePrecipitationType, number>> & {
    /**
     * Future component fields.
     */
    [key: string]: unknown;
};

/**
 * `minecraft:water_appearance` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_water_appearance
 */
export interface ClientBiomeWaterAppearanceData {
    /**
     * Water surface RGB color.
     */
    surface_color?: ClientBiomeColor;

    /**
     * Water surface opacity between 0 and 1.
     */
    surface_opacity?: number;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:water_identifier` component data.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_water_identifier
 */
export interface ClientBiomeWaterIdentifierData {
    /**
     * Water definition under `water`.
     */
    water_identifier: string;

    /**
     * Future component fields.
     */
    [key: string]: unknown;
}
