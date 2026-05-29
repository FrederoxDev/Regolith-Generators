/**
 * Version string used by Vibrant Visuals JSON files.
 */
export type VibrantVisualsFormatVersion = string;

/**
 * Namespaced identifier used by Vibrant Visuals settings.
 */
export type VibrantVisualsIdentifier = string;

/**
 * RGB or RGBA color accepted by Vibrant Visuals settings.
 */
export type VibrantVisualsColor =
    | string
    | [number, number, number]
    | [number, number, number, number];

/**
 * Keyframe map keyed by time of day from 0.0 to 1.0.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/keyframejsonsyntax
 */
export type VibrantVisualsKeyframes<T> = Record<string, T>;

/**
 * A fixed value or a keyframe map for schemas that support `optkeyframe`.
 */
export type VibrantVisualsKeyframed<T> = T | VibrantVisualsKeyframes<T>;

/**
 * Shared `description` object used by Vibrant Visuals settings.
 */
export interface VibrantVisualsDescriptionData {
    /**
     * Namespaced settings identifier.
     */
    identifier: VibrantVisualsIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Root atmosphere settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/atmosphericscustomization
 */
export interface AtmosphereSettingsDocumentData {
    /**
     * File format version.
     */
    format_version: VibrantVisualsFormatVersion;

    /**
     * Atmosphere settings definition.
     */
    "minecraft:atmosphere_settings": AtmosphereSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Vibrant Visuals atmospheric scattering settings.
 */
export interface AtmosphereSettingsData {
    /**
     * Settings identifier.
     */
    description: VibrantVisualsDescriptionData;

    /**
     * Horizon blend stop values.
     */
    horizon_blend_stops?: AtmosphereHorizonBlendStopsData;

    /**
     * Strength of Rayleigh scattering.
     */
    rayleigh_strength?: VibrantVisualsKeyframed<number>;

    /**
     * Strength of the sun's Mie scattering term.
     */
    sun_mie_strength?: VibrantVisualsKeyframed<number>;

    /**
     * Strength of the moon's Mie scattering term.
     */
    moon_mie_strength?: VibrantVisualsKeyframed<number>;

    /**
     * Shape of the Mie scattering lobe.
     */
    sun_glare_shape?: VibrantVisualsKeyframed<number>;

    /**
     * RGB color of the zenith region of the atmosphere.
     */
    sky_zenith_color?: VibrantVisualsKeyframed<VibrantVisualsColor>;

    /**
     * RGB color of the horizon region of the atmosphere.
     */
    sky_horizon_color?: VibrantVisualsKeyframed<VibrantVisualsColor>;

    /**
     * Future atmosphere fields.
     */
    [key: string]: unknown;
}

/**
 * Atmosphere horizon blend stops.
 */
export interface AtmosphereHorizonBlendStopsData {
    min?: VibrantVisualsKeyframed<number>;
    start?: VibrantVisualsKeyframed<number>;
    mie_start?: VibrantVisualsKeyframed<number>;
    max?: VibrantVisualsKeyframed<number>;

    /**
     * Future horizon blend fields.
     */
    [key: string]: unknown;
}

/**
 * Root color grading settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/colorgradingtonemappingcustomization
 */
export interface ColorGradingSettingsDocumentData {
    /**
     * File format version.
     */
    format_version: VibrantVisualsFormatVersion;

    /**
     * Color grading settings definition.
     */
    "minecraft:color_grading_settings": ColorGradingSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Color grading and tone mapping settings.
 */
export interface ColorGradingSettingsData {
    /**
     * Settings identifier.
     */
    description: VibrantVisualsDescriptionData;

    /**
     * Color grading parameters.
     */
    color_grading?: ColorGradingData;

    /**
     * Tone mapping operator.
     */
    tone_mapping?: ToneMappingData;

    /**
     * Future color grading fields.
     */
    [key: string]: unknown;
}

/**
 * Three-channel color grading vector.
 */
export type ColorGradingVector = [number, number, number];

/**
 * Shared color grading channel parameters.
 */
export interface ColorGradingRegionData {
    contrast?: ColorGradingVector;
    gain?: ColorGradingVector;
    gamma?: ColorGradingVector;
    offset?: ColorGradingVector;
    saturation?: ColorGradingVector;

