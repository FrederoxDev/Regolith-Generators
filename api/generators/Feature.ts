import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type FeatureAggregateData,
    type FeatureBlockReference,
    type FeatureCarverData,
    type FeatureDataFor,
    type FeatureDefinitionData,
    type FeatureDocumentData,
    type FeatureFormatVersion,
    type FeatureFossilData,
    type FeatureGeodeData,
    type FeatureGrowingPlantData,
    type FeatureHeightDifferenceFilterData,
    type FeatureIdentifier,
    type FeatureMultifaceData,
    type FeatureOreData,
    type FeatureOreReplaceRuleData,
    type FeaturePartiallyExposedBlobData,
    type FeatureReference,
    type FeatureScatterData,
    type FeatureScatterDistributionData,
    type FeatureSearchAxis,
    type FeatureSearchData,
    type FeatureSearchVolumeData,
    type FeatureSequenceData,
    type FeatureSingleBlockData,
    type FeatureSingleBlockPlacement,
    type FeatureSnapSurface,
    type FeatureSnapToSurfaceData,
    type FeatureStructureTemplateData,
    type FeatureSurfaceRelativeThresholdData,
    type FeatureTreeData,
    type FeatureType,
    type FeatureVegetationPatchData,
    type FeatureWeightedRandomData,
    type FeatureWeightedBlock,
    type FeatureWeightedRange,
    type FeatureWeightedReference
} from "./FeatureTypes.ts";

export * from "./FeatureTypes.ts";

const DEFAULT_FEATURE_FORMAT_VERSION: FeatureFormatVersion = "1.13.0";
const DEFAULT_MODERN_SCATTER_FORMAT_VERSION: FeatureFormatVersion = "1.21.20";
const DEFAULT_SINGLE_BLOCK_FORMAT_VERSION: FeatureFormatVersion = "1.21.40";

type FeatureOptions<TFeatureData extends FeatureDefinitionData> =
    Partial<Omit<TFeatureData, "description">> & {
        /**
         * Root feature document format version.
         */
        formatVersion?: FeatureFormatVersion;
    };

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function toWeightedReferenceArray(
    value: FeatureWeightedReference | FeatureWeightedReference[]
): FeatureWeightedReference[] {
    return typeof value[0] === "string"
        ? [value as FeatureWeightedReference]
        : value as FeatureWeightedReference[];
}

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Factory for behavior-pack world-generation feature files.
 *
 * Generated files are written under `BP/features`. A feature file contains a
 * root `format_version` plus exactly one supported feature definition such as
 * `minecraft:ore_feature`, `minecraft:scatter_feature`, or
 * `minecraft:structure_template_feature`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featurelist
 */
export class FeatureGenerator extends GeneratorFactory<FeatureDef> {
    /**
     * Creates a feature generator that writes into `BP/features`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/features");
    }

    private storeFeature<TFeatureData extends FeatureDefinitionData>(
        identifier: FeatureIdentifier,
        def: FeatureDef<TFeatureData>
    ): FeatureDef<TFeatureData> {
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def as FeatureDef);
        return def;
    }

    /**
     * Queues an arbitrary supported feature type.
     *
     * This is the low-level escape hatch for feature fields that do not yet
     * have a convenience method.
     */
    makeFeature<TFeatureType extends FeatureType>(
        featureType: TFeatureType,
        id: string,
        data: Partial<Omit<FeatureDataFor<TFeatureType>, "description">> = {},
        formatVersion: FeatureFormatVersion = DEFAULT_FEATURE_FORMAT_VERSION
    ): FeatureDef<FeatureDataFor<TFeatureType>> {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new FeatureDef<FeatureDataFor<TFeatureType>>(featureType, identifier, data, formatVersion);
        return this.storeFeature(identifier, def);
    }

