import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type SpawnAboveBlockFilterData,
    type SpawnBiomeFilter,
    type SpawnBiomeTag,
    type SpawnBlockFilter,
    type SpawnBlockedBlockFilter,
    type SpawnBrightnessFilterData,
    type SpawnConditionComponentId,
    type SpawnConditionData,
    type SpawnDelayFilterData,
    type SpawnDensityLimitData,
    type SpawnDifficulty,
    type SpawnDifficultyFilterData,
    type SpawnFilterGroup,
    type SpawnHerdData,
    type SpawnMobEventFilterData,
    type SpawnPermuteTypeData,
    type SpawnPlayerInVillageFilterData,
    type SpawnPopulationControl,
    type SpawnRangeFilterData,
    type SpawnRuleFormatVersion,
    type SpawnRulesDocumentData,
    type SpawnWeightData
} from "./SpawnRuleTypes.ts";

export * from "./SpawnRuleTypes.ts";

const DEFAULT_SPAWN_RULE_FORMAT_VERSION: SpawnRuleFormatVersion = "1.8.0";
const SPAWN_RULES_PATH = "minecraft:spawn_rules";

function hasToJson(value: unknown): value is { toJson(): Record<string, unknown> } {
    return typeof value === "object"
        && value !== null
        && "toJson" in value
        && typeof (value as { toJson: unknown }).toJson === "function";
}

function toPlainObject<T extends Record<string, unknown>>(value: T | { toJson(): Record<string, unknown> }): T {
    if (hasToJson(value)) {
        return value.toJson() as T;
    }

    return value;
}

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Factory for behavior-pack spawn rule files.
 *
 * Generated files are written under `BP/spawn_rules`. Spawn rules control when,
 * where, and how an entity naturally spawns.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/datadrivenspawning
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_rules_document
 */
