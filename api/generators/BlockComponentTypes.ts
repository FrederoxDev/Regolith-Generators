/**
 * Three-number vector used by block component helpers.
 */
export type BlockVec3 = [number, number, number];

/**
 * Two-number tick interval range.
 *
 * The first value must be lower than or equal to the second value.
 */
export type BlockTickInterval = [number, number];

/**
 * Horizontal block directions used by connection and redstone helpers.
 */
export type BlockHorizontalDirection = "north" | "south" | "east" | "west";

/**
 * Concrete block directions used by liquid and redstone helpers.
 */
export type BlockDirection = "up" | "down" | BlockHorizontalDirection;

/**
 * Faces accepted by `minecraft:placement_filter`.
 */
export type BlockFace = "all" | "side" | BlockDirection;

/**
 * Rules accepted by `minecraft:chest_obstruction`.
 */
export type BlockChestObstructionRule = "always" | "never" | "shape";

/**
 * Back-compatible input accepted by the generator helper.
 *
 * `false` maps to `never` and `true` maps to `shape`.
 */
export type BlockChestObstructionInput = BlockChestObstructionRule | boolean;

/**
 * Connection types accepted by `minecraft:connection_rule`.
 */
export type BlockConnectionType = "all" | "only_fences" | "none";

/**
 * Block name and state descriptor accepted by `minecraft:placement_filter`.
 */
export interface BlockNameAndStatesFilter {
    /**
     * Block identifier to match.
     */
    name: string;

    /**
     * Required block states for the matched block.
     */
    states: Record<string, unknown>;
}

/**
 * Block tag query descriptor accepted by `minecraft:placement_filter`.
 */
export interface BlockTagsFilter {
    /**
     * Molang tag query used to match blocks.
     */
    tags: string;
}

/**
 * A block descriptor accepted by `minecraft:placement_filter`.
 */
export type BlockFilter = string | BlockNameAndStatesFilter | BlockTagsFilter;

/**
 * Block description trait identifiers.
 */
export type BlockTraitId =
    | "minecraft:connection"
    | "minecraft:multi_block"
    | "minecraft:placement_direction"
    | "minecraft:placement_position";

/**
 * States accepted by the `minecraft:placement_direction` trait.
 */
export type BlockPlacementDirectionState =
    | "minecraft:cardinal_direction"
    | "minecraft:facing_direction"
    | "minecraft:corner_and_cardinal_direction"
    | "minecraft:sixteen_way_rotation";

/**
 * Y-axis rotation offsets accepted by the `minecraft:placement_direction` trait.
 *
 * Current validation requires a multiple of 90 in the inclusive range 0-360.
 */
export type BlockPlacementDirectionRotationOffset = 0 | 90 | 180 | 270 | 360;

/**
 * Arguments for the `minecraft:placement_direction` trait.
 */
export interface BlockPlacementDirectionTrait {
    /**
     * Placement direction states to enable.
     *
     * Must contain at least one of `minecraft:cardinal_direction`,
     * `minecraft:facing_direction`, `minecraft:corner_and_cardinal_direction`,
     * or `minecraft:sixteen_way_rotation`.
     */
    enabled_states: BlockPlacementDirectionState[];

    /**
     * Horizontal rotation offset applied to placement direction states.
     *
     * Current validation requires a multiple of 90 in the inclusive range
     * 0-360. This field only applies to horizontal directions.
     */
    y_rotation_offset?: BlockPlacementDirectionRotationOffset;

    /**
     * Blocks that should form corners with this block.
     *
     * This is only valid when `minecraft:corner_and_cardinal_direction` is one
     * of the enabled states.
     */
    blocks_to_corner_with?: BlockFilter[];
}

/**
 * States accepted by the `minecraft:placement_position` trait.
 */
export type BlockPlacementPositionState = "minecraft:block_face" | "minecraft:vertical_half";

/**
 * Arguments for the `minecraft:placement_position` trait.
 */
export interface BlockPlacementPositionTrait {
    /**
     * Placement position states to enable.
     *
     * Must contain at least one of `minecraft:block_face` or
     * `minecraft:vertical_half`.
     */
    enabled_states: BlockPlacementPositionState[];
}

/**
 * States accepted by the `minecraft:connection` trait.
 */
export type BlockConnectionTraitState = "minecraft:cardinal_connections";

/**
 * Arguments for the `minecraft:connection` trait.
 */
export interface BlockConnectionTrait {
    /**
     * Connection states to enable.
     *
     * Current docs list only `minecraft:cardinal_connections`.
     */
    enabled_states: BlockConnectionTraitState[];
}

/**
 * Directions accepted by the `minecraft:multi_block` trait.
 */
export type BlockMultiBlockDirection = "up" | "down";

/**
 * Part counts accepted by the `minecraft:multi_block` trait.
 */
export type BlockMultiBlockPartCount = 2 | 3 | 4;

/**
 * States accepted by the `minecraft:multi_block` trait.
 */
export type BlockMultiBlockTraitState = "minecraft:multi_block_part";

