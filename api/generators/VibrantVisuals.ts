import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type AtmosphereHorizonBlendStopsData,
    type AtmosphereSettingsData,
    type AtmosphereSettingsDocumentData,
    type ColorGradingData,
    type ColorGradingHighlightsData,
    type ColorGradingRegionData,
    type ColorGradingSettingsData,
    type ColorGradingSettingsDocumentData,
    type ColorGradingShadowsData,
    type ColorGradingTemperatureData,
    type CubemapLightingData,
    type CubemapSettingsData,
    type CubemapSettingsDocumentData,
    type LightingAmbientData,
    type LightingDirectionalLightData,
    type LightingDirectionalLightsData,
    type LightingEmissiveData,
    type LightingSettingsData,
    type LightingSettingsDocumentData,
    type LightingSkyData,
    type ToneMappingOperator,
    type VibrantVisualsColor,
    type VibrantVisualsDescriptionData,
    type VibrantVisualsFormatVersion,
    type VibrantVisualsIdentifier,
    type VibrantVisualsKeyframed,
    type WaterCausticsData,
    type WaterParticleConcentrationsData,
    type WaterSettingsData,
    type WaterSettingsDocumentData,
    type WaterWavesData
} from "./VibrantVisualsTypes.ts";

export * from "./VibrantVisualsTypes.ts";

const DEFAULT_ATMOSPHERE_FORMAT_VERSION: VibrantVisualsFormatVersion = "1.21.40";
const DEFAULT_COLOR_GRADING_FORMAT_VERSION: VibrantVisualsFormatVersion = "1.21.90";
const DEFAULT_CUBEMAP_FORMAT_VERSION: VibrantVisualsFormatVersion = "1.21.130";
const DEFAULT_LIGHTING_FORMAT_VERSION: VibrantVisualsFormatVersion = "1.26.0";
const DEFAULT_WATER_FORMAT_VERSION: VibrantVisualsFormatVersion = "1.26.0";

const JSON_EXTENSION = ".json";

type VibrantVisualsDef =
    | AtmosphereSettingsDef
    | ColorGradingSettingsDef
    | CubemapSettingsDef
    | LightingSettingsDef
    | WaterSettingsDef;

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

function normalizeResourcePath(path: string): string {
    let output = path.replace(/\\/g, "/").replace(/^\/+/, "");

    if (output.startsWith("RP/")) {
        output = output.slice("RP/".length);
    }

    if (output.endsWith(JSON_EXTENSION)) {
        output = output.slice(0, -JSON_EXTENSION.length);
    }

    return output;
}

/**
 * Factory for resource-pack Vibrant Visuals settings files.
 *
 * This covers the modern per-biome backing definitions referenced by client
 * biome components: atmospherics, color grading, cubemaps, lighting, and water.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/biomecustomization
 */
