import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type FogColor,
    type FogDensityEnvironment,
    type FogDistanceCollectionData,
    type FogDistanceEnvironment,
    type FogDistanceSettingsData,
    type FogDocumentData,
    type FogFormatVersion,
    type FogHenyeyGreensteinData,
    type FogHenyeyGreensteinEnvironment,
    type FogIdentifier,
    type FogMediaCoefficientData,
    type FogMediaEnvironment,
    type FogRenderDistanceType,
    type FogTransitionData,
    type FogVolumetricData,
    type FogVolumetricDensityData
} from "./FogTypes.ts";

export * from "./FogTypes.ts";

const DEFAULT_FOG_FORMAT_VERSION: FogFormatVersion = "1.21.90";
const FOG_SETTINGS_PATH = "minecraft:fog_settings";

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

function makeDistanceFog(
    fogStart: number,
    fogEnd: number,
    fogColor: FogColor,
    renderDistanceType: FogRenderDistanceType = "fixed"
): FogDistanceSettingsData {
    return {
        fog_start: fogStart,
        fog_end: fogEnd,
        fog_color: fogColor,
        render_distance_type: renderDistanceType
    };
}

/**
 * Factory for resource-pack fog settings files.
 *
 * Generated files are written under `RP/fogs`. Fog identifiers can be
 * referenced by modern client biome `minecraft:fog_appearance` components or
 * by the `/fog` command.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/fogsreference/fogs
 * @see https://learn.microsoft.com/minecraft/creator/documents/foginresourcepacks
 */
export class FogGenerator extends GeneratorFactory<FogDef> {
    /**
     * Creates a fog generator that writes into `RP/fogs`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/fogs");
    }

    /**
     * Queues a fog settings file.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used.
     */
    makeFog(
        id: string,
        formatVersion: FogFormatVersion = DEFAULT_FOG_FORMAT_VERSION
    ): FogDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new FogDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues a fog settings file for an already-qualified identifier.
     */
    makeFogForIdentifier(
        identifier: FogIdentifier,
        formatVersion: FogFormatVersion = DEFAULT_FOG_FORMAT_VERSION
    ): FogDef {
        const def = new FogDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a resource-pack `minecraft:fog_settings` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/fogsreference/fogs
 */
export class FogDef extends GeneratorBase<FogDef> {
    data: FogDocumentData;

    /**
     * Creates a fog settings definition.
     */
    constructor(
        identifier: FogIdentifier,
        formatVersion: FogFormatVersion = DEFAULT_FOG_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:fog_settings": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private fogPath(path: string): string {
        return path.length === 0 ? FOG_SETTINGS_PATH : `${FOG_SETTINGS_PATH}/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: FogFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the fog identifier.
     */
    setIdentifier(identifier: FogIdentifier): this {
        this.setValueAtPath(this.fogPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Sets a field inside `minecraft:fog_settings`.
     */
    setFogSettingsProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.fogPath(key), value);
        return this;
    }

    /**
     * Replaces the full `distance` object.
     */
    setDistance(distance: FogDistanceCollectionData): this {
        this.setValueAtPath(this.fogPath("distance"), distance);
        return this;
    }

    /**
     * Sets distance fog for one camera location.
     */
    setDistanceFog(environment: FogDistanceEnvironment, data: FogDistanceSettingsData): this {
        this.setValueAtPath(this.fogPath(`distance/${environment}`), data);
        return this;
    }

    /**
     * Sets distance fog for one camera location using the common start/end
     * shorthand.
     */
    setDistanceFogValues(
        environment: FogDistanceEnvironment,
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType: FogRenderDistanceType = "fixed"
    ): this {
        return this.setDistanceFog(
            environment,
            makeDistanceFog(fogStart, fogEnd, fogColor, renderDistanceType)
        );
    }

    /**
     * Sets distance fog for air.
     */
    setAirDistanceFog(data: FogDistanceSettingsData): this;
    setAirDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setAirDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "render"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#FFFFFF", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("air", data);
    }

    /**
     * Sets distance fog for weather.
     */
    setWeatherDistanceFog(data: FogDistanceSettingsData): this;
    setWeatherDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setWeatherDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "render"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#666666", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("weather", data);
    }

    /**
     * Sets distance fog for water.
     */
    setWaterDistanceFog(data: FogDistanceSettingsData): this;
    setWaterDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setWaterDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "fixed"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#44AFF5", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("water", data);
    }

    /**
     * Sets distance fog for lava.
     */
    setLavaDistanceFog(data: FogDistanceSettingsData): this;
    setLavaDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setLavaDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "fixed"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#991A00", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("lava", data);
    }

    /**
     * Sets distance fog for lava while the player has Lava Resistance.
     */
    setLavaResistanceDistanceFog(data: FogDistanceSettingsData): this;
    setLavaResistanceDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setLavaResistanceDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "fixed"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#991A00", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("lava_resistance", data);
    }

    /**
     * Sets distance fog for Powder Snow.
     */
    setPowderSnowDistanceFog(data: FogDistanceSettingsData): this;
    setPowderSnowDistanceFog(
        fogStart: number,
        fogEnd: number,
        fogColor: FogColor,
        renderDistanceType?: FogRenderDistanceType
    ): this;
    setPowderSnowDistanceFog(
        dataOrFogStart: FogDistanceSettingsData | number,
        fogEnd?: number,
        fogColor?: FogColor,
        renderDistanceType: FogRenderDistanceType = "fixed"
    ): this {
        const data = typeof dataOrFogStart === "number"
            ? makeDistanceFog(dataOrFogStart, fogEnd ?? dataOrFogStart, fogColor ?? "#FFFFFF", renderDistanceType)
            : dataOrFogStart;

        return this.setDistanceFog("powder_snow", data);
    }

    /**
     * Sets the water-only `transition_fog` data.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/foginresourcepacks#transition_fog
     */
    setWaterTransitionFog(transitionFog: FogTransitionData): this {
        this.setValueAtPath(this.fogPath("distance/water/transition_fog"), transitionFog);
        return this;
    }

    /**
     * Replaces the full `volumetric` object.
     */
    setVolumetric(volumetric: FogVolumetricData): this {
        this.setValueAtPath(this.fogPath("volumetric"), volumetric);
        return this;
    }

    /**
     * Sets volumetric density for one camera location.
     */
    setVolumetricDensity(environment: FogDensityEnvironment, data: FogVolumetricDensityData): this {
        this.setValueAtPath(this.fogPath(`volumetric/density/${environment}`), data);
        return this;
    }

    /**
     * Sets volumetric scattering and absorption coefficients for one medium.
     */
    setMediaCoefficients(environment: FogMediaEnvironment, data: FogMediaCoefficientData): this {
        this.setValueAtPath(this.fogPath(`volumetric/media_coefficients/${environment}`), data);
        return this;
    }

    /**
     * Sets a Vibrant Visuals Henyey-Greenstein scattering value.
     *
     * This requires fog `format_version` `1.21.90` or newer.
     */
    setHenyeyGreensteinG(environment: FogHenyeyGreensteinEnvironment, value: number): this {
        const data: FogHenyeyGreensteinData = {
            henyey_greenstein_g: value
        };
        this.setValueAtPath(this.fogPath(`volumetric/henyey_greenstein_g/${environment}`), data);
        return this;
    }
}