    /**
     * Queues a feature for an already-qualified identifier.
     */
    makeFeatureForIdentifier<TFeatureType extends FeatureType>(
        featureType: TFeatureType,
        identifier: FeatureIdentifier,
        data: Partial<Omit<FeatureDataFor<TFeatureType>, "description">> = {},
        formatVersion: FeatureFormatVersion = DEFAULT_FEATURE_FORMAT_VERSION
    ): FeatureDef<FeatureDataFor<TFeatureType>> {
        const def = new FeatureDef<FeatureDataFor<TFeatureType>>(featureType, identifier, data, formatVersion);
        return this.storeFeature(identifier, def);
    }

    /**
     * Queues a `minecraft:aggregate_feature`.
     *
     * Aggregate features place a collection of child features at the same input
     * position with no guaranteed order.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_aggregate_feature
     */
    makeAggregateFeature(
        id: string,
        features: FeatureReference | FeatureReference[],
        options: FeatureOptions<FeatureAggregateData> = {}
    ): FeatureDef<FeatureAggregateData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:aggregate_feature", id, {
            ...rest,
            features: toArray(features)
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:cave_carver_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_cave_carver_feature
     */
    makeCaveCarverFeature(
        id: string,
        options: FeatureOptions<FeatureCarverData> = {}
    ): FeatureDef<FeatureCarverData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:cave_carver_feature", id, rest, formatVersion);
    }

    /**
     * Queues a `minecraft:nether_cave_carver_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_nether_cave_carver_feature
     */
    makeNetherCaveCarverFeature(
        id: string,
        options: FeatureOptions<FeatureCarverData> = {}
    ): FeatureDef<FeatureCarverData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:nether_cave_carver_feature", id, rest, formatVersion);
    }

    /**
     * Queues a `minecraft:underwater_cave_carver_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_underwater_cave_carver_feature
     */
    makeUnderwaterCaveCarverFeature(
        id: string,
        options: FeatureOptions<FeatureCarverData> = {}
    ): FeatureDef<FeatureCarverData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:underwater_cave_carver_feature", id, rest, formatVersion);
    }

    /**
     * Queues a `minecraft:fossil_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_fossil_feature
     */
    makeFossilFeature(
        id: string,
        maxEmptyCorners: number,
        options: FeatureOptions<FeatureFossilData> = {}
    ): FeatureDef<FeatureFossilData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:fossil_feature", id, {
            ...rest,
            max_empty_corners: maxEmptyCorners
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:geode_feature`.
     *
     * Geodes have many layer, distance, crack, and placement settings, so this
     * helper accepts the full documented data object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_geode_feature
     */
    makeGeodeFeature(
        id: string,
        options: FeatureOptions<FeatureGeodeData> = {}
    ): FeatureDef<FeatureGeodeData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:geode_feature", id, rest, formatVersion);
    }

    /**
     * Queues a `minecraft:growing_plant_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_growing_plant_feature
     */
    makeGrowingPlantFeature(
        id: string,
        heightDistribution: FeatureWeightedRange[],
        growthDirection: "UP" | "DOWN" | (string & {}),
        bodyBlocks: FeatureWeightedBlock[],
        headBlocks: FeatureWeightedBlock[],
        options: FeatureOptions<FeatureGrowingPlantData> = {}
    ): FeatureDef<FeatureGrowingPlantData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:growing_plant_feature", id, {
            ...rest,
            height_distribution: heightDistribution,
            growth_direction: growthDirection,
            body_blocks: bodyBlocks,
            head_blocks: headBlocks
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:height_difference_filter_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_height_difference_filter_feature
     */
    makeHeightDifferenceFilterFeature(
        id: string,
        searchRadius: number,
        options: FeatureOptions<FeatureHeightDifferenceFilterData> = {}
    ): FeatureDef<FeatureHeightDifferenceFilterData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:height_difference_filter_feature", id, {
            ...rest,
            search_radius: searchRadius
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:multiface_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_multiface_feature
     */
    makeMultifaceFeature(
        id: string,
        placesBlock: FeatureBlockReference,
        searchRange: number,
        options: FeatureOptions<FeatureMultifaceData> = {}
    ): FeatureDef<FeatureMultifaceData> {
        const {
            formatVersion = DEFAULT_FEATURE_FORMAT_VERSION,
            can_place_on_floor = true,
            can_place_on_ceiling = true,
            can_place_on_wall = true,
            ...rest
        } = options;

        return this.makeFeature("minecraft:multiface_feature", id, {
            ...rest,
            places_block: placesBlock,
            search_range: searchRange,
            can_place_on_floor,
            can_place_on_ceiling,
            can_place_on_wall
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:ore_feature`.
     *
     * Ore features place a vein of blocks using ordered replacement rules.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_ore_feature
     */
    makeOreFeature(
        id: string,
        count: number,
        replaceRules: FeatureOreReplaceRuleData | FeatureOreReplaceRuleData[],
        options: FeatureOptions<FeatureOreData> = {}
    ): FeatureDef<FeatureOreData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:ore_feature", id, {
            ...rest,
            count,
            replace_rules: toArray(replaceRules)
        }, formatVersion);
    }

    /**
     * Queues a simple one-rule `minecraft:ore_feature`.
     */
    makeSimpleOreFeature(
        id: string,
        placesBlock: FeatureBlockReference,
        mayReplace: FeatureBlockReference | FeatureBlockReference[],
        count: number,
        options: FeatureOptions<FeatureOreData> = {}
    ): FeatureDef<FeatureOreData> {
        return this.makeOreFeature(id, count, {
            places_block: placesBlock,
            may_replace: toArray(mayReplace)
        }, options);
    }

    /**
     * Queues a `minecraft:partially_exposed_blob_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_partially_exposed_blob_feature
     */
    makePartiallyExposedBlobFeature(
        id: string,
        placesBlock: FeatureBlockReference,
        placementRadiusAroundFloor: number,
        placementProbabilityPerValidPosition: number,
        options: FeatureOptions<FeaturePartiallyExposedBlobData> = {}
    ): FeatureDef<FeaturePartiallyExposedBlobData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:partially_exposed_blob_feature", id, {
            ...rest,
            places_block: placesBlock,
            placement_radius_around_floor: placementRadiusAroundFloor,
            placement_probability_per_valid_position: placementProbabilityPerValidPosition
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:scatter_feature`.
     *
     * Modern scatter features use a nested `distribution` object introduced in
     * format version `1.21.20`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_scatter_feature
     */
    makeScatterFeature(
        id: string,
        placesFeature: FeatureReference,
        distribution: FeatureScatterDistributionData,
        options: FeatureOptions<FeatureScatterData> = {}
    ): FeatureDef<FeatureScatterData> {
        const { formatVersion = DEFAULT_MODERN_SCATTER_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:scatter_feature", id, {
            ...rest,
            places_feature: placesFeature,
            distribution
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:search_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_search_feature
     */
    makeSearchFeature(
        id: string,
        placesFeature: FeatureReference,
        searchAxis: FeatureSearchAxis,
        searchVolume: FeatureSearchVolumeData,
        options: FeatureOptions<FeatureSearchData> = {}
    ): FeatureDef<FeatureSearchData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:search_feature", id, {
            ...rest,
            places_feature: placesFeature,
            search_axis: searchAxis,
            search_volume: searchVolume
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:sequence_feature`.
     *
     * Sequence features place child features in order, passing each successful
     * output position to the next feature.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_sequence_feature
     */
    makeSequenceFeature(
        id: string,
        features: FeatureReference | FeatureReference[],
        options: FeatureOptions<FeatureSequenceData> = {}
    ): FeatureDef<FeatureSequenceData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:sequence_feature", id, {
            ...rest,
            features: toArray(features)
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:single_block_feature`.
     *
     * Single block features require format version `1.21.40` or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_single_block_feature
     */
    makeSingleBlockFeature(
        id: string,
        placesBlock: FeatureSingleBlockPlacement,
        options: FeatureOptions<FeatureSingleBlockData> = {}
    ): FeatureDef<FeatureSingleBlockData> {
        const { formatVersion = DEFAULT_SINGLE_BLOCK_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:single_block_feature", id, {
            ...rest,
            places_block: placesBlock
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:snap_to_surface_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_snap_to_surface_feature
     */
    makeSnapToSurfaceFeature(
        id: string,
        featureToSnap: FeatureReference,
        verticalSearchRange: number,
        surface: FeatureSnapSurface = "floor",
        options: FeatureOptions<FeatureSnapToSurfaceData> = {}
    ): FeatureDef<FeatureSnapToSurfaceData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:snap_to_surface_feature", id, {
            ...rest,
            feature_to_snap: featureToSnap,
            vertical_search_range: verticalSearchRange,
            surface
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:structure_template_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_structure_template_feature
     */
    makeStructureTemplateFeature(
        id: string,
        structureName: string,
        options: FeatureOptions<FeatureStructureTemplateData> = {}
    ): FeatureDef<FeatureStructureTemplateData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:structure_template_feature", id, {
            ...rest,
            structure_name: structureName
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:surface_relative_threshold_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_surface_relative_threshold_feature
     */
    makeSurfaceRelativeThresholdFeature(
        id: string,
        featureToPlace: FeatureReference,
        options: FeatureOptions<FeatureSurfaceRelativeThresholdData> = {}
    ): FeatureDef<FeatureSurfaceRelativeThresholdData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:surface_relative_threshold_feature", id, {
            ...rest,
            feature_to_place: featureToPlace
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:tree_feature`.
     *
     * Tree features have many valid trunk and canopy combinations. This helper
     * accepts the documented tree data object and leaves nested shapes open.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_tree_feature
     */
    makeTreeFeature(
        id: string,
        options: FeatureOptions<FeatureTreeData> = {}
    ): FeatureDef<FeatureTreeData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:tree_feature", id, rest, formatVersion);
    }

    /**
     * Queues a `minecraft:vegetation_patch_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_vegetation_patch_feature
     */
    makeVegetationPatchFeature(
        id: string,
        replaceableBlocks: FeatureBlockReference | FeatureBlockReference[],
        groundBlock: FeatureBlockReference,
        vegetationFeature: FeatureReference,
        verticalRange: number,
        options: FeatureOptions<FeatureVegetationPatchData> = {}
    ): FeatureDef<FeatureVegetationPatchData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:vegetation_patch_feature", id, {
            ...rest,
            replaceable_blocks: toArray(replaceableBlocks),
            ground_block: groundBlock,
            vegetation_feature: vegetationFeature,
            vertical_range: verticalRange
        }, formatVersion);
    }

    /**
     * Queues a `minecraft:weighted_random_feature`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/features/minecraft_weighted_random_feature
     */
    makeWeightedRandomFeature(
        id: string,
        features: FeatureWeightedReference | FeatureWeightedReference[],
        options: FeatureOptions<FeatureWeightedRandomData> = {}
    ): FeatureDef<FeatureWeightedRandomData> {
        const { formatVersion = DEFAULT_FEATURE_FORMAT_VERSION, ...rest } = options;
        return this.makeFeature("minecraft:weighted_random_feature", id, {
            ...rest,
            features: toWeightedReferenceArray(features)
        }, formatVersion);
    }
}

