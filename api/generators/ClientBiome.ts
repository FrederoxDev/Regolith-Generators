import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type ClientBiomeAmbientSoundsData,
    type ClientBiomeAppearanceColor,
    type ClientBiomeAtmosphereIdentifierData,
    type ClientBiomeColor,
    type ClientBiomeColorGradingIdentifierData,
    type ClientBiomeComponentId,
    type ClientBiomeCubemapIdentifierData,
    type ClientBiomeDocumentData,
    type ClientBiomeDryFoliageColorData,
    type ClientBiomeFogAppearanceData,
    type ClientBiomeFoliageAppearanceData,
    type ClientBiomeFoliageColorMap,
    type ClientBiomeFormatVersion,
    type ClientBiomeGrassAppearanceData,
    type ClientBiomeGrassColorMap,
    type ClientBiomeIdentifier,
    type ClientBiomeLightingIdentifierData,
    type ClientBiomeMusicData,
    type ClientBiomePrecipitationData,
    type ClientBiomePrecipitationType,
    type ClientBiomeSkyColorData,
    type ClientBiomeSoundAdditionData,
    type ClientBiomeSoundReference,
    type ClientBiomeWaterAppearanceData,
    type ClientBiomeWaterIdentifierData
} from "./ClientBiomeTypes.ts";

export * from "./ClientBiomeTypes.ts";

const DEFAULT_CLIENT_BIOME_FORMAT_VERSION: ClientBiomeFormatVersion = "1.21.110";
const CLIENT_BIOME_PATH = "minecraft:client_biome";

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Factory for resource-pack modern client biome files.
 *
 * Generated files are written under `RP/biomes`. These are per-biome
 * `minecraft:client_biome` files, not the legacy `biomes_client.json` file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/clientbiomesoverview
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/client_biome_json_file
 */
export class ClientBiomeGenerator extends GeneratorFactory<ClientBiomeDef> {
    /**
     * Creates a client biome generator that writes into `RP/biomes`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/biomes");
    }

    /**
     * Queues a modern client biome definition.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used. Use `makeClientBiomeForIdentifier` for vanilla biome ids or
     * already-qualified identifiers.
     */
    makeClientBiome(
        id: string,
        formatVersion: ClientBiomeFormatVersion = DEFAULT_CLIENT_BIOME_FORMAT_VERSION
    ): ClientBiomeDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new ClientBiomeDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues a modern client biome definition for an exact identifier.
     */
    makeClientBiomeForIdentifier(
        identifier: ClientBiomeIdentifier,
        formatVersion: ClientBiomeFormatVersion = DEFAULT_CLIENT_BIOME_FORMAT_VERSION
    ): ClientBiomeDef {
        const def = new ClientBiomeDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a modern `minecraft:client_biome` JSON file.
 *
 * Client biomes control biome visuals, audio, and Vibrant Visuals references.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/client_biome_definition
 */
export class ClientBiomeDef extends GeneratorBase<ClientBiomeDef> {
    data: ClientBiomeDocumentData;

    /**
     * Creates a client biome definition.
     */
    constructor(
        identifier: ClientBiomeIdentifier,
        formatVersion: ClientBiomeFormatVersion = DEFAULT_CLIENT_BIOME_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:client_biome": {
                "description": {
                    "identifier": identifier
                },
                "components": {}
            }
        };
    }

    private clientBiomePath(path: string): string {
        return path.length === 0 ? CLIENT_BIOME_PATH : `${CLIENT_BIOME_PATH}/${path}`;
    }