export class SpawnRuleGenerator extends GeneratorFactory<SpawnRuleDef> {
    /**
     * Creates a spawn rule generator that writes into `BP/spawn_rules`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/spawn_rules");
    }

    /**
     * Queues spawn rules for an entity id.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used in the spawn rule identifier.
     */
    makeSpawnRule(
        id: string,
        populationControl: SpawnPopulationControl = "monster",
        formatVersion: SpawnRuleFormatVersion = DEFAULT_SPAWN_RULE_FORMAT_VERSION
    ): SpawnRuleDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new SpawnRuleDef(identifier, populationControl, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues spawn rules for an already-qualified entity identifier.
     */
    makeSpawnRuleForIdentifier(
        identifier: string,
        populationControl: SpawnPopulationControl = "monster",
        formatVersion: SpawnRuleFormatVersion = DEFAULT_SPAWN_RULE_FORMAT_VERSION
    ): SpawnRuleDef {
        const def = new SpawnRuleDef(identifier, populationControl, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a root spawn rules JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_rules_document
 */
export class SpawnRuleDef extends GeneratorBase<SpawnRuleDef> {
    data: SpawnRulesDocumentData;

    /**
     * Creates a spawn rules definition.
     */
    constructor(
        identifier: string,
        populationControl: SpawnPopulationControl = "monster",
        formatVersion: SpawnRuleFormatVersion = DEFAULT_SPAWN_RULE_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:spawn_rules": {
                "description": {
                    "identifier": identifier,
                    "population_control": populationControl
                },
                "conditions": []
            }
        };
    }

    private spawnRulesPath(path: string): string {
        return path.length === 0 ? SPAWN_RULES_PATH : `${SPAWN_RULES_PATH}/${path}`;
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: SpawnRuleFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the entity identifier these spawn rules apply to.
     */
    setIdentifier(identifier: string): this {
        this.setValueAtPath(this.spawnRulesPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Sets the population control pool for this entity.
     */
    setPopulationControl(populationControl: SpawnPopulationControl): this {
        this.setValueAtPath(this.spawnRulesPath("description/population_control"), populationControl);
        return this;
    }

    /**
     * Sets a property inside the `minecraft:spawn_rules` container.
     */
    setSpawnRulesProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.spawnRulesPath(key), value);
        return this;
    }

    /**
     * Replaces all condition entries.
     */
    setConditions(conditions: Array<SpawnRuleCondition | SpawnConditionData>): this {
        this.setValueAtPath(
            this.spawnRulesPath("conditions"),
            conditions.map((condition) => toPlainObject<SpawnConditionData>(condition))
        );
        return this;
    }

    /**
     * Adds a condition entry.
     */
    addCondition(condition: SpawnRuleCondition | SpawnConditionData): this {
        const conditions = this.getValueAtPath<SpawnConditionData[]>(this.spawnRulesPath("conditions"), []);
        conditions.push(toPlainObject<SpawnConditionData>(condition));
        this.setValueAtPath(this.spawnRulesPath("conditions"), conditions);
        return this;
    }

    /**
     * Creates, configures, and adds a condition entry.
     */
    addConditionWith(configure: (condition: SpawnRuleCondition) => void): this {
        const condition = new SpawnRuleCondition();
        configure(condition);
        return this.addCondition(condition);
    }
}

/**
 * Fluent builder for a single spawn condition object.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_biomeconditions
 */
export class SpawnRuleCondition extends GeneratorBase<SpawnRuleCondition> {
    data: SpawnConditionData = {};

    /**
     * Adds or replaces a spawn condition component.
     */
    addComponent(componentId: SpawnConditionComponentId, data: unknown = {}): this {
        (this.data as Record<string, unknown>)[componentId] = data;
        return this;
    }

    /**
     * Sets a condition property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }

    /**
     * Filters spawning to matching biomes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/biome_filter
     */
    addBiomeFilter(filter: SpawnBiomeFilter): this {
        return this.addComponent("minecraft:biome_filter", filter);
    }

    /**
     * Filters spawning by a single biome tag using `has_biome_tag`.
     */
    addBiomeTag(tag: SpawnBiomeTag, operator: string = "=="): this {
        return this.addBiomeFilter({
            test: "has_biome_tag",
            operator,
            value: tag
        });
    }

    /**
     * Requires all biome tags to match.
     */
    addAllBiomeTags(tags: SpawnBiomeTag[]): this {
        return this.addBiomeFilter({
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
    addAnyBiomeTags(tags: SpawnBiomeTag[]): this {
        return this.addBiomeFilter({
            any_of: tags.map((tag) => ({
                test: "has_biome_tag",
                operator: "==",
                value: tag
            }))
        });
    }

    /**
     * Allows spawning on specific blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/spawns_on_block_filter
     */
    addSpawnsOnBlockFilter(blocks: SpawnBlockFilter): this {
        return this.addComponent("minecraft:spawns_on_block_filter", blocks);
    }

    /**
     * Prevents spawning on specific blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/spawns_on_block_prevented_filter
     */
    addSpawnsOnBlockPreventedFilter(blocks: SpawnBlockedBlockFilter): this {
        return this.addComponent("minecraft:spawns_on_block_prevented_filter", blocks);
    }

    /**
     * Adds a herd configuration.
     */
    addHerd(herd: SpawnHerd | SpawnHerdData): this;
    addHerd(minSize: number, maxSize: number, options?: Omit<SpawnHerdData, "min_size" | "max_size">): this;
    addHerd(
        herdOrMinSize: SpawnHerd | SpawnHerdData | number,
        maxSize: number | undefined = undefined,
        options: Omit<SpawnHerdData, "min_size" | "max_size"> = {}
    ): this {
        const existing = this.data["minecraft:herd"];
        const herds = Array.isArray(existing)
            ? existing
            : existing === undefined ? [] : [existing];

        if (typeof herdOrMinSize === "number") {
            herds.push({
                min_size: herdOrMinSize,
                max_size: maxSize ?? herdOrMinSize,
                ...options
            });
        } else {
            herds.push(toPlainObject<SpawnHerdData>(herdOrMinSize));
        }

        this.data["minecraft:herd"] = herds.length === 1 ? herds[0] : herds;
        return this;
    }

    /**
     * Adds a weighted entity type permutation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/permute_type
     */
    addPermuteType(permuteType: SpawnPermuteType | SpawnPermuteTypeData): this;
    addPermuteType(weight: number, entityType?: string, minGuaranteed?: number): this;
    addPermuteType(
        permuteTypeOrWeight: SpawnPermuteType | SpawnPermuteTypeData | number,
        entityType: string | undefined = undefined,
        minGuaranteed: number | undefined = undefined
    ): this {
        const existing = this.data["minecraft:permute_type"];
        const permuteTypes = Array.isArray(existing)
            ? existing
            : existing === undefined ? [] : [existing];

        if (typeof permuteTypeOrWeight === "number") {
            permuteTypes.push({
                weight: permuteTypeOrWeight,
                ...(entityType === undefined ? {} : { entity_type: entityType }),
                ...(minGuaranteed === undefined ? {} : { min_guaranteed: minGuaranteed })
            });
        } else {
            permuteTypes.push(toPlainObject<SpawnPermuteTypeData>(permuteTypeOrWeight));
        }

        this.data["minecraft:permute_type"] = permuteTypes.length === 1 ? permuteTypes[0] : permuteTypes;
        return this;
    }

    /**
     * Restricts spawning by light level.
     */
    addBrightnessFilter(
        min: number,
        max: number,
        adjustForWeather: boolean | undefined = undefined
    ): this {
        return this.addComponent("minecraft:brightness_filter", {
            min,
            max,
            ...(adjustForWeather === undefined ? {} : { adjust_for_weather: adjustForWeather })
        } satisfies SpawnBrightnessFilterData);
    }

    /**
     * Adds a delay before spawning after conditions pass.
     */
    addDelayFilter(
        min: number,
        max: number,
        spawnChance: number | undefined = undefined,
        identifier: string | undefined = undefined
    ): this {
        return this.addComponent("minecraft:delay_filter", {
            min,
            max,
            ...(spawnChance === undefined ? {} : { spawn_chance: spawnChance }),
            ...(identifier === undefined ? {} : { identifier })
        } satisfies SpawnDelayFilterData);
    }

    /**
     * Limits entity density on the surface and underground.
     */
    addDensityLimit(surface: number = -1, underground: number = -1): this {
        return this.addComponent("minecraft:density_limit", {
            surface,
            underground
        } satisfies SpawnDensityLimitData);
    }

    /**
     * Restricts spawning by world difficulty.
     */
    addDifficultyFilter(min: SpawnDifficulty, max: SpawnDifficulty): this {
        return this.addComponent("minecraft:difficulty_filter", {
            min,
            max
        } satisfies SpawnDifficultyFilterData);
    }

    /**
     * Restricts spawning by distance from the nearest player.
     */
    addDistanceFilter(min: number, max: number): this {
        return this.addComponent("minecraft:distance_filter", {
            min,
            max
        } satisfies SpawnRangeFilterData);
    }

    /**
     * Restricts spawning by Y-coordinate height.
     */
    addHeightFilter(min: number, max: number): this {
        return this.addComponent("minecraft:height_filter", {
            min,
            max
        } satisfies SpawnRangeFilterData);
    }

    /**
     * Requires a mob event to be active.
     */
    addMobEventFilter(event: string): this {
        return this.addComponent("minecraft:mob_event_filter", {
            event
        } satisfies SpawnMobEventFilterData);
    }

    /**
     * Requires a player to be within village boundaries.
     */
    addPlayerInVillageFilter(distance: number, villageBorderTolerance: number | undefined = undefined): this {
        return this.addComponent("minecraft:player_in_village_filter", {
            distance,
            ...(villageBorderTolerance === undefined ? {} : { village_border_tolerance: villageBorderTolerance })
        } satisfies SpawnPlayerInVillageFilterData);
    }

    /**
     * Triggers an entity event when this condition spawns the entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/spawn_event
     */
    addSpawnEvent(event: string): this {
        return this.addComponent("minecraft:spawn_event", {
            event
        } satisfies SpawnMobEventFilterData);
    }

    /**
     * Filters spawning based on blocks above the spawn point.
     *
     * @deprecated Microsoft notes this no longer works after format versions of
     * at least 1.18.0.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_spawnaboveblockfilter
     */
    addSpawnsAboveBlockFilter(blocks: SpawnBlockFilter, distance: number = 1): this {
        return this.addComponent("minecraft:spawns_above_block_filter", {
            blocks,
            distance
        } satisfies SpawnAboveBlockFilterData);
    }

    /**
     * Sets the relative spawn weight for this condition.
     */
    addWeight(defaultWeight: number, rarity: number | undefined = undefined): this {
        return this.addComponent("minecraft:weight", {
            default: defaultWeight,
            ...(rarity === undefined ? {} : { rarity })
        } satisfies SpawnWeightData);
    }

    /**
     * Restricts spawning by world age in ticks.
     */
    addWorldAgeFilter(min: number, max: number): this {
        return this.addComponent("minecraft:world_age_filter", {
            min,
            max
        } satisfies SpawnRangeFilterData);
    }

    /**
     * Allows spawning on the world surface.
     */
    addSpawnsOnSurface(): this {
        return this.addComponent("minecraft:spawns_on_surface");
    }

    /**
     * Allows spawning underground.
     */
    addSpawnsUnderground(): this {
        return this.addComponent("minecraft:spawns_underground");
    }

    /**
     * Allows spawning underwater.
     */
    addSpawnsUnderwater(): this {
        return this.addComponent("minecraft:spawns_underwater");
    }

    /**
     * Allows spawning in lava.
     */
    addSpawnsLava(): this {
        return this.addComponent("minecraft:spawns_lava");
    }

    /**
     * Prevents spawning inside bubble columns.
     */
    addDisallowSpawnsInBubble(): this {
        return this.addComponent("minecraft:disallow_spawns_in_bubble");
    }

    /**
     * Marks this spawn condition as experimental.
     */
    addIsExperimental(): this {
        return this.addComponent("minecraft:is_experimental");
    }

    /**
     * Makes spawned entities persistent.
     */
    addIsPersistent(): this {
        return this.addComponent("minecraft:is_persistent");
    }
}

/**
 * Fluent builder for `minecraft:herd`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/spawnrulesreference/examples/spawnrulescomponents/spawn_herd
 */
export class SpawnHerd extends GeneratorBase<SpawnHerd> {
    data: SpawnHerdData;

    /**
     * Creates a herd configuration.
     */
    constructor(minSize: number = 1, maxSize: number = 1) {
        super();

        this.data = {
            min_size: minSize,
            max_size: maxSize
        };
    }

    /**
     * Sets the herd size range.
     */
    setSize(minSize: number, maxSize: number): this {
        this.data.min_size = minSize;
        this.data.max_size = maxSize;
        return this;
    }

    /**
     * Sets the event run after `event_skip_count` members have spawned.
     */
    setEvent(event: string, eventSkipCount: number | undefined = undefined): this {
        this.data.event = event;

        if (eventSkipCount !== undefined) {
            this.data.event_skip_count = eventSkipCount;
        }

        return this;
    }

    /**
     * Sets the event run for the first `initial_event_count` spawned members.
     */
    setInitialEvent(initialEvent: string, initialEventCount: number | undefined = undefined): this {
        this.data.initial_event = initialEvent;

        if (initialEventCount !== undefined) {
            this.data.initial_event_count = initialEventCount;
        }

        return this;
    }

    /**
     * Sets a herd property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }
}

/**
 * Fluent builder for `minecraft:permute_type`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/definitions/nestedtables/permute_type
 */
export class SpawnPermuteType extends GeneratorBase<SpawnPermuteType> {
    data: SpawnPermuteTypeData;

    /**
     * Creates a weighted spawn permutation.
     */
    constructor(weight: number, entityType: string | undefined = undefined) {
        super();

        this.data = {
            weight,
            ...(entityType === undefined ? {} : { entity_type: entityType })
        };
    }

    /**
     * Sets the relative selection weight.
     */
    setWeight(weight: number): this {
        this.data.weight = weight;
        return this;
    }

    /**
     * Sets the entity type spawned by this permutation.
     */
    setEntityType(entityType: string): this {
        this.data.entity_type = entityType;
        return this;
    }

    /**
     * Sets the current guaranteed count field.
     */
    setMinGuaranteed(minGuaranteed: number): this {
        this.data.min_guaranteed = minGuaranteed;
        return this;
    }

    /**
     * Sets the legacy guaranteed count field.
     */
    setGuaranteedCount(guaranteedCount: number): this {
        this.data.guaranteed_count = guaranteedCount;
        return this;
    }

    /**
     * Sets a permutation property not covered by a dedicated helper.
     */
    setProperty(key: string, value: unknown): this {
        this.data[key] = value;
        return this;
    }
}
