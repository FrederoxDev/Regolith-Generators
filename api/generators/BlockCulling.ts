import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type BlockCullingCondition,
    type BlockCullingDirection,
    type BlockCullingDocumentData,
    type BlockCullingFace,
    type BlockCullingFormatVersion,
    type BlockCullingGeometryPartData,
    type BlockCullingIdentifier,
    type BlockCullingRuleData,
    type BlockCullingRulesData
} from "./BlockCullingTypes.ts";

export * from "./BlockCullingTypes.ts";

const DEFAULT_BLOCK_CULLING_FORMAT_VERSION: BlockCullingFormatVersion = "1.21.80";
const BLOCK_CULLING_RULES_PATH = "minecraft:block_culling_rules";
const ALL_BLOCK_CULLING_DIRECTIONS: BlockCullingDirection[] = [
    "down",
    "east",
    "north",
    "south",
    "up",
    "west"
];
const HORIZONTAL_BLOCK_CULLING_DIRECTIONS: BlockCullingDirection[] = [
    "north",
    "south",
    "east",
    "west"
];

function qualifyIdentifier(projectNamespace: string, id: string): BlockCullingIdentifier {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

function compact<T extends Record<string, unknown>>(data: T): T {
    for (const key in data) {
        if (data[key] === undefined) {
            delete data[key];
        }
    }

    return data;
}

/**
 * Factory for resource-pack block culling rule files.
 *
 * Generated files are written under `RP/block_culling` with the
 * `.culling_rules.json` suffix. Reference the generated identifier from a
 * block `minecraft:geometry` component's `culling` field.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/blockculling
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry
 */
export class BlockCullingGenerator extends GeneratorFactory<BlockCullingDef> {
    /**
     * Creates a block culling generator that writes into `RP/block_culling`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/block_culling");
    }

    /**
     * Queues a block culling rule file.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used. The generated filename is based on the identifier path.
     */
    makeBlockCulling(
        id: string,
        formatVersion: BlockCullingFormatVersion = DEFAULT_BLOCK_CULLING_FORMAT_VERSION
    ): BlockCullingDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        return this.makeBlockCullingForIdentifier(identifier, formatVersion);
    }

    /**
     * Alias for `makeBlockCulling`.
     */
    makeCullingRules(
        id: string,
        formatVersion: BlockCullingFormatVersion = DEFAULT_BLOCK_CULLING_FORMAT_VERSION
    ): BlockCullingDef {
        return this.makeBlockCulling(id, formatVersion);
    }

    /**
     * Queues a block culling rule file for an already-qualified identifier.
     */
    makeBlockCullingForIdentifier(
        identifier: BlockCullingIdentifier,
        formatVersion: BlockCullingFormatVersion = DEFAULT_BLOCK_CULLING_FORMAT_VERSION
    ): BlockCullingDef {
        const def = new BlockCullingDef(identifier, formatVersion);
        this.filesToGenerate.set(`${sanitiseIdentifierForFilename(identifier)}.culling_rules`, def);
        return def;
    }

    /**
     * Alias for `makeBlockCullingForIdentifier`.
     */
    makeCullingRulesForIdentifier(
        identifier: BlockCullingIdentifier,
        formatVersion: BlockCullingFormatVersion = DEFAULT_BLOCK_CULLING_FORMAT_VERSION
    ): BlockCullingDef {
        return this.makeBlockCullingForIdentifier(identifier, formatVersion);
    }
}

/**
 * Fluent builder for a resource-pack `minecraft:block_culling_rules` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/block_culling
 */
export class BlockCullingDef extends GeneratorBase<BlockCullingDef> {
    data: BlockCullingDocumentData;

