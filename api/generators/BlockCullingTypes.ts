/**
 * Version string used by resource-pack block culling rule JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/blockculling
 */
export type BlockCullingFormatVersion = string;

/**
 * Namespaced block culling rule identifier.
 *
 * This is referenced from a block `minecraft:geometry` component through its
 * `culling` property.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry
 */
export type BlockCullingIdentifier = string;

/**
 * Neighbor direction checked by a culling rule.
 *
 * Microsoft docs note that this direction rotates with the block's transform
 * component.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
 */
export type BlockCullingDirection =
    | "down"
    | "east"
    | "north"
    | "south"
    | "up"
    | "west";

/**
 * Geometry face culled by a rule.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule_geometry_part
 */
export type BlockCullingFace = BlockCullingDirection;

/**
 * Condition used to decide whether a neighboring block culls the geometry part.
 *
 * `default` succeeds for full opaque neighbors, `same_block` succeeds for the
 * same block identifier, `same_block_permutation` also requires matching block
 * state values, and `same_culling_layer` succeeds when both blocks share the
 * same geometry `culling_layer`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
 */
export type BlockCullingCondition =
    | "default"
    | "same_block"
    | "same_block_permutation"
    | "same_culling_layer"
    | (string & {});

/**
 * Geometry part targeted by a block culling rule.
 *
 * `bone` is required. `cube` and `face` narrow the target to a cube or face;
 * omitting them allows the rule to cull a broader geometry part.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule_geometry_part
 */
export interface BlockCullingGeometryPartData {
    /**
     * Geometry bone name.
     */
    bone: string;

    /**
     * Optional cube index within the bone.
     */
    cube?: number;

    /**
     * Optional face within the cube.
     */
    face?: BlockCullingFace;

    /**
     * Future geometry part fields.
     */
    [key: string]: unknown;
}

/**
 * One block culling rule entry.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/rule
 */
export interface BlockCullingRuleData {
    /**
     * Geometry part that is hidden when this rule succeeds.
     */
    geometry_part: BlockCullingGeometryPartData;

    /**
     * Neighbor direction to test.
     */
    direction: BlockCullingDirection;

    /**
     * Neighbor-matching condition.
     *
     * If omitted, Minecraft behaves like the `default` condition.
     */
    condition?: BlockCullingCondition;

    /**
     * Whether full opaque neighbor blocks can cull this geometry part.
     *
     * @default true
     */
    cull_against_full_and_opaque?: boolean;

    /**
     * Future rule fields.
     */
    [key: string]: unknown;
}

/**
 * Description object for `minecraft:block_culling_rules`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/description
 */
export interface BlockCullingDescriptionData {
    /**
     * Namespace and identifier for this culling rule set.
     */
    identifier: BlockCullingIdentifier;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Payload under `minecraft:block_culling_rules`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/examples/blockcullingrules/block_culling
 */
export interface BlockCullingRulesData {
    /**
     * Identifier metadata.
     */
    description: BlockCullingDescriptionData;

    /**
     * Face, cube, or bone culling rules.
     */
    rules: BlockCullingRuleData[];

    /**
     * Future block culling fields.
     */
    [key: string]: unknown;
}

/**
 * Root resource-pack block culling document.
 *
 * Block culling files are stored in `RP/block_culling` with the
 * `.culling_rules.json` suffix.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockcullingreference/blockculling
 */
export interface BlockCullingDocumentData {
    /**
     * File format version.
     */
    format_version: BlockCullingFormatVersion;

    /**
     * Block culling rule data.
     */
    "minecraft:block_culling_rules": BlockCullingRulesData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}