export class VibrantVisualsGenerator extends GeneratorFactory<VibrantVisualsDef> {
    /**
     * Creates a Vibrant Visuals generator that writes into `RP`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP");
    }

    private store<TDef extends VibrantVisualsDef>(path: string, def: TDef): TDef {
        this.filesToGenerate.set(normalizeResourcePath(path), def);
        return def;
    }

    /**
     * Queues an atmosphere settings file under `RP/atmospherics`.
     */
    makeAtmosphereSettings(
        id: string,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_ATMOSPHERE_FORMAT_VERSION
    ): AtmosphereSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeAtmosphereSettingsForIdentifier(identifier, formatVersion);
    }

    /**
     * Queues an atmosphere settings file for an exact identifier.
     */
    makeAtmosphereSettingsForIdentifier(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_ATMOSPHERE_FORMAT_VERSION
    ): AtmosphereSettingsDef {
        const def = new AtmosphereSettingsDef(identifier, formatVersion);
        return this.store(`atmospherics/${sanitiseIdentifierForFilename(identifier)}`, def);
    }

    /**
     * Queues the reserved global atmosphere settings file
     * `RP/atmospherics/atmospherics.json`.
     */
    makeDefaultAtmosphereSettings(
        id: string = "default_atmospherics",
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_ATMOSPHERE_FORMAT_VERSION
    ): AtmosphereSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new AtmosphereSettingsDef(identifier, formatVersion);
        return this.store("atmospherics/atmospherics", def);
    }

    /**
     * Queues a color grading settings file under `RP/color_grading`.
     */
    makeColorGradingSettings(
        id: string,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_COLOR_GRADING_FORMAT_VERSION
    ): ColorGradingSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeColorGradingSettingsForIdentifier(identifier, formatVersion);
    }

    /**
     * Queues a color grading settings file for an exact identifier.
     */
    makeColorGradingSettingsForIdentifier(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_COLOR_GRADING_FORMAT_VERSION
    ): ColorGradingSettingsDef {
        const def = new ColorGradingSettingsDef(identifier, formatVersion);
        return this.store(`color_grading/${sanitiseIdentifierForFilename(identifier)}`, def);
    }

    /**
     * Queues the reserved global color grading file
     * `RP/color_grading/color_grading.json`.
     */
    makeDefaultColorGradingSettings(
        id: string = "default_color_grading",
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_COLOR_GRADING_FORMAT_VERSION
    ): ColorGradingSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new ColorGradingSettingsDef(identifier, formatVersion);
        return this.store("color_grading/color_grading", def);
    }

    /**
     * Queues a cubemap settings file under `RP/cubemaps`.
     */
    makeCubemapSettings(
        id: string,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_CUBEMAP_FORMAT_VERSION
    ): CubemapSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeCubemapSettingsForIdentifier(identifier, formatVersion);
    }

    /**
     * Queues a cubemap settings file for an exact identifier.
     */
    makeCubemapSettingsForIdentifier(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_CUBEMAP_FORMAT_VERSION
    ): CubemapSettingsDef {
        const def = new CubemapSettingsDef(identifier, formatVersion);
        return this.store(`cubemaps/${sanitiseIdentifierForFilename(identifier)}`, def);
    }

    /**
     * Queues a lighting settings file under `RP/lighting`.
     */
    makeLightingSettings(
        id: string,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_LIGHTING_FORMAT_VERSION
    ): LightingSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeLightingSettingsForIdentifier(identifier, formatVersion);
    }

    /**
     * Queues a lighting settings file for an exact identifier.
     */
    makeLightingSettingsForIdentifier(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_LIGHTING_FORMAT_VERSION
    ): LightingSettingsDef {
        const def = new LightingSettingsDef(identifier, formatVersion);
        return this.store(`lighting/${sanitiseIdentifierForFilename(identifier)}`, def);
    }

    /**
     * Queues the reserved global lighting file `RP/lighting/global.json`.
     */
    makeDefaultLightingSettings(
        id: string = "default_lighting",
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_LIGHTING_FORMAT_VERSION
    ): LightingSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new LightingSettingsDef(identifier, formatVersion);
        return this.store("lighting/global", def);
    }

    /**
     * Queues a water settings file under `RP/water`.
     */
    makeWaterSettings(
        id: string,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_WATER_FORMAT_VERSION
    ): WaterSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeWaterSettingsForIdentifier(identifier, formatVersion);
    }

    /**
     * Queues a water settings file for an exact identifier.
     */
    makeWaterSettingsForIdentifier(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_WATER_FORMAT_VERSION
    ): WaterSettingsDef {
        const def = new WaterSettingsDef(identifier, formatVersion);
        return this.store(`water/${sanitiseIdentifierForFilename(identifier)}`, def);
    }

    /**
     * Queues the reserved global water file `RP/water/water.json`.
     */
    makeDefaultWaterSettings(
        id: string = "default_water",
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_WATER_FORMAT_VERSION
    ): WaterSettingsDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new WaterSettingsDef(identifier, formatVersion);
        return this.store("water/water", def);
    }

    /**
     * Writes all queued Vibrant Visuals files while preserving their required
     * resource-pack subdirectories.
     */
    public override generate(): void {
        for (const [path, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${path}${JSON_EXTENSION}`);
        }
    }
}

/**
 * Fluent builder for `minecraft:atmosphere_settings`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/atmosphericscustomization
 */
export class AtmosphereSettingsDef extends GeneratorBase<AtmosphereSettingsDef> {
    data: AtmosphereSettingsDocumentData;

    /**
     * Creates an atmosphere settings definition.
     */
    constructor(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_ATMOSPHERE_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:atmosphere_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private settingsPath(path: string): string {
        return path.length === 0 ? "minecraft:atmosphere_settings" : `minecraft:atmosphere_settings/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: VibrantVisualsFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the settings identifier.
     */
    setIdentifier(identifier: VibrantVisualsIdentifier): this {
        this.setValueAtPath(this.settingsPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full atmosphere settings object, preserving description.
     */
    setAtmosphereSettings(data: Partial<Omit<AtmosphereSettingsData, "description">>): this {
        const description = this.getValueAtPath<VibrantVisualsDescriptionData>(
            this.settingsPath("description"),
            { identifier: "" }
        );
        this.setValueAtPath(this.settingsPath(""), { description, ...data });
        return this;
    }

    /**
     * Sets one atmosphere settings property.
     */
    setAtmosphereProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.settingsPath(key), value);
        return this;
    }

    /**
     * Sets the horizon blend stops.
     */
    setHorizonBlendStops(stops: AtmosphereHorizonBlendStopsData): this {
        this.setValueAtPath(this.settingsPath("horizon_blend_stops"), stops);
        return this;
    }

    /**
     * Sets the Rayleigh scattering strength.
     */
    setRayleighStrength(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("rayleigh_strength"), value);
        return this;
    }

    /**
     * Sets the sun Mie scattering strength.
     */
    setSunMieStrength(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("sun_mie_strength"), value);
        return this;
    }

    /**
     * Sets the moon Mie scattering strength.
     */
    setMoonMieStrength(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("moon_mie_strength"), value);
        return this;
    }

    /**
     * Sets the sun glare shape.
     */
    setSunGlareShape(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("sun_glare_shape"), value);
        return this;
    }

    /**
     * Sets the sky zenith color.
     */
    setSkyZenithColor(color: VibrantVisualsKeyframed<VibrantVisualsColor>): this {
        this.setValueAtPath(this.settingsPath("sky_zenith_color"), color);
        return this;
    }

    /**
     * Sets the sky horizon color.
     */
    setSkyHorizonColor(color: VibrantVisualsKeyframed<VibrantVisualsColor>): this {
        this.setValueAtPath(this.settingsPath("sky_horizon_color"), color);
        return this;
    }
}