    private componentPath(componentId: string, path: string = ""): string {
        return this.clientBiomePath(`components/${componentId}${path.length === 0 ? "" : `/${path}`}`);
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: ClientBiomeFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the client biome identifier.
     */
    setIdentifier(identifier: ClientBiomeIdentifier): this {
        this.setValueAtPath(this.clientBiomePath("description/identifier"), identifier);
        return this;
    }

    /**
     * Sets a field inside the `minecraft:client_biome` object.
     */
    setClientBiomeProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.clientBiomePath(key), value);
        return this;
    }

    /**
     * Sets a field inside the client biome `description` object.
     */
    setDescriptionProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.clientBiomePath(`description/${key}`), value);
        return this;
    }

    /**
     * Adds or replaces a client biome component.
     *
     * Use this as the low-level escape hatch for component fields that do not
     * yet have a convenience method.
     */
    addComponent(componentId: ClientBiomeComponentId, data: unknown = {}): this {
        this.setValueAtPath(this.componentPath(componentId), data);
        return this;
    }

    /**
     * Sets a single field on a client biome component.
     */
    setComponentProperty(componentId: ClientBiomeComponentId, key: string, value: unknown): this {
        this.setValueAtPath(this.componentPath(componentId, key), value);
        return this;
    }

    /**
     * Adds the `minecraft:ambient_sounds` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_ambient_sounds
     */
    addAmbientSounds(data: ClientBiomeAmbientSoundsData): this {
        return this.addComponent("minecraft:ambient_sounds", data);
    }

    /**
     * Sets the ambient sound that occasionally plays at the listener position.
     */
    addAmbientSoundAddition(data: ClientBiomeSoundAdditionData): this;
    addAmbientSoundAddition(asset: string, chance: number): this;
    addAmbientSoundAddition(
        dataOrAsset: ClientBiomeSoundAdditionData | string,
        chance?: number
    ): this {
        const data = this.getValueAtPath<ClientBiomeAmbientSoundsData>(
            this.componentPath("minecraft:ambient_sounds"),
            {}
        );

        data.addition = typeof dataOrAsset === "string"
            ? { asset: dataOrAsset, chance: chance ?? 1 }
            : dataOrAsset;

        return this.addAmbientSounds(data);
    }

    /**
     * Sets the ambient sound that loops while the listener is inside the biome.
     */
    addAmbientLoopSound(loop: ClientBiomeSoundReference): this {
        const data = this.getValueAtPath<ClientBiomeAmbientSoundsData>(
            this.componentPath("minecraft:ambient_sounds"),
            {}
        );

        data.loop = loop;
        return this.addAmbientSounds(data);
    }

    /**
     * Sets the low-light mood sound for the biome.
     */
    addAmbientMoodSound(mood: ClientBiomeSoundReference): this {
        const data = this.getValueAtPath<ClientBiomeAmbientSoundsData>(
            this.componentPath("minecraft:ambient_sounds"),
            {}
        );

        data.mood = mood;
        return this.addAmbientSounds(data);
    }

    /**
     * Adds the `minecraft:atmosphere_identifier` component for Vibrant Visuals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_atmosphere_identifier
     */
    addAtmosphereIdentifier(identifier: string): this {
        const data: ClientBiomeAtmosphereIdentifierData = {
            atmosphere_identifier: identifier
        };
        return this.addComponent("minecraft:atmosphere_identifier", data);
    }

    /**
     * Adds the `minecraft:biome_music` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_biome_music
     */
    addBiomeMusic(data: ClientBiomeMusicData): this;
    addBiomeMusic(musicDefinition: string, volumeMultiplier?: number): this;
    addBiomeMusic(
        dataOrMusicDefinition: ClientBiomeMusicData | string,
        volumeMultiplier?: number
    ): this {
        const data: ClientBiomeMusicData = typeof dataOrMusicDefinition === "string"
            ? { music_definition: dataOrMusicDefinition }
            : { ...dataOrMusicDefinition };

        if (volumeMultiplier !== undefined) {
            data.volume_multiplier = volumeMultiplier;
        }

        return this.addComponent("minecraft:biome_music", data);
    }

    /**
     * Adds the `minecraft:color_grading_identifier` component for Vibrant
     * Visuals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_color_grading_identifier
     */
    addColorGradingIdentifier(identifier: string): this {
        const data: ClientBiomeColorGradingIdentifierData = {
            color_grading_identifier: identifier
        };
        return this.addComponent("minecraft:color_grading_identifier", data);
    }

    /**
     * Adds the `minecraft:cubemap_identifier` component for Vibrant Visuals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_cubemap_identifier
     */
    addCubemapIdentifier(identifier: string): this {
        const data: ClientBiomeCubemapIdentifierData = {
            cubemap_identifier: identifier
        };
        return this.addComponent("minecraft:cubemap_identifier", data);
    }

    /**
     * Adds the `minecraft:dry_foliage_color` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_dry_foliage_color
     */
    addDryFoliageColor(color: ClientBiomeColor): this {
        const data: ClientBiomeDryFoliageColorData = { color };
        return this.addComponent("minecraft:dry_foliage_color", data);
    }

    /**
     * Adds the `minecraft:fog_appearance` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_fog_appearance
     */
    addFogAppearance(fogIdentifier: string): this {
        const data: ClientBiomeFogAppearanceData = {
            fog_identifier: fogIdentifier
        };
        return this.addComponent("minecraft:fog_appearance", data);
    }

    /**
     * Adds the `minecraft:foliage_appearance` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_foliage_appearance
     */
    addFoliageAppearance(color: ClientBiomeAppearanceColor<ClientBiomeFoliageColorMap>): this {
        const data: ClientBiomeFoliageAppearanceData = { color };
        return this.addComponent("minecraft:foliage_appearance", data);
    }

    /**
     * Adds foliage rendering using a documented foliage color map.
     */
    addFoliageColorMap(colorMap: ClientBiomeFoliageColorMap): this {
        return this.addFoliageAppearance({ color_map: colorMap });
    }

    /**
     * Adds the `minecraft:grass_appearance` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_grass_appearance
     */
    addGrassAppearance(color: ClientBiomeAppearanceColor<ClientBiomeGrassColorMap>): this {
        const data: ClientBiomeGrassAppearanceData = { color };
        return this.addComponent("minecraft:grass_appearance", data);
    }

    /**
     * Adds grass rendering using a documented grass color map.
     */
    addGrassColorMap(colorMap: ClientBiomeGrassColorMap): this {
        return this.addGrassAppearance({ color_map: colorMap });
    }

    /**
     * Adds the `minecraft:lighting_identifier` component for Vibrant Visuals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_lighting_identifier
     */
    addLightingIdentifier(identifier: string): this {
        const data: ClientBiomeLightingIdentifierData = {
            lighting_identifier: identifier
        };
        return this.addComponent("minecraft:lighting_identifier", data);
    }

    /**
     * Adds the `minecraft:precipitation` component.
     *
     * At most one precipitation type can be set for a biome. This helper
     * replaces the component each time so the generated JSON stays valid.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_precipitation
     */
    addPrecipitation(type: ClientBiomePrecipitationType, density: number): this {
        const data: ClientBiomePrecipitationData = {
            [type]: density
        };
        return this.addComponent("minecraft:precipitation", data);
    }

    /**
     * Adds ash precipitation visuals.
     */
    addAshPrecipitation(density: number): this {
        return this.addPrecipitation("ash", density);
    }

    /**
     * Adds blue spore precipitation visuals.
     */
    addBlueSporesPrecipitation(density: number): this {
        return this.addPrecipitation("blue_spores", density);
    }

    /**
     * Adds red spore precipitation visuals.
     */
    addRedSporesPrecipitation(density: number): this {
        return this.addPrecipitation("red_spores", density);
    }

    /**
     * Adds white ash precipitation visuals.
     */
    addWhiteAshPrecipitation(density: number): this {
        return this.addPrecipitation("white_ash", density);
    }

    /**
     * Adds the `minecraft:sky_color` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_sky_color
     */
    addSkyColor(skyColor: ClientBiomeColor): this {
        const data: ClientBiomeSkyColorData = {
            sky_color: skyColor
        };
        return this.addComponent("minecraft:sky_color", data);
    }

    /**
     * Adds the `minecraft:water_appearance` component.
     *
     * Make sure at least one of surface color or opacity is specified.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_water_appearance
     */
    addWaterAppearance(data: ClientBiomeWaterAppearanceData): this;
    addWaterAppearance(surfaceColor?: ClientBiomeColor, surfaceOpacity?: number): this;
    addWaterAppearance(
        dataOrSurfaceColor: ClientBiomeWaterAppearanceData | ClientBiomeColor = {},
        surfaceOpacity?: number
    ): this {
        const data: ClientBiomeWaterAppearanceData = typeof dataOrSurfaceColor === "string"
            || Array.isArray(dataOrSurfaceColor)
            ? { surface_color: dataOrSurfaceColor }
            : { ...dataOrSurfaceColor };

        if (surfaceOpacity !== undefined) {
            data.surface_opacity = surfaceOpacity;
        }

        return this.addComponent("minecraft:water_appearance", data);
    }

    /**
     * Adds the `minecraft:water_identifier` component for Vibrant Visuals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/clientbiomesreference/examples/components/minecraftclientbiomes_water_identifier
     */
    addWaterIdentifier(identifier: string): this {
        const data: ClientBiomeWaterIdentifierData = {
            water_identifier: identifier
        };
        return this.addComponent("minecraft:water_identifier", data);
    }
}