    /**
     * Future region fields.
     */
    [key: string]: unknown;
}

/**
 * Highlight color grading parameters.
 */
export interface ColorGradingHighlightsData extends ColorGradingRegionData {
    /**
     * Whether highlight grading is enabled.
     */
    enabled: boolean;

    /**
     * Average-luminance factor for highlight selection.
     */
    highlightsMin?: number;
}

/**
 * Shadow color grading parameters.
 */
export interface ColorGradingShadowsData extends ColorGradingRegionData {
    /**
     * Whether shadow grading is enabled.
     */
    enabled: boolean;

    /**
     * Average-luminance factor for shadow selection.
     */
    shadowsMax?: number;
}

/**
 * Temperature grading type.
 */
export type ColorTemperatureType = "white_balance" | "color_temperature";

/**
 * Temperature-based color grading parameters.
 */
export interface ColorGradingTemperatureData {
    /**
     * Whether temperature grading is enabled.
     */
    enabled: boolean;

    /**
     * Image temperature in Kelvin.
     */
    temperature?: number;

    /**
     * Temperature interpretation mode.
     */
    type?: ColorTemperatureType;

    /**
     * Future temperature fields.
     */
    [key: string]: unknown;
}

/**
 * Color grading parameters.
 */
export interface ColorGradingData {
    /**
     * Midtone/global color grading parameters.
     */
    midtones?: ColorGradingRegionData;

    /**
     * Highlight color grading parameters.
     */
    highlights?: ColorGradingHighlightsData;

    /**
     * Shadow color grading parameters.
     */
    shadows?: ColorGradingShadowsData;

    /**
     * Temperature-based grading parameters.
     */
    temperature?: ColorGradingTemperatureData;

    /**
     * Future color grading fields.
     */
    [key: string]: unknown;
}

/**
 * Tone mapping operators documented by Microsoft.
 */
export type ToneMappingOperator =
    | "reinhard"
    | "reinhard_luma"
    | "reinhard_luminance"
    | "hable"
    | "aces"
    | "generic"
    | (string & {});

/**
 * Tone mapping settings.
 */
export interface ToneMappingData {
    /**
     * Tone mapping operator.
     */
    operator: ToneMappingOperator;

    /**
     * Future tone mapping fields.
     */
    [key: string]: unknown;
}

/**
 * Root cubemap settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/cubemapcustomization
 */
export interface CubemapSettingsDocumentData {
    /**
     * File format version.
     */
    format_version: VibrantVisualsFormatVersion;

    /**
     * Cubemap settings definition.
     */
    "minecraft:cubemap_settings": CubemapSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Cubemap settings.
 */
export interface CubemapSettingsData {
    /**
     * Settings identifier.
     */
    description: VibrantVisualsDescriptionData;

    /**
     * Lighting settings for the cubemap.
     */
    lighting?: CubemapLightingData;

    /**
     * Future cubemap fields.
     */
    [key: string]: unknown;
}

/**
 * Cubemap lighting settings.
 */
export interface CubemapLightingData {
    /**
     * Fixed ambient light applied to the cubemap.
     */
    ambient_light_illuminance?: VibrantVisualsKeyframed<number>;

    /**
     * Sky light contribution.
     */
    sky_light_contribution?: number;

    /**
     * Directional light contribution.
     */
    directional_light_contribution?: number;

    /**
     * Whether atmospheric scattering affects the cubemap.
     */
    affected_by_atmospheric_scattering?: boolean;

    /**
     * Whether volumetric scattering affects the cubemap.
     */
    affected_by_volumetric_scattering?: boolean;

    /**
     * Future cubemap lighting fields.
     */
    [key: string]: unknown;
}

/**
 * Root lighting settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/lightingcustomization
 */
export interface LightingSettingsDocumentData {
    /**
     * File format version.
     */
    format_version: VibrantVisualsFormatVersion;

    /**
     * Lighting settings definition.
     */
    "minecraft:lighting_settings": LightingSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Global or per-biome Vibrant Visuals lighting settings.
 */
export interface LightingSettingsData {
    /**
     * Settings identifier.
     */
    description: VibrantVisualsDescriptionData;

    /**
     * Sun, moon, and End flash lighting.
     */
    directional_lights?: LightingDirectionalLightsData;

    /**
     * Emissive light behavior.
     */
    emissive?: LightingEmissiveData;

    /**
     * Ambient light fallback.
     */
    ambient?: LightingAmbientData;

    /**
     * Sky light contribution.
     */
    sky?: LightingSkyData;