/**
 * Arguments for the `minecraft:multi_block` trait.
 */
export interface BlockMultiBlockTrait {
    /**
     * Direction the block parts extend from part 0.
     *
     * @default "up"
     */
    direction: BlockMultiBlockDirection;

    /**
     * Multi-block states to enable.
     *
     * Current docs list only `minecraft:multi_block_part`.
     */
    enabled_states: BlockMultiBlockTraitState[];

    /**
     * Number of block parts.
     *
     * Current docs require a value from 2 through 4.
     *
     * @default 2
     */
    parts?: BlockMultiBlockPartCount;
}

/**
 * One placement condition for `minecraft:placement_filter`.
 */
export interface BlockPlacementFilterCondition {
    /**
     * Faces this block can be placed on or survive against.
     *
     * Microsoft docs list a maximum of 6 entries.
     */
    allowed_faces: BlockFace[];

    /**
     * Blocks this block can be placed against in the allowed face direction.
     *
     * Microsoft docs list a maximum of 64 entries.
     */
    block_filter: BlockFilter[];
}

/**
 * Render methods accepted by `minecraft:material_instances`.
 */
export enum BlockRenderMethod {
    /**
     * Fully opaque rendering for textures without alpha.
     */
    Opaque = "opaque",

    /**
     * Fully opaque or fully transparent pixels, with backface culling disabled.
     */
    AlphaTest = "alpha_test",

    /**
     * Fully opaque or fully transparent pixels, with backface culling enabled.
     */
    AlphaTestSingleSided = "alpha_test_single_sided",

    /**
     * Alpha-test rendering near the camera, turning opaque in the distance.
     */
    AlphaTestToOpaque = "alpha_test_to_opaque",

    /**
     * Single-sided alpha-test rendering near the camera, turning opaque in the distance.
     */
    AlphaTestSingleSidedToOpaque = "alpha_test_single_sided_to_opaque",

    /**
     * Translucent rendering for blocks such as stained glass.
     */
    Blend = "blend",

    /**
     * Blend rendering near the camera, turning opaque in the distance.
     */
    BlendToOpaque = "blend_to_opaque",

    /**
     * Disables backface culling.
     */
    DoubleSided = "double_sided",
}

/**
 * Biome tint methods accepted by block material instances.
 */
export type BlockTintMethod =
    | "none"
    | "default_foliage"
    | "birch_foliage"
    | "evergreen_foliage"
    | "dry_foliage"
    | "grass"
    | "water";

/**
 * One material face entry in `minecraft:material_instances`.
 */
export interface BlockMaterialInstance {
    /**
     * Texture name for this material instance.
     */
    texture: string;

    /**
     * Render method used by this material.
     *
     * Microsoft docs note that each material on the block must use the same
     * render method.
     *
     * @default "opaque"
     */
    render_method?: BlockRenderMethod | string;

    /**
     * Whether ambient occlusion is applied when lighting this material.
     *
     * A number can also be used to control the exponent applied after lighting.
     *
     * @default 1
     */
    ambient_occlusion?: boolean | number;

    /**
     * Whether this material is dimmed by the direction it faces.
     *
     * @default true
     */
    face_dimming?: boolean;

    /**
     * Whether faces using this material randomize their UVs.
     *
     * Requires format version 1.21.80 or later.
     *
     * @default false
     */
    isotropic?: boolean;

    /**
     * Tint method multiplied into the material color.
     *
     * Requires format version 1.21.80 or later.
     *
     * @default "none"
     */
    tint_method?: BlockTintMethod | string;

    /**
     * Multiplies tint by the texture alpha channel.
     *
     * Requires a tint method other than `none` and the `opaque` render method.
     *
     * @default false
     */
    alpha_masked_tint?: boolean;
}

/**
 * Material instances keyed by block face or material instance name.
 *
 * Minecraft supports `*`, `up`, `down`, `north`, `south`, `east`, and `west`,
 * plus material instance names from geometry files. The docs list a maximum
 * of 64 instances.
 */
export type BlockMaterialInstances = Record<string, BlockMaterialInstance | string>;

/**
 * Bone visibility expressions keyed by bone name.
 *
 * Current docs describe these as Molang expressions limited to
 * `query.block_state()`.
 */
export type BlockBoneVisibility = Record<string, string>;

/**
 * Geometry object accepted by visual block components.
 */
export interface BlockGeometryObject {
    /**
     * Geometry description identifier.
     *
     * This must match a loaded geometry identifier or one of the supported
     * vanilla identifiers such as `minecraft:geometry.full_block` or
     * `minecraft:geometry.cross`.
     */
    identifier: string;

    /**
     * Molang visibility expressions keyed by bone name.
     */
    bone_visibility?: BlockBoneVisibility;

    /**
     * Block culling rule file used when rendering this geometry.
     */
    culling?: string;

    /**
     * Optional culling layer identifier.
     */
    culling_layer?: string;

    /**
     * Optional voxel culling shape identifier.
     */
    culling_shape?: string;