/**
 * Fluent builder for a feature definition file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#json-format
 */
export class FeatureDef<TFeatureData extends FeatureDefinitionData = FeatureDefinitionData>
    extends GeneratorBase<FeatureDef<TFeatureData>> {
    data: FeatureDocumentData<TFeatureData>;
    protected featureType: FeatureType;

    /**
     * Creates a feature definition.
     */
    constructor(
        featureType: FeatureType,
        identifier: FeatureIdentifier,
        data: Partial<Omit<TFeatureData, "description">> = {},
        formatVersion: FeatureFormatVersion = DEFAULT_FEATURE_FORMAT_VERSION
    ) {
        super();
        this.featureType = featureType;
        this.data = {
            "format_version": formatVersion,
            [featureType]: {
                "description": {
                    "identifier": identifier
                },
                ...data
            } as TFeatureData
        };
    }

    protected featurePath(path: string): string {
        return path.length === 0 ? this.featureType : `${this.featureType}/${path}`;
    }

    protected featureData(): TFeatureData {
        return this.data[this.featureType] as TFeatureData;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(formatVersion: FeatureFormatVersion): this {
        this.data.format_version = formatVersion;
        return this;
    }

    /**
     * Replaces the feature identifier.
     */
    setIdentifier(identifier: FeatureIdentifier): this {
        this.setValueAtPath(this.featurePath("description/identifier"), identifier);
        return this;
    }

    /**
     * Merges feature fields into the active feature definition.
     */
    setFeatureData(data: Partial<Omit<TFeatureData, "description">>): this {
        Object.assign(this.featureData(), data);
        return this;
    }

    /**
     * Sets a feature field by key.
     */
    setFeatureProperty(key: string, value: unknown): this {
        (this.featureData() as Record<string, unknown>)[key] = value;
        return this;
    }

    /**
     * Sets a feature field at a slash-separated path inside the feature object.
     */
    setFeatureValueAtPath(path: string, value: unknown): this {
        this.setValueAtPath(this.featurePath(path), value);
        return this;
    }

    /**
     * Sets the child feature used by scatter and search features.
     */
    setPlacesFeature(feature: FeatureReference): this {
        return this.setFeatureProperty("places_feature", feature);
    }

    /**
     * Sets the child feature used by snap-to-surface features.
     */
    setFeatureToSnap(feature: FeatureReference): this {
        return this.setFeatureProperty("feature_to_snap", feature);
    }

    /**
     * Sets the child feature used by surface-relative threshold features.
     */
    setFeatureToPlace(feature: FeatureReference): this {
        return this.setFeatureProperty("feature_to_place", feature);
    }

    /**
     * Sets the block placed by block-producing features.
     */
    setPlacesBlock(block: FeatureBlockReference | FeatureSingleBlockPlacement): this {
        return this.setFeatureProperty("places_block", block);
    }

    /**
     * Sets scatter distribution data.
     */
    setDistribution(distribution: FeatureScatterDistributionData): this {
        return this.setFeatureProperty("distribution", distribution);
    }

    /**
     * Sets a coordinate inside an existing or new scatter distribution object.
     */
    setDistributionCoordinate(
        axis: "x" | "y" | "z",
        value: FeatureScatterDistributionData["x"]
    ): this {
        const distribution = this.getValueAtPath<FeatureScatterDistributionData>(
            this.featurePath("distribution"),
            {}
        );
        distribution[axis] = value;
        return this.setDistribution(distribution);
    }

    /**
     * Sets `iterations` inside an existing or new scatter distribution object.
     */
    setDistributionIterations(iterations: number | string): this {
        const distribution = this.getValueAtPath<FeatureScatterDistributionData>(
            this.featurePath("distribution"),
            {}
        );
        distribution.iterations = iterations;
        return this.setDistribution(distribution);
    }

    /**
     * Appends child feature references to a `features` array.
     */
    addFeatures(features: FeatureReference | FeatureReference[]): this {
        const existing = this.getValueAtPath<FeatureReference[]>(this.featurePath("features"), []);
        existing.push(...toArray(features));
        this.setValueAtPath(this.featurePath("features"), existing);
        return this;
    }

    /**
     * Appends weighted child feature references to a `features` array.
     */
    addWeightedFeatures(features: FeatureWeightedReference | FeatureWeightedReference[]): this {
        const existing = this.getValueAtPath<FeatureWeightedReference[]>(this.featurePath("features"), []);
        existing.push(...toWeightedReferenceArray(features));
        this.setValueAtPath(this.featurePath("features"), existing);
        return this;
    }

    /**
     * Appends an ore replacement rule.
     */
    addReplaceRule(rule: FeatureOreReplaceRuleData): this {
        const existing = this.getValueAtPath<FeatureOreReplaceRuleData[]>(this.featurePath("replace_rules"), []);
        existing.push(rule);
        this.setValueAtPath(this.featurePath("replace_rules"), existing);
        return this;
    }

    /**
     * Sets the block allowlist that a feature may replace.
     */
    setMayReplace(blocks: FeatureBlockReference | FeatureBlockReference[]): this {
        return this.setFeatureProperty("may_replace", toArray(blocks));
    }
}