/**
 * Fluent builder for `minecraft:color_grading_settings`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/colorgradingtonemappingcustomization
 */
export class ColorGradingSettingsDef extends GeneratorBase<ColorGradingSettingsDef> {
    data: ColorGradingSettingsDocumentData;

    /**
     * Creates a color grading settings definition.
     */
    constructor(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_COLOR_GRADING_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:color_grading_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private settingsPath(path: string): string {
        return path.length === 0
            ? "minecraft:color_grading_settings"
            : `minecraft:color_grading_settings/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: VibrantVisualsFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the settings identifier.
     */
    setIdentifier(identifier: VibrantVisualsIdentifier): this {
        this.setValueAtPath(this.settingsPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full color grading settings object, preserving description.
     */
    setColorGradingSettings(data: Partial<Omit<ColorGradingSettingsData, "description">>): this {
        const description = this.getValueAtPath<VibrantVisualsDescriptionData>(
            this.settingsPath("description"),
            { identifier: "" }
        );
        this.setValueAtPath(this.settingsPath(""), { description, ...data });
        return this;
    }

    /**
     * Replaces the `color_grading` object.
     */
    setColorGrading(data: ColorGradingData): this {
        this.setValueAtPath(this.settingsPath("color_grading"), data);
        return this;
    }

    /**
     * Sets midtone/global color grading parameters.
     */
    setMidtones(data: ColorGradingRegionData): this {
        this.setValueAtPath(this.settingsPath("color_grading/midtones"), data);
        return this;
    }

    /**
     * Sets highlight color grading parameters.
     */
    setHighlights(data: ColorGradingHighlightsData): this {
        this.setValueAtPath(this.settingsPath("color_grading/highlights"), data);
        return this;
    }

    /**
     * Enables highlight grading and applies optional parameters.
     */
    enableHighlights(data: Omit<ColorGradingHighlightsData, "enabled"> = {}): this {
        return this.setHighlights({ ...data, enabled: true });
    }

    /**
     * Sets shadow color grading parameters.
     */
    setShadows(data: ColorGradingShadowsData): this {
        this.setValueAtPath(this.settingsPath("color_grading/shadows"), data);
        return this;
    }

    /**
     * Enables shadow grading and applies optional parameters.
     */
    enableShadows(data: Omit<ColorGradingShadowsData, "enabled"> = {}): this {
        return this.setShadows({ ...data, enabled: true });
    }

    /**
     * Sets temperature-based color grading parameters.
     */
    setTemperature(data: ColorGradingTemperatureData): this {
        this.setValueAtPath(this.settingsPath("color_grading/temperature"), data);
        return this;
    }

    /**
     * Enables temperature grading.
     */
    enableTemperature(
        temperature: number = 6500,
        type: ColorGradingTemperatureData["type"] = "white_balance"
    ): this {
        return this.setTemperature({
            enabled: true,
            temperature,
            type
        });
    }

    /**
     * Sets the tone mapping operator.
     */
    setToneMappingOperator(operator: ToneMappingOperator): this {
        this.setValueAtPath(this.settingsPath("tone_mapping/operator"), operator);
        return this;
    }
}

/**
 * Fluent builder for `minecraft:cubemap_settings`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/cubemapcustomization
 */
export class CubemapSettingsDef extends GeneratorBase<CubemapSettingsDef> {
    data: CubemapSettingsDocumentData;

    /**
     * Creates a cubemap settings definition.
     */
    constructor(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_CUBEMAP_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:cubemap_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private settingsPath(path: string): string {
        return path.length === 0 ? "minecraft:cubemap_settings" : `minecraft:cubemap_settings/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: VibrantVisualsFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the settings identifier.
     */
    setIdentifier(identifier: VibrantVisualsIdentifier): this {
        this.setValueAtPath(this.settingsPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the cubemap lighting object.
     */
    setLighting(data: CubemapLightingData): this {
        this.setValueAtPath(this.settingsPath("lighting"), data);
        return this;
    }

    /**
     * Sets fixed or keyframed ambient light illuminance.
     */
    setAmbientLightIlluminance(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("lighting/ambient_light_illuminance"), value);
        return this;
    }

    /**
     * Sets how much sky light affects the cubemap.
     */
    setSkyLightContribution(value: number): this {
        this.setValueAtPath(this.settingsPath("lighting/sky_light_contribution"), value);
        return this;
    }

    /**
     * Sets how much directional light affects the cubemap.
     */
    setDirectionalLightContribution(value: number): this {
        this.setValueAtPath(this.settingsPath("lighting/directional_light_contribution"), value);
        return this;
    }

    /**
     * Sets whether atmospheric scattering affects the cubemap.
     */
    setAffectedByAtmosphericScattering(value: boolean): this {
        this.setValueAtPath(this.settingsPath("lighting/affected_by_atmospheric_scattering"), value);
        return this;
    }

    /**
     * Sets whether volumetric scattering affects the cubemap.
     */
    setAffectedByVolumetricScattering(value: boolean): this {
        this.setValueAtPath(this.settingsPath("lighting/affected_by_volumetric_scattering"), value);
        return this;
    }
}

/**
 * Fluent builder for `minecraft:lighting_settings`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/lightingcustomization
 */
export class LightingSettingsDef extends GeneratorBase<LightingSettingsDef> {
    data: LightingSettingsDocumentData;

    /**
     * Creates a lighting settings definition.
     */
    constructor(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_LIGHTING_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:lighting_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private settingsPath(path: string): string {
        return path.length === 0 ? "minecraft:lighting_settings" : `minecraft:lighting_settings/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: VibrantVisualsFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the settings identifier.
     */
    setIdentifier(identifier: VibrantVisualsIdentifier): this {
        this.setValueAtPath(this.settingsPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full lighting settings object, preserving description.
     */
    setLightingSettings(data: Partial<Omit<LightingSettingsData, "description">>): this {
        const description = this.getValueAtPath<VibrantVisualsDescriptionData>(
            this.settingsPath("description"),
            { identifier: "" }
        );
        this.setValueAtPath(this.settingsPath(""), { description, ...data });
        return this;
    }

    /**
     * Replaces the `directional_lights` object.
     */
    setDirectionalLights(data: LightingDirectionalLightsData): this {
        this.setValueAtPath(this.settingsPath("directional_lights"), data);
        return this;
    }

    /**
     * Sets the orbital sun light.
     */
    setSun(data: LightingDirectionalLightData): this {
        this.setValueAtPath(this.settingsPath("directional_lights/orbital/sun"), data);
        return this;
    }

    /**
     * Sets the orbital moon light.
     */
    setMoon(data: LightingDirectionalLightData): this {
        this.setValueAtPath(this.settingsPath("directional_lights/orbital/moon"), data);
        return this;
    }

    /**
     * Sets the orbital offset in degrees.
     */
    setOrbitalOffsetDegrees(value: VibrantVisualsKeyframed<number>): this {
        this.setValueAtPath(this.settingsPath("directional_lights/orbital/orbital_offset_degrees"), value);
        return this;
    }

    /**
     * Sets the End flash directional light.
     */
    setFlash(data: LightingDirectionalLightData): this {
        this.setValueAtPath(this.settingsPath("directional_lights/flash"), data);
        return this;
    }

    /**
     * Sets emissive light behavior.
     */
    setEmissive(data: LightingEmissiveData): this {
        this.setValueAtPath(this.settingsPath("emissive"), data);
        return this;
    }

    /**
     * Sets emissive desaturation.
     */
    setEmissiveDesaturation(value: number): this {
        return this.setEmissive({ desaturation: value });
    }

    /**
     * Sets ambient light fallback.
     */
    setAmbient(data: LightingAmbientData): this {
        this.setValueAtPath(this.settingsPath("ambient"), data);
        return this;
    }

    /**
     * Sets sky light contribution.
     */
    setSky(data: LightingSkyData): this {
        this.setValueAtPath(this.settingsPath("sky"), data);
        return this;
    }

    /**
     * Sets sky light intensity.
     */
    setSkyIntensity(value: VibrantVisualsKeyframed<number>): this {
        return this.setSky({ intensity: value });
    }
}

/**
 * Fluent builder for `minecraft:water_settings`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/watercustomization
 */
export class WaterSettingsDef extends GeneratorBase<WaterSettingsDef> {
    data: WaterSettingsDocumentData;

    /**
     * Creates a water settings definition.
     */
    constructor(
        identifier: VibrantVisualsIdentifier,
        formatVersion: VibrantVisualsFormatVersion = DEFAULT_WATER_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:water_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private settingsPath(path: string): string {
        return path.length === 0 ? "minecraft:water_settings" : `minecraft:water_settings/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: VibrantVisualsFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the settings identifier.
     */
    setIdentifier(identifier: VibrantVisualsIdentifier): this {
        this.setValueAtPath(this.settingsPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full water settings object, preserving description.
     */
    setWaterSettings(data: Partial<Omit<WaterSettingsData, "description">>): this {
        const description = this.getValueAtPath<VibrantVisualsDescriptionData>(
            this.settingsPath("description"),
            { identifier: "" }
        );
        this.setValueAtPath(this.settingsPath(""), { description, ...data });
        return this;
    }

    /**
     * Sets particle concentration values.
     */
    setParticleConcentrations(data: WaterParticleConcentrationsData): this;
    setParticleConcentrations(cdom?: number, chlorophyll?: number, suspendedSediment?: number): this;
    setParticleConcentrations(
        dataOrCdom: WaterParticleConcentrationsData | number = {},
        chlorophyll?: number,
        suspendedSediment?: number
    ): this {
        const data: WaterParticleConcentrationsData = typeof dataOrCdom === "number"
            ? { cdom: dataOrCdom }
            : { ...dataOrCdom };

        if (chlorophyll !== undefined) {
            data.chlorophyll = chlorophyll;
        }

        if (suspendedSediment !== undefined) {
            data.suspended_sediment = suspendedSediment;
        }

        this.setValueAtPath(this.settingsPath("particle_concentrations"), data);
        return this;
    }

    /**
     * Sets wave simulation parameters.
     */
    setWaves(data: WaterWavesData): this {
        this.setValueAtPath(this.settingsPath("waves"), data);
        return this;
    }

    /**
     * Sets caustics parameters.
     */
    setCaustics(data: WaterCausticsData): this {
        this.setValueAtPath(this.settingsPath("caustics"), data);
        return this;
    }

    /**
     * Sets how much client biome `surface_color` contributes to water color in
     * Vibrant Visuals.
     */
    setBiomeWaterColorContribution(value: number): this {
        this.setValueAtPath(this.settingsPath("biome_water_color_contribution"), value);
        return this;
    }
}