    /**
     * Future lighting fields.
     */
    [key: string]: unknown;
}

/**
 * Directional light settings.
 */
export interface LightingDirectionalLightsData {
    /**
     * Sun and moon orbital lighting.
     */
    orbital?: LightingOrbitalData;

    /**
     * End dimension flash light.
     */
    flash?: LightingDirectionalLightData;

    /**
     * Future directional light fields.
     */
    [key: string]: unknown;
}

/**
 * Sun and moon orbital light settings.
 */
export interface LightingOrbitalData {
    /**
     * Sun light.
     */
    sun?: LightingDirectionalLightData;

    /**
     * Moon light.
     */
    moon?: LightingDirectionalLightData;

    /**
     * Rotational offset of the sun and moon from the standard orbital axis.
     */
    orbital_offset_degrees?: VibrantVisualsKeyframed<number>;

    /**
     * Future orbital fields.
     */
    [key: string]: unknown;
}

/**
 * One directional light.
 */
export interface LightingDirectionalLightData {
    /**
     * Brightness in lux.
     */
    illuminance?: VibrantVisualsKeyframed<number>;

    /**
     * RGB contribution to direct surface lighting.
     */
    color?: VibrantVisualsKeyframed<VibrantVisualsColor>;

    /**
     * Future directional light fields.
     */
    [key: string]: unknown;
}

/**
 * Emissive light settings.
 */
export interface LightingEmissiveData {
    /**
     * Amount of albedo desaturation during emissive light calculation.
     */
    desaturation?: number;

    /**
     * Future emissive fields.
     */
    [key: string]: unknown;
}

/**
 * Ambient light settings.
 */
export interface LightingAmbientData {
    /**
     * Ambient light color.
     */
    color?: VibrantVisualsKeyframed<VibrantVisualsColor>;

    /**
     * Ambient light brightness in lux.
     */
    illuminance?: VibrantVisualsKeyframed<number>;

    /**
     * Future ambient fields.
     */
    [key: string]: unknown;
}

/**
 * Sky light settings.
 */
export interface LightingSkyData {
    /**
     * How much energy the sky contributes to lighting.
     */
    intensity?: VibrantVisualsKeyframed<number>;

    /**
     * Future sky fields.
     */
    [key: string]: unknown;
}

/**
 * Root water settings document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/watercustomization
 */
export interface WaterSettingsDocumentData {
    /**
     * File format version.
     */
    format_version: VibrantVisualsFormatVersion;

    /**
     * Water settings definition.
     */
    "minecraft:water_settings": WaterSettingsData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * Vibrant Visuals water settings.
 */
export interface WaterSettingsData {
    /**
     * Settings identifier.
     */
    description: VibrantVisualsDescriptionData;

    /**
     * Water particle concentrations.
     */
    particle_concentrations?: WaterParticleConcentrationsData;

    /**
     * Wave simulation settings.
     */
    waves?: WaterWavesData;

    /**
     * Caustics settings.
     */
    caustics?: WaterCausticsData;

    /**
     * How much client biome `surface_color` contributes to Vibrant Visuals
     * water color.
     */
    biome_water_color_contribution?: number;

    /**
     * Future water fields.
     */
    [key: string]: unknown;
}

/**
 * Particle concentration settings for water.
 */
export interface WaterParticleConcentrationsData {
    /**
     * Chromophoric dissolved organic matter concentration in mg/L.
     */
    cdom?: number;

    /**
     * Chlorophyll concentration in mg/L.
     */
    chlorophyll?: number;

    /**
     * Suspended sediment concentration in mg/L.
     */
    suspended_sediment?: number;

    /**
     * Future particle concentration fields.
     */
    [key: string]: unknown;
}

/**
 * Water wave simulation settings.
 */
export interface WaterWavesData {
    enabled?: boolean;
    depth?: number;
    direction_increment?: number;
    frequency?: number;
    frequency_scaling?: number;
    mix?: number;
    octaves?: number;
    pull?: number;
    sampleWidth?: number;
    shape?: number;
    speed?: number;
    speed_scaling?: number;

    /**
     * Future wave fields.
     */
    [key: string]: unknown;
}

/**
 * Water caustics settings.
 */
export interface WaterCausticsData {
    enabled?: boolean;
    frame_length?: number;
    power?: number;
    scale?: number;
    texture?: string;

    /**
     * Future caustics fields.
     */
    [key: string]: unknown;
}
