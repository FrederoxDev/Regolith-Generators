import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type BiomeBlockReference,
    type BiomeCappedSurfaceBuilderData,
    type BiomeClimateData,
    type BiomeColor,
    type BiomeComponentId,
    type BiomeCreatureSpawnProbabilityData,
    type BiomeDocumentData,
    type BiomeFormatVersion,
    type BiomeFrozenOceanSurfaceBuilderData,
    type BiomeHumidityData,
    type BiomeIdentifier,
    type BiomeMapTintGrass,
    type BiomeMapTintsData,
    type BiomeMountainParametersData,
    type BiomeMultinoiseGenerationRulesData,
    type BiomeNoiseGradientData,
    type BiomeNumberRange,
    type BiomeOverworldGenerationRulesData,
    type BiomeOverworldHeightData,
    type BiomeOverworldHeightNoiseType,
    type BiomeOverworldSurfaceBuilderData,
    type BiomePartiallyFrozenData,
    type BiomeReplaceBiomesData,
    type BiomeReplacementData,
    type BiomeMesaSurfaceBuilderData,
    type BiomeSurfaceBuilderData,
    type BiomeSurfaceMaterialAdjustmentData,
    type BiomeSurfaceMaterialAdjustmentsData,
    type BiomeSwampSurfaceBuilderData,
    type BiomeTag,
    type BiomeTagsData,
    type BiomeVillageType,
    type BiomeVillageTypeData
} from "./BiomeTypes.ts";

export * from "./BiomeTypes.ts";

const DEFAULT_BIOME_FORMAT_VERSION: BiomeFormatVersion = "1.21.110";
const BIOME_PATH = "minecraft:biome";

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Factory for behavior-pack server-side biome files.
 *
 * Generated files are written under `BP/biomes`. These files define gameplay
 * and terrain behavior through `minecraft:biome`; modern client-side visuals
 * and audio live in separate `minecraft:client_biome` files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_json_file
 */
export class BiomeGenerator extends GeneratorFactory<BiomeDef> {
    /**
     * Creates a biome generator that writes into `BP/biomes`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/biomes");
    }

    /**
     * Queues a server-side biome definition.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used.
     */
    makeBiome(
        id: string,
        formatVersion: BiomeFormatVersion = DEFAULT_BIOME_FORMAT_VERSION
    ): BiomeDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new BiomeDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues a server-side biome definition for an already-qualified
     * identifier.
     */
    makeBiomeForIdentifier(
        identifier: BiomeIdentifier,
        formatVersion: BiomeFormatVersion = DEFAULT_BIOME_FORMAT_VERSION
    ): BiomeDef {
        const def = new BiomeDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a server-side `minecraft:biome` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_json_file
 */
export class BiomeDef extends GeneratorBase<BiomeDef> {
    data: BiomeDocumentData;

    /**
     * Creates a biome definition.
     */
    constructor(
        identifier: BiomeIdentifier,
        formatVersion: BiomeFormatVersion = DEFAULT_BIOME_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:biome": {
                "description": {
                    "identifier": identifier
                },
                "components": {}
            }
        };
    }

    private biomePath(path: string): string {
        return path.length === 0 ? BIOME_PATH : `${BIOME_PATH}/${path}`;
    }