    /**
     * Creates a block culling definition.
     */
    constructor(
        identifier: BlockCullingIdentifier,
        formatVersion: BlockCullingFormatVersion = DEFAULT_BLOCK_CULLING_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:block_culling_rules": {
                "description": {
                    "identifier": identifier
                },
                "rules": []
            }
        };
    }

    private rulesData(): BlockCullingRulesData {
        return this.data["minecraft:block_culling_rules"];
    }

    private blockCullingPath(path: string): string {
        return path.length === 0 ? BLOCK_CULLING_RULES_PATH : `${BLOCK_CULLING_RULES_PATH}/${path}`;
    }

    /**
     * Sets the root `format_version`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/blockculling
     */
    setFormatVersion(version: BlockCullingFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the block culling identifier.
     *
     * This identifier must match the `culling` value used by block geometry
     * components.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/description
     */
    setIdentifier(identifier: BlockCullingIdentifier): this {
        this.setValueAtPath(this.blockCullingPath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full `minecraft:block_culling_rules` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/block_culling
     */
    setBlockCullingRules(data: BlockCullingRulesData): this {
        this.data["minecraft:block_culling_rules"] = data;
        return this;
    }

    /**
     * Sets a field inside `minecraft:block_culling_rules`.
     */
    setBlockCullingRulesProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.blockCullingPath(key), value);
        return this;
    }

    /**
     * Sets a field inside `minecraft:block_culling_rules.description`.
     */
    setDescriptionProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.blockCullingPath(`description/${key}`), value);
        return this;
    }

    /**
     * Replaces the full rules array.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
     */
    setRules(rules: BlockCullingRuleData[]): this {
        this.rulesData().rules = rules;
        return this;
    }

    /**
     * Removes all block culling rules.
     */
    clearRules(): this {
        this.rulesData().rules = [];
        return this;
    }

    /**
     * Adds one raw culling rule.
     *
     * Use this for unusual or future rule fields that are not yet covered by a
     * convenience helper.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
     */
    addRule(rule: BlockCullingRuleData): this {
        this.rulesData().rules.push(rule);
        return this;
    }

    /**
     * Adds multiple raw culling rules.
     */
    addRules(rules: BlockCullingRuleData[]): this {
        this.rulesData().rules.push(...rules);
        return this;
    }

    /**
     * Adds a rule for a specific geometry part.
     *
     * `condition` can be `default`, `same_block`, `same_block_permutation`, or
     * `same_culling_layer`. If omitted, Minecraft behaves like `default`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
     */
    addGeometryPartRule(
        direction: BlockCullingDirection,
        geometryPart: BlockCullingGeometryPartData,
        condition: BlockCullingCondition | undefined = undefined,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addRule(compact({
            geometry_part: geometryPart,
            direction: direction,
            condition: condition,
            cull_against_full_and_opaque: cullAgainstFullAndOpaque
        }));
    }

    /**
     * Adds a rule that can cull an entire geometry bone.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule_geometry_part
     */
    addBoneRule(
        direction: BlockCullingDirection,
        bone: string,
        condition: BlockCullingCondition | undefined = undefined,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addGeometryPartRule(
            direction,
            { bone: bone },
            condition,
            cullAgainstFullAndOpaque
        );
    }

    /**
     * Adds a rule that can cull a cube within a geometry bone.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule_geometry_part
     */
    addCubeRule(
        direction: BlockCullingDirection,
        bone: string,
        cube: number,
        condition: BlockCullingCondition | undefined = undefined,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addGeometryPartRule(
            direction,
            {
                bone: bone,
                cube: cube
            },
            condition,
            cullAgainstFullAndOpaque
        );
    }

    /**
     * Adds a face culling rule.
     *
     * By default this targets cube `0` on the `block` bone and uses the same
     * face as the neighbor direction, matching Microsoft's horizontal glass
     * and leaves samples.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/block_culling
     */
    addFaceRule(
        direction: BlockCullingDirection,
        condition: BlockCullingCondition | undefined = undefined,
        bone: string = "block",
        cube: number = 0,
        face: BlockCullingFace = direction,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addGeometryPartRule(
            direction,
            {
                bone: bone,
                cube: cube,
                face: face
            },
            condition,
            cullAgainstFullAndOpaque
        );
    }

    /**
     * Adds face rules for all six directions.
     */
    addAllFaceRules(
        condition: BlockCullingCondition | undefined = undefined,
        bone: string = "block",
        cube: number = 0,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        for (const direction of ALL_BLOCK_CULLING_DIRECTIONS) {
            this.addFaceRule(direction, condition, bone, cube, direction, cullAgainstFullAndOpaque);
        }

        return this;
    }

    /**
     * Adds face rules for north, south, east, and west.
     */
    addHorizontalFaceRules(
        condition: BlockCullingCondition | undefined = undefined,
        bone: string = "block",
        cube: number = 0,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        for (const direction of HORIZONTAL_BLOCK_CULLING_DIRECTIONS) {
            this.addFaceRule(direction, condition, bone, cube, direction, cullAgainstFullAndOpaque);
        }

        return this;
    }

    /**
     * Adds all six face rules using the `same_block` condition.
     */
    addSameBlockFaceRules(
        bone: string = "block",
        cube: number = 0,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addAllFaceRules("same_block", bone, cube, cullAgainstFullAndOpaque);
    }

    /**
     * Adds all six face rules using the `same_block_permutation` condition.
     */
    addSameBlockPermutationFaceRules(
        bone: string = "block",
        cube: number = 0,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addAllFaceRules("same_block_permutation", bone, cube, cullAgainstFullAndOpaque);
    }

    /**
     * Adds all six face rules using the `same_culling_layer` condition.
     *
     * This pairs with the block geometry component's `culling_layer` property.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry
     */
    addSameCullingLayerFaceRules(
        bone: string = "block",
        cube: number = 0,
        cullAgainstFullAndOpaque: boolean | undefined = undefined
    ): this {
        return this.addAllFaceRules("same_culling_layer", bone, cube, cullAgainstFullAndOpaque);
    }
}
