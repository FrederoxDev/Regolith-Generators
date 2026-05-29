/**
 * Version string used by resource-pack fog JSON files.
 *
 * Basic fog files are supported back to `1.16.100`; `1.21.90` and newer are
 * needed for Vibrant Visuals Henyey-Greenstein scattering settings.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/fogsreference/fogs
 * @see https://learn.microsoft.com/minecraft/creator/documents/foginresourcepacks
 */
export type FogFormatVersion = string;

/**
 * Namespaced fog settings identifier.
 */
export type FogIdentifier = string;

/**
 * RGB or RGBA color accepted by fog fields.
 */
export type FogColor = string | [number, number, number] | [number, number, number, number];

/**
 * How fog start/end distances are interpreted.
 */
export type FogRenderDistanceType = "fixed" | "render";

/**
 * Camera locations accepted by distance fog settings.
 */
export type FogDistanceEnvironment =
    | "air"
    | "weather"
    | "water"
    | "lava"
    | "lava_resistance"
    | "powder_snow"
    | (string & {});

/**
 * Camera locations accepted by volumetric density settings.
 */
export type FogDensityEnvironment =
    | "air"
    | "weather"
    | "water"
    | "lava"
    | "lava_resistance"
    | (string & {});

/**
 * Medium names accepted by volumetric media coefficients.
 */
export type FogMediaEnvironment =
    | "air"
    | "cloud"
    | "water"
    | (string & {});

/**
 * Medium names accepted by Henyey-Greenstein scattering settings.
 */
export type FogHenyeyGreensteinEnvironment =
    | "air"
    | "water"
    | (string & {});

/**
 * Root fog settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/fogsreference/fogs
 */
export interface FogDocumentData {
    /**
     * File format version.
     */
    format_version: FogFormatVersion;

    /**
     * Fog settings definition.
     */
    "minecraft:fog_settings": FogSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Fog settings definition.
 */
export interface FogSettingsData {
    /**
     * Non-rendering metadata for the fog definition.
     */
    description: FogDescriptionData;

    /**
     * Distance fog settings for camera locations.
     */
    distance?: FogDistanceCollectionData;

    /**
     * Volumetric fog settings.
     */
    volumetric?: FogVolumetricData;

    /**
     * Future fog settings fields.
     */
    [key: string]: unknown;
}

/**
 * Fog settings description.
 */
export interface FogDescriptionData {
    /**
     * Namespaced fog identifier.
     */
    identifier: FogIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Distance fog settings keyed by camera location.
 */
export type FogDistanceCollectionData = Partial<Record<FogDistanceEnvironment, FogDistanceSettingsData>> & {
    /**
     * Future distance fields.
     */
    [key: string]: unknown;
};

/**
 * Distance fog settings for one camera location.
 */
export interface FogDistanceSettingsData {
    /**
     * Distance where fog begins.
     */
    fog_start?: number;

    /**
     * Distance where fog becomes fully opaque.
     */
    fog_end?: number;

    /**
     * Fog color.
     */
    fog_color?: FogColor;

    /**
     * Whether distances are fixed block distances or percentages of render
     * distance.
     */
    render_distance_type?: FogRenderDistanceType;

    /**
     * Transition settings. Microsoft notes this only works for water distance
     * fog.
     */
    transition_fog?: FogTransitionData;

    /**
     * Future distance fog fields.
     */
    [key: string]: unknown;
}

/**
 * Water fog transition settings.
 */
export interface FogTransitionData {
    /**
     * Initial fog used when entering water.
     */
    init_fog: FogDistanceSettingsData;

    /**
     * Minimum transition progress.
     */
    min_percent?: number;

    /**
     * Seconds to reach `mid_percent`.
     */
    mid_seconds?: number;

    /**
     * Transition progress after `mid_seconds`.
     */
    mid_percent?: number;

    /**
     * Seconds to complete the transition.
     */
    max_seconds?: number;

    /**
     * Future transition fields.
     */
    [key: string]: unknown;
}

/**
 * Volumetric fog settings.
 */
export interface FogVolumetricData {
    /**
     * Density values keyed by camera location.
     */
    density?: Partial<Record<FogDensityEnvironment, FogVolumetricDensityData>>;

    /**
     * Scattering and absorption coefficients keyed by medium.
     */
    media_coefficients?: Partial<Record<FogMediaEnvironment, FogMediaCoefficientData>>;

    /**
     * Henyey-Greenstein scattering distribution keyed by medium.
     */
    henyey_greenstein_g?: Partial<Record<FogHenyeyGreensteinEnvironment, FogHenyeyGreensteinData>>;

    /**
     * Future volumetric fields.
     */
    [key: string]: unknown;
}

/**
 * Volumetric density settings for one camera location.
 */
export interface FogVolumetricDensityData {
    /**
     * Multiplier for how much fog disrupts light.
     */
    max_density?: number;

    /**
     * Whether density is uniform across heights.
     */
    uniform?: boolean;

    /**
     * Height where fog begins appearing. Used when `uniform` is false.
     */
    zero_density_height?: number;

    /**
     * Height where fog reaches `max_density`. Used when `uniform` is false.
     */
    max_density_height?: number;

    /**
     * Future density fields.
     */
    [key: string]: unknown;
}

/**
 * Volumetric media coefficient settings for one medium.
 */
export interface FogMediaCoefficientData {
    /**
     * Amount of RGB light spread by the fog.
     */
    scattering?: FogColor;

    /**
     * Amount of RGB light absorbed by the fog.
     */
    absorption?: FogColor;

    /**
     * Future media coefficient fields.
     */
    [key: string]: unknown;
}

/**
 * Henyey-Greenstein scattering setting for one medium.
 */
export interface FogHenyeyGreensteinData {
    /**
     * Distribution of scattered light, from -1.0 to 1.0.
     */
    henyey_greenstein_g: number;

    /**
     * Future scattering fields.
     */
    [key: string]: unknown;
}
