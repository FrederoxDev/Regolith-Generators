import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type FeatureBiomeFilter,
    type FeatureBiomeTag,
    type FeatureIdentifier,
    type FeatureReference,
    type FeatureRuleFormatVersion,
    type FeatureRulePlacementPass,
    type FeatureRulesDocumentData,
    type FeatureScatterDistributionData
} from "./FeatureTypes.ts";

export * from "./FeatureTypes.ts";

const DEFAULT_FEATURE_RULE_FORMAT_VERSION: FeatureRuleFormatVersion = "1.13.0";
const FEATURE_RULES_PATH = "minecraft:feature_rules";

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Options accepted when creating a feature rule.
 */
export interface FeatureRuleOptions {
    /**
     * Root feature rule document format version.
     */
    formatVersion?: FeatureRuleFormatVersion;

    /**
     * Biome filter attached to `conditions.minecraft:biome_filter`.
     */
    biomeFilter?: FeatureBiomeFilter;

    /**
     * Scatter distribution attached to `minecraft:feature_rules.distribution`.
     */
    distribution?: FeatureScatterDistributionData;
}

/**
 * Factory for behavior-pack feature rule files.
 *
 * Generated files are written under `BP/feature_rules`. Feature rules attach a
 * feature to biome conditions and control the world-generation placement pass.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#feature-rules
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featurerulesreference/examples/featurerulescomponents/feature_rules_document
 */
export class FeatureRuleGenerator extends GeneratorFactory<FeatureRuleDef> {
    /**
     * Creates a feature rule generator that writes into `BP/feature_rules`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/feature_rules");
    }

    /**
     * Queues a feature rule for a feature reference.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used in the feature rule identifier.
     */
    makeFeatureRule(
        id: string,
        placesFeature: FeatureReference,
        placementPass: FeatureRulePlacementPass = "surface_pass",
        options: FeatureRuleOptions = {}
    ): FeatureRuleDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new FeatureRuleDef(
            identifier,
            placesFeature,
            placementPass,
            options.formatVersion ?? DEFAULT_FEATURE_RULE_FORMAT_VERSION
        );

        if (options.biomeFilter !== undefined) {
            def.setBiomeFilter(options.biomeFilter);
        }

        if (options.distribution !== undefined) {
            def.setDistribution(options.distribution);
        }

        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues a feature rule for an already-qualified identifier.
     */
    makeFeatureRuleForIdentifier(
        identifier: FeatureIdentifier,
        placesFeature: FeatureReference,
        placementPass: FeatureRulePlacementPass = "surface_pass",
        options: FeatureRuleOptions = {}
    ): FeatureRuleDef {
        const def = new FeatureRuleDef(
            identifier,
            placesFeature,
            placementPass,
            options.formatVersion ?? DEFAULT_FEATURE_RULE_FORMAT_VERSION
        );

        if (options.biomeFilter !== undefined) {
            def.setBiomeFilter(options.biomeFilter);
        }

        if (options.distribution !== undefined) {
            def.setDistribution(options.distribution);
        }

        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a root feature rule JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/featurerulesreference/examples/featurerulescomponents/feature_rules_document
 */
export class FeatureRuleDef extends GeneratorBase<FeatureRuleDef> {
    data: FeatureRulesDocumentData;

    /**
     * Creates a feature rule definition.
     */
    constructor(
        identifier: FeatureIdentifier,
        placesFeature: FeatureReference,
        placementPass: FeatureRulePlacementPass = "surface_pass",
        formatVersion: FeatureRuleFormatVersion = DEFAULT_FEATURE_RULE_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:feature_rules": {
                "description": {
                    "identifier": identifier,
                    "places_feature": placesFeature
                },
                "conditions": {
                    "placement_pass": placementPass
                }
            }
        };
    }

    private featureRulesPath(path: string): string {
        return path.length === 0 ? FEATURE_RULES_PATH : `${FEATURE_RULES_PATH}/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(formatVersion: FeatureRuleFormatVersion): this {
        this.data.format_version = formatVersion;
        return this;
    }

    /**
     * Replaces the feature rule identifier.
     */
    setIdentifier(identifier: FeatureIdentifier): this {
        this.setValueAtPath(this.featureRulesPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Sets the feature this rule places.
     */
    setPlacesFeature(feature: FeatureReference): this {
        this.setValueAtPath(this.featureRulesPath("description/places_feature"), feature);
        return this;
    }

    /**
     * Sets the world-generation placement pass.
     *
     * Earlier passes are guaranteed to run before later passes. Order within a
     * pass is not guaranteed.
     */
    setPlacementPass(placementPass: FeatureRulePlacementPass): this {
        this.setValueAtPath(this.featureRulesPath("conditions/placement_pass"), placementPass);
        return this;
    }

    /**
     * Sets the feature rule biome filter.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#filter-group
     */
    setBiomeFilter(filter: FeatureBiomeFilter): this {
        this.setValueAtPath(this.featureRulesPath("conditions/minecraft:biome_filter"), filter);
        return this;
    }

    /**
     * Filters placement by a single biome tag using `has_biome_tag`.
     */
    addBiomeTag(tag: FeatureBiomeTag, operator: string = "=="): this {
        const filter = this.getValueAtPath<FeatureBiomeFilter>(
            this.featureRulesPath("conditions/minecraft:biome_filter"),
            []
        );
        const filters = Array.isArray(filter) ? filter : [filter];

        filters.push({
            test: "has_biome_tag",
            operator,
            value: tag
        });

        return this.setBiomeFilter(filters);
    }

    /**
     * Requires all biome tags to match.
     */
    addAllBiomeTags(tags: FeatureBiomeTag[]): this {
        return this.setBiomeFilter({
            all_of: tags.map((tag) => ({
                test: "has_biome_tag",
                operator: "==",
                value: tag
            }))
        });
    }

    /**
     * Allows any biome tag to match.
     */
    addAnyBiomeTags(tags: FeatureBiomeTag[]): this {
        return this.setBiomeFilter({
            any_of: tags.map((tag) => ({
                test: "has_biome_tag",
                operator: "==",
                value: tag
            }))
        });
    }

    /**
     * Sets the optional initial scatter distribution for this feature rule.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/featuresreference/examples/featuresintroduction#scatter-params
     */
    setDistribution(distribution: FeatureScatterDistributionData): this {
        this.setValueAtPath(this.featureRulesPath("distribution"), distribution);
        return this;
    }

    /**
     * Sets a coordinate inside an existing or new distribution object.
     */
    setDistributionCoordinate(
        axis: "x" | "y" | "z",
        value: FeatureScatterDistributionData["x"]
    ): this {
        const distribution = this.getValueAtPath<FeatureScatterDistributionData>(
            this.featureRulesPath("distribution"),
            {}
        );
        distribution[axis] = value;
        return this.setDistribution(distribution);
    }

    /**
     * Sets the number of feature placement attempts.
     */
    setDistributionIterations(iterations: number | string): this {
        const distribution = this.getValueAtPath<FeatureScatterDistributionData>(
            this.featureRulesPath("distribution"),
            {}
        );
        distribution.iterations = iterations;
        return this.setDistribution(distribution);
    }

    /**
     * Sets an arbitrary property inside `minecraft:feature_rules`.
     */
    setFeatureRulesProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.featureRulesPath(key), value);
        return this;
    }
}