    private componentPath(componentId: string, path: string = ""): string {
        return this.biomePath(`components/${componentId}${path.length === 0 ? "" : `/${path}`}`);
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: BiomeFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the biome identifier.
     */
    setIdentifier(identifier: BiomeIdentifier): this {
        this.setValueAtPath(this.biomePath("description/identifier"), identifier);
        return this;
    }

    /**
     * Sets a field inside the `minecraft:biome` object.
     */
    setBiomeProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.biomePath(key), value);
        return this;
    }

    /**
     * Sets a field inside the biome `description` object.
     */
    setDescriptionProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.biomePath(`description/${key}`), value);
        return this;
    }

    /**
     * Adds or replaces a biome component.
     *
     * Use this as the low-level escape hatch for component fields that do not
     * yet have a convenience method.
     */
    addComponent(componentId: BiomeComponentId, data: unknown = {}): this {
        this.setValueAtPath(this.componentPath(componentId), data);
        return this;
    }

    /**
     * Sets a single field on a biome component.
     */
    setComponentProperty(componentId: BiomeComponentId, key: string, value: unknown): this {
        this.setValueAtPath(this.componentPath(componentId, key), value);
        return this;
    }

    /**
     * Adds the `minecraft:climate` component.
     *
     * This controls server-side temperature, downfall, and snow accumulation.
     * Visual Nether particles such as ash and spores now belong in the modern
     * client-side `minecraft:precipitation` component instead.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_climate
     */
    addClimate(data?: BiomeClimateData): this;
    addClimate(temperature: number, downfall?: number, snowAccumulation?: BiomeNumberRange): this;
    addClimate(
        temperatureOrData: number | BiomeClimateData = {},
        downfall?: number,
        snowAccumulation?: BiomeNumberRange
    ): this {
        const data: BiomeClimateData = typeof temperatureOrData === "number"
            ? { temperature: temperatureOrData }
            : { ...temperatureOrData };

        if (downfall !== undefined) {
            data.downfall = downfall;
        }

        if (snowAccumulation !== undefined) {
            data.snow_accumulation = snowAccumulation;
        }

        return this.addComponent("minecraft:climate", data);
    }

    /**
     * Adds the `minecraft:creature_spawn_probability` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_creature_spawn_probability
     */
    addCreatureSpawnProbability(probability: number): this {
        const data: BiomeCreatureSpawnProbabilityData = { probability };
        return this.addComponent("minecraft:creature_spawn_probability", data);
    }

    /**
     * Adds the `minecraft:humidity` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_humidity
     */
    addHumidity(isHumid: boolean = true): this {
        const data: BiomeHumidityData = { is_humid: isHumid };
        return this.addComponent("minecraft:humidity", data);
    }

    /**
     * Adds the `minecraft:map_tints` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_map_tints
     */
    addMapTints(grass: BiomeMapTintGrass, foliage?: BiomeColor): this {
        const data: BiomeMapTintsData = { grass };

        if (foliage !== undefined) {
            data.foliage = foliage;
        }

        return this.addComponent("minecraft:map_tints", data);
    }

    /**
     * Adds the `minecraft:mountain_parameters` component.
     *
     * This is retained for full schema coverage. For current custom terrain,
     * prefer `addSurfaceBuilder`, `addNoiseGradientSurface`, and
     * `addSurfaceMaterialAdjustments`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_mountain_parameters
     */
    addMountainParameters(data: BiomeMountainParametersData): this {
        return this.addComponent("minecraft:mountain_parameters", data);
    }

    /**
     * Adds the `minecraft:multinoise_generation_rules` component.
     *
     * @deprecated Microsoft documents this as pre-Caves-and-Cliffs and unused
     * for custom biomes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_multinoise_generation_rules
     */
    addMultinoiseGenerationRules(data: BiomeMultinoiseGenerationRulesData): this {
        return this.addComponent("minecraft:multinoise_generation_rules", data);
    }

    /**
     * Adds the `minecraft:overworld_generation_rules` component.
     *
     * @deprecated Microsoft documents this as pre-Caves-and-Cliffs and unused
     * for custom biomes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_overworld_generation_rules
     */
    addOverworldGenerationRules(data: BiomeOverworldGenerationRulesData): this {
        return this.addComponent("minecraft:overworld_generation_rules", data);
    }

    /**
     * Adds the `minecraft:overworld_height` component.
     *
     * @deprecated Microsoft documents this as pre-Caves-and-Cliffs. It does
     * not change Overworld height and currently only affects map item
     * rendering.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_overworld_height
     */
    addOverworldHeight(data: BiomeOverworldHeightData): this;
    addOverworldHeight(noiseParams: BiomeNumberRange, noiseType?: BiomeOverworldHeightNoiseType): this;
    addOverworldHeight(
        dataOrNoiseParams: BiomeOverworldHeightData | BiomeNumberRange,
        noiseType?: BiomeOverworldHeightNoiseType
    ): this {
        const data: BiomeOverworldHeightData = Array.isArray(dataOrNoiseParams)
            ? { noise_params: dataOrNoiseParams }
            : { ...dataOrNoiseParams };

        if (noiseType !== undefined) {
            data.noise_type = noiseType;
        }

        return this.addComponent("minecraft:overworld_height", data);
    }

    /**
     * Adds the `minecraft:partially_frozen` marker component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_components
     */
    addPartiallyFrozen(data: BiomePartiallyFrozenData = {}): this {
        return this.addComponent("minecraft:partially_frozen", data);
    }

    /**
     * Adds the `minecraft:noise_gradient` component directly.
     *
     * Microsoft also documents this shape as a surface builder. Use
     * `addNoiseGradientSurface` when you want it nested under
     * `minecraft:surface_builder`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_noise_gradient
     */
    addNoiseGradient(data: BiomeNoiseGradientData): this {
        return this.addComponent("minecraft:noise_gradient", data);
    }

    /**
     * Replaces the `minecraft:replace_biomes` component with one or more
     * replacement entries.
     *
     * This is the modern 1.21.110 biome replacement path.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_replace_biomes
     */
    addReplaceBiomes(replacements: BiomeReplacementData | BiomeReplacementData[]): this {
        const data: BiomeReplaceBiomesData = {
            replacements: toArray(replacements)
        };
        return this.addComponent("minecraft:replace_biomes", data);
    }

    /**
     * Appends one biome replacement entry.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_replacement
     */
    addBiomeReplacement(replacement: BiomeReplacementData): this {
        const data = this.getValueAtPath<BiomeReplaceBiomesData>(
            this.componentPath("minecraft:replace_biomes"),
            { replacements: [] }
        );

        data.replacements.push(replacement);
        return this.addComponent("minecraft:replace_biomes", data);
    }

    /**
     * Adds the `minecraft:surface_builder` component with a documented builder
     * object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_surface_builder
     */
    addSurfaceBuilder(builder: BiomeSurfaceBuilderData): this {
        return this.addComponent("minecraft:surface_builder", { builder });
    }

    /**
     * Adds an Overworld surface builder using the common material slots.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_surface_builder
     */
    addOverworldSurface(
        topMaterial: BiomeBlockReference,
        midMaterial: BiomeBlockReference,
        seaFloorMaterial: BiomeBlockReference,
        foundationMaterial: BiomeBlockReference = "minecraft:stone",
        seaMaterial: BiomeBlockReference = "minecraft:water",
        seaFloorDepth: number = 7
    ): this {
        const builder: BiomeOverworldSurfaceBuilderData = {
            type: "minecraft:overworld",
            foundation_material: foundationMaterial,
            mid_material: midMaterial,
            sea_floor_depth: seaFloorDepth,
            sea_floor_material: seaFloorMaterial,
            sea_material: seaMaterial,
            top_material: topMaterial
        };

        return this.addSurfaceBuilder(builder);
    }

    /**
     * Adds a frozen-ocean surface builder.
     */
    addFrozenOceanSurface(builder: Omit<BiomeFrozenOceanSurfaceBuilderData, "type"> = {}): this {
        return this.addSurfaceBuilder({ type: "minecraft:frozen_ocean", ...builder });
    }

    /**
     * Adds a mesa surface builder.
     */
    addMesaSurface(builder: Omit<BiomeMesaSurfaceBuilderData, "type"> = {}): this {
        return this.addSurfaceBuilder({ type: "minecraft:mesa", ...builder });
    }

    /**
     * Adds a swamp surface builder.
     */
    addSwampSurface(builder: Omit<BiomeSwampSurfaceBuilderData, "type"> = {}): this {
        return this.addSurfaceBuilder({ type: "minecraft:swamp", ...builder });
    }

    /**
     * Adds a capped surface builder.
     */
    addCappedSurface(builder: Omit<BiomeCappedSurfaceBuilderData, "type">): this {
        return this.addSurfaceBuilder({ type: "minecraft:capped", ...builder });
    }

    /**
     * Adds the default End surface builder.
     */
    addTheEndSurface(): this {
        return this.addSurfaceBuilder({ type: "minecraft:the_end" });
    }

    /**
     * Adds a noise-gradient surface builder.
     *
     * Noise-gradient processing is implemented with sub-terrain height ranges
     * in mind and is useful for modern custom terrain material bands.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_noise_gradient
     */
    addNoiseGradientSurface(builder: Omit<BiomeNoiseGradientData, "type">): this {
        return this.addSurfaceBuilder({ type: "minecraft:noise_gradient", ...builder });
    }

    /**
     * Adds the `minecraft:subsurface_builder` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/biome_components
     */
    addSubsurfaceBuilder(builder: BiomeSurfaceBuilderData): this {
        return this.addComponent("minecraft:subsurface_builder", { builder });
    }

    /**
     * Replaces the `minecraft:surface_material_adjustments` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_surface_material_adjustments
     */
    addSurfaceMaterialAdjustments(
        adjustments: BiomeSurfaceMaterialAdjustmentData | BiomeSurfaceMaterialAdjustmentData[]
    ): this {
        const data: BiomeSurfaceMaterialAdjustmentsData = {
            adjustments: toArray(adjustments)
        };
        return this.addComponent("minecraft:surface_material_adjustments", data);
    }

    /**
     * Appends one surface material adjustment.
     */
    addSurfaceMaterialAdjustment(adjustment: BiomeSurfaceMaterialAdjustmentData): this {
        const data = this.getValueAtPath<BiomeSurfaceMaterialAdjustmentsData>(
            this.componentPath("minecraft:surface_material_adjustments"),
            { adjustments: [] }
        );

        data.adjustments.push(adjustment);
        return this.addComponent("minecraft:surface_material_adjustments", data);
    }

    /**
     * Replaces the `minecraft:tags` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_tags
     */
    addTags(tags: BiomeTag | BiomeTag[]): this {
        const data: BiomeTagsData = {
            tags: toArray(tags)
        };
        return this.addComponent("minecraft:tags", data);
    }

    /**
     * Adds a single biome tag without duplicating an existing tag.
     */
    addTag(tag: BiomeTag): this {
        const data = this.getValueAtPath<BiomeTagsData>(
            this.componentPath("minecraft:tags"),
            { tags: [] }
        );

        if (!data.tags.includes(tag)) {
            data.tags.push(tag);
        }

        return this.addComponent("minecraft:tags", data);
    }

    /**
     * Adds the `minecraft:village_type` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/biomesreference/examples/components/minecraftbiomes_village_type
     */
    addVillageType(type: BiomeVillageType): this {
        const data: BiomeVillageTypeData = { type };
        return this.addComponent("minecraft:village_type", data);
    }
}