    /**
     * Optional visual-only rotation data keyed by axis.
     */
    n_way_visual_rotation?: Record<string, unknown>;

    /**
     * Locks UV orientation for all bones or for the listed bones.
     */
    uv_lock?: boolean | string[];
}

/**
 * Geometry value accepted by `minecraft:geometry`, `minecraft:item_visual`,
 * and `minecraft:embedded_visual`.
 */
export type BlockVisualGeometry = string | BlockGeometryObject;

/**
 * Arguments for `minecraft:transformation`.
 */
export interface BlockTransformation {
    /**
     * Rotation in 90-degree increments.
     */
    rotation?: BlockVec3;

    /**
     * Point to rotate around.
     */
    rotation_pivot?: BlockVec3;

    /**
     * Block scale.
     *
     * @default [1, 1, 1]
     */
    scale?: BlockVec3;

    /**
     * Point to scale around.
     */
    scale_pivot?: BlockVec3;

    /**
     * Translation relative to the block center.
     */
    translation?: BlockVec3;
}

/**
 * A single custom collision box.
 */
export interface BlockCollisionBox {
    /**
     * Minimal position of the collision bounds.
     *
     * Values are specified as [x, y, z] and must be inside the inclusive
     * block bounds from [-8, 0, -8] to [8, 24, 8].
     *
     * @default [-8, 0, -8]
     */
    origin: BlockVec3;

    /**
     * Size of each side of the collision bounds.
     *
     * The sum of origin + size must stay inside the inclusive block bounds
     * from [-8, 0, -8] to [8, 24, 8].
     *
     * @default [16, 16, 16]
     */
    size: BlockVec3;
}

/**
 * RGB map color representation.
 */
export type BlockRgbColor = [number, number, number];

/**
 * Color accepted by `minecraft:map_color`.
 */
export type BlockMapColor = string | BlockRgbColor;

/**
 * Lava handling modes accepted by `minecraft:flammable`.
 */
export type BlockLavaFlammableMode = "always" | "never";

/**
 * Instrument sounds accepted by `minecraft:instrument_sound`.
 */
export type BlockInstrumentSound =
    | "note.harp"
    | "note.bd"
    | "note.snare"
    | "note.hat"
    | "note.bassattack"
    | "note.flute"
    | "note.bell"
    | "note.guitar"
    | "note.chime"
    | "note.xylophone"
    | "note.iron_xylophone"
    | "note.cow_bell"
    | "note.didgeridoo"
    | "note.bit"
    | "note.banjo"
    | "note.pling"
    | "note.trumpet"
    | "note.trumpet_exposed"
    | "note.trumpet_weathered"
    | "note.trumpet_oxidized"
    | "note.zombie"
    | "note.skeleton"
    | "note.creeper"
    | "note.enderdragon"
    | "note.witherskeleton"
    | "note.piglin"
    | "note.none";

/**
 * Liquid types accepted by `minecraft:liquid_detection`.
 *
 * Current docs only list `water`, but the type is intentionally open so this
 * helper can tolerate new liquid ids before Regolith Generators gets updated.
 */
export type BlockLiquidType = "water" | (string & {});

/**
 * Reactions accepted by `minecraft:liquid_detection` when liquid touches the block.
 */
export type BlockLiquidTouchReaction = "blocking" | "broken" | "popped" | "no_reaction";

/**
 * One detection rule for `minecraft:liquid_detection`.
 */
export interface BlockLiquidDetectionRule {
    /**
     * Whether this block can contain the liquid, such as waterlogging for water.
     *
     * @default false
     */
    can_contain_liquid?: boolean;

    /**
     * Liquid type this rule applies to.
     *
     * @default "water"
     */
    liquid_type?: BlockLiquidType;

    /**
     * How the block reacts when flowing liquid touches it.
     *
     * @default "blocking"
     */
    on_liquid_touches?: BlockLiquidTouchReaction;

    /**
     * Directions that contained liquid cannot flow out from.
     */
    stops_liquid_flowing_from_direction?: BlockDirection[];

    /**
     * Whether liquid visuals should clip against the encompassing collider.
     *
     * @default false
     */
    use_liquid_clipping?: boolean;
}

/**
 * Piston movement types accepted by `minecraft:movable`.
 */
export type BlockMovementType = "push_pull" | "push" | "popped" | "immovable";

/**
 * Sticky movement modes accepted by `minecraft:movable`.
 */
export type BlockStickyMode = "same" | "none";

/**
 * Precipitation behaviors accepted by `minecraft:precipitation_interactions`.
 *
 * The offline Microsoft forms include `snowlogging`; the 1.26.20 update notes
 * also mention `snow_log_no_collision`, so both are listed here.
 */
export type BlockPrecipitationBehavior =
    | "none"
    | "obstruct_rain"
    | "obstruct_rain_accumulate_snow"
    | "snowlogging"
    | "snow_log_no_collision"
    | (string & {});

/**
 * Support shapes accepted by `minecraft:support`.
 */
export type BlockSupportShape = "fence" | "stair";
