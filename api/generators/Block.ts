import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import {
    type BlockBoneVisibility,
    type BlockChestObstructionInput,
    type BlockCollisionBox,
    type BlockConnectionTrait,
    type BlockConnectionType,
    type BlockDirection,
    type BlockFilter,
    type BlockHorizontalDirection,
    type BlockInstrumentSound,
    type BlockLavaFlammableMode,
    type BlockLiquidDetectionRule,
    type BlockMapColor,
    type BlockMaterialInstances,
    type BlockMultiBlockDirection,
    type BlockMultiBlockPartCount,
    type BlockMultiBlockTrait,
    type BlockMovementType,
    type BlockPlacementDirectionRotationOffset,
    type BlockPlacementDirectionState,
    type BlockPlacementFilterCondition,
    type BlockPlacementPositionState,
    type BlockPrecipitationBehavior,
    BlockRenderMethod,
    type BlockStickyMode,
    type BlockSupportShape,
    type BlockTickInterval,
    type BlockTintMethod,
    type BlockTraitId,
    type BlockTransformation,
    type BlockVec3,
    type BlockVisualGeometry,
} from "./BlockComponentTypes.ts";
import { ItemCategory } from "./Item.ts";
import { VanillaItemGroup } from "./ItemCatalog.ts";
import { LangGenerator, ToTitleCase } from "./Lang.ts";

export { BlockRenderMethod } from "./BlockComponentTypes.ts";
export type {
    BlockBoneVisibility,
    BlockChestObstructionInput,
    BlockChestObstructionRule,
    BlockCollisionBox,
    BlockConnectionTrait,
    BlockConnectionTraitState,
    BlockConnectionType,
    BlockDirection,
    BlockFace,
    BlockFilter,
    BlockGeometryObject,
    BlockHorizontalDirection,
    BlockInstrumentSound,
    BlockLavaFlammableMode,
    BlockLiquidDetectionRule,
    BlockLiquidTouchReaction,
    BlockLiquidType,
    BlockMapColor,
    BlockMaterialInstance,
    BlockMaterialInstances,
    BlockMultiBlockDirection,
    BlockMultiBlockPartCount,
    BlockMultiBlockTrait,
    BlockMultiBlockTraitState,
    BlockMovementType,
    BlockNameAndStatesFilter,
    BlockPlacementDirectionRotationOffset,
    BlockPlacementDirectionState,
    BlockPlacementDirectionTrait,
    BlockPlacementFilterCondition,
    BlockPlacementPositionState,
    BlockPlacementPositionTrait,
    BlockPrecipitationBehavior,
    BlockRgbColor,
    BlockStickyMode,
    BlockSupportShape,
    BlockTagsFilter,
    BlockTickInterval,
    BlockTintMethod,
    BlockTraitId,
    BlockTransformation,
    BlockVec3,
    BlockVisualGeometry,
} from "./BlockComponentTypes.ts";

export class BlockGenerator extends GeneratorFactory<BlockDef> {
    langFile: LangGenerator | undefined;

    constructor(projectNamespace: string, langFile: LangGenerator | undefined = undefined) {
        super(projectNamespace, "BP/blocks");
        this.langFile = langFile;
    }

    makeBlock(id: string): BlockDef {
        const def = new BlockDef(this.projectNamespace, id, this.langFile);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export type ItemGroupID = `itemGroup.name.${string}`;

export class BlockDef extends GeneratorBase<BlockDef> {
    data: Record<string, unknown>;
    langFile: LangGenerator | undefined;

    constructor(projectNamespace: string, id: string, langFile: LangGenerator | undefined = undefined) {
        super();

        this.langFile = langFile;

        this.data = {
            format_version: "1.26.20",
            "minecraft:block": {
                description: {
                    identifier: `${projectNamespace}:${id}`,
                    menu_category: {
                        category: "items",
                    },
                },
                components: {},
            },
        };
    }

    private addUniqueValuesAtPath<T extends string>(path: string, values: T[]): void {
        const existingValues = this.getValueAtPath<T[]>(path, []);
        for (const value of values) {
            if (!existingValues.includes(value)) {
                existingValues.push(value);
            }
        }
        this.setValueAtPath(path, existingValues);
    }

    private arrayFrom<T>(value: T | T[]): T[] {
        return Array.isArray(value) ? value : [value];
    }

    addState(state: string, value: string[] | number[] | boolean[]): BlockDef {
        this.setValueAtPath(`minecraft:block/description/states/${state}`, value);
        return this;
    }

    /**
     * Adds cardinal-direction placement state and matching rotation permutations.
     *
     * This is a convenience helper for common horizontally rotatable blocks. It
     * enables the `minecraft:cardinal_direction` placement trait, then adds
     * permutations for east, south, and west. North is treated as the base
     * orientation and does not receive an extra permutation.
     *
     * Use `forEachDir` to add extra components to each generated permutation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addBasicRotation(forEachDir?: (dir: string, permComponents: BlockComponents) => void): this {
        this.addCardinalDirectionTrait();

        const permutations = this.getValueAtPath<unknown[]>("minecraft:block/permutations", []);
        // const values: [string, number][] = [["east", 270], ["north", 180], ["west", 90]];
        const values: [string, number][] = [
            ["east", 270],
            ["south", 180],
            ["west", 90],
        ];

        for (const [state, rotation] of values) {
            const components = new BlockComponents();

            components.addTransformComponent({
                rotation: [0, rotation, 0],
            });

            if (forEachDir !== undefined) {
                forEachDir(state, components);
            }

            permutations.push({
                condition: `query.block_state('minecraft:cardinal_direction') == '${state}'`,
                components: components.toJson(),
            });
        }

        this.setValueAtPath("minecraft:block/permutations", permutations);
        return this;
    }

    /**
     * Raw escape hatch for adding any block description trait shape.
     *
     * Prefer the dedicated trait helpers when one exists; they preserve the
     * current `enabled_states` shape and carry trait-specific docs. Use this
     * for custom composition, experimental trait data, or uncommon
     * combinations.
     *
     * @example
     * ```ts
     * block.addTrait("minecraft:placement_position", {
     *     enabled_states: ["minecraft:vertical_half"],
     * });
     * ```
     */
    addTrait(id: BlockTraitId | string, data: object): this {
        this.setValueAtPath(`minecraft:block/description/traits/${id}`, data);
        return this;
    }

    /**
     * Adds the `minecraft:placement_direction` trait.
     *
     * Placement direction records information about the direction the player
     * was facing when the block was placed. Enabled states can then be queried
     * in permutation conditions with `query.block_state(...)`.
     *
     * Supported states:
     * - `minecraft:cardinal_direction`: `north`, `south`, `east`, `west`.
     * - `minecraft:facing_direction`: `down`, `up`, `north`, `south`, `east`, `west`.
     * - `minecraft:corner_and_cardinal_direction`: also exposes `minecraft:corner`.
     * - `minecraft:sixteen_way_rotation`: listed in the current Microsoft form
     *   schema as a placement direction state; the local rendered docs do not
     *   yet include a detailed prose page for it.
     *
     * `yRotationOffset` rotates horizontal placement values counter-clockwise
     * from the player's facing direction. Current validation requires a
     * multiple of 90 in the inclusive range 0-360.
     *
     * `blocksToCornerWith` is only valid when
     * `minecraft:corner_and_cardinal_direction` is enabled.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addPlacementDirectionTrait(
        enabledStates: BlockPlacementDirectionState | BlockPlacementDirectionState[],
        yRotationOffset: BlockPlacementDirectionRotationOffset | undefined = undefined,
        blocksToCornerWith: BlockFilter | BlockFilter[] | undefined = undefined,
    ): this {
        const enabledStatesPath = "minecraft:block/description/traits/minecraft:placement_direction/enabled_states";
        this.addUniqueValuesAtPath(enabledStatesPath, this.arrayFrom(enabledStates));

        if (yRotationOffset !== undefined) {
            this.setValueAtPath("minecraft:block/description/traits/minecraft:placement_direction/y_rotation_offset", yRotationOffset);
        }

        if (blocksToCornerWith !== undefined) {
            this.setValueAtPath(
                "minecraft:block/description/traits/minecraft:placement_direction/blocks_to_corner_with",
                this.arrayFrom(blocksToCornerWith),
            );
        }

        return this;
    }

    /**
     * Adds `minecraft:cardinal_direction` through the placement-direction trait.
     *
     * This state stores one of `north`, `south`, `east`, or `west`, based on
     * the player's horizontal facing direction when the block was placed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addCardinalDirectionTrait(yRotationOffset: BlockPlacementDirectionRotationOffset | undefined = undefined): this {
        return this.addPlacementDirectionTrait("minecraft:cardinal_direction", yRotationOffset);
    }

    /**
     * Adds `minecraft:facing_direction` through the placement-direction trait.
     *
     * This state stores one of `down`, `up`, `north`, `south`, `east`, or
     * `west`, based on the player's overall placement direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addFacingDirectionTrait(yRotationOffset: BlockPlacementDirectionRotationOffset | undefined = undefined): this {
        return this.addPlacementDirectionTrait("minecraft:facing_direction", yRotationOffset);
    }

    /**
     * Adds `minecraft:corner_and_cardinal_direction`.
     *
     * This placement-direction state exposes both `minecraft:cardinal_direction`
     * and `minecraft:corner`. The corner state can be `inner_left`,
     * `inner_right`, `outer_left`, `outer_right`, or `none`.
     *
     * `blocksToCornerWith` defines which adjacent blocks can form corner
     * shapes. Current validation requires this field to be used only when
     * `minecraft:corner_and_cardinal_direction` is enabled.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addCornerAndCardinalDirectionTrait(
        blocksToCornerWith: BlockFilter | BlockFilter[] | undefined = undefined,
        yRotationOffset: BlockPlacementDirectionRotationOffset | undefined = undefined,
    ): this {
        return this.addPlacementDirectionTrait(
            "minecraft:corner_and_cardinal_direction",
            yRotationOffset,
            blocksToCornerWith,
        );
    }

    /**
     * Adds `minecraft:sixteen_way_rotation`.
     *
     * The current Microsoft form schema lists this as a valid
     * `minecraft:placement_direction` enabled state. It is intended for
     * placement-direction data with sixteen horizontal rotations. The local
     * rendered Microsoft docs do not yet include the same level of prose detail
     * as `cardinal_direction`, `facing_direction`, or
     * `corner_and_cardinal_direction`, so this helper writes the schema-backed
     * trait shape without inventing extra fields.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_direction
     */
    addSixteenWayRotationTrait(yRotationOffset: BlockPlacementDirectionRotationOffset | undefined = undefined): this {
        return this.addPlacementDirectionTrait("minecraft:sixteen_way_rotation", yRotationOffset);
    }

    /**
     * Adds the `minecraft:placement_position` trait.
     *
     * Placement position records information about where the player placed the
     * block in relation to another block. Enabled states can be queried in
     * permutation conditions with `query.block_state(...)`.
     *
     * Supported states:
     * - `minecraft:block_face`: `down`, `up`, `north`, `south`, `east`, `west`.
     * - `minecraft:vertical_half`: `bottom`, `top`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_position
     */
    addPlacementPositionTrait(
        enabledStates: BlockPlacementPositionState | BlockPlacementPositionState[],
    ): this {
        const enabledStatesPath = "minecraft:block/description/traits/minecraft:placement_position/enabled_states";
        this.addUniqueValuesAtPath(enabledStatesPath, this.arrayFrom(enabledStates));
        return this;
    }

    /**
     * Adds `minecraft:block_face` through the placement-position trait.
     *
     * This state stores the face of the neighboring block that this block was
     * placed against: `down`, `up`, `north`, `south`, `east`, or `west`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_position
     */
    addBlockFaceTrait(): this {
        return this.addPlacementPositionTrait("minecraft:block_face");
    }

    /**
     * Adds `minecraft:vertical_half` through the placement-position trait.
     *
     * This state stores whether the block was placed in the `bottom` or `top`
     * half of the target block space.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/placement_position
     */
    addVerticalHalfTrait(): this {
        return this.addPlacementPositionTrait("minecraft:vertical_half");
    }

    /**
     * Adds the `minecraft:connection` trait.
     *
     * Connection states update when this block or neighboring blocks change.
     * Current docs list only `minecraft:cardinal_connections`, which exposes
     * boolean states for north, east, south, and west connections.
     *
     * Requires format version 1.21.130 or later and, according to current
     * Microsoft docs, Upcoming Creator Features.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/traits/connection
     */
    addConnectionTrait(): this {
        const trait: BlockConnectionTrait = {
            enabled_states: ["minecraft:cardinal_connections"],
        };

        return this.addTrait("minecraft:connection", trait);
    }

    /**
     * Adds the `minecraft:multi_block` trait.
     *
     * Multi-block enables the `minecraft:multi_block_part` state and lets one
     * block definition span multiple block positions. Part `0` is the starting
     * block, and subsequent parts extend in `direction`. Current docs require
     * `parts` from 2 through 4.
     *
     * The local docs currently cover this trait through forms, tutorials, and
     * update notes rather than a dedicated trait reference page. Requires
     * format version 1.26.10 or later and Upcoming Creator Features in the
     * documented update notes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/multi-blocks
     */
    addMultiBlockTrait(
        parts: BlockMultiBlockPartCount = 2,
        direction: BlockMultiBlockDirection = "up",
    ): this {
        const trait: BlockMultiBlockTrait = {
            direction: direction,
            enabled_states: ["minecraft:multi_block_part"],
            parts: parts,
        };

        return this.addTrait("minecraft:multi_block", trait);
    }

    addPermutation(condition: string, components: BlockComponents): this {
        const permutations = this.getValueAtPath<unknown[]>("minecraft:block/permutations", []);

        permutations.push({
            condition: condition,
            components: components.toJson(),
        });

        this.setValueAtPath("minecraft:block/permutations", permutations);
        return this;
    }

    /**
     * Adds an entire set of components at once
     */
    addComponents(components: BlockComponents): this {
        const newComponents = components.toJson();
        this.deepMerge("minecraft:block/components", newComponents);
        return this;
    }

    setCategory(category: ItemCategory, itemGroup: VanillaItemGroup | undefined = undefined): this {
        this.setValueAtPath("minecraft:block/description/menu_category/category", category);

        if (itemGroup !== undefined) {
            this.setValueAtPath("minecraft:block/description/menu_category/group", itemGroup);
        }

        return this;
    }

    addDefaultLocalization(): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to BlockGenerator, cannot add localization.");
        }

        const id = this.getValueAtPath<string>("minecraft:block/description/identifier", "");
        if (id === "") {
            throw new Error("BlockDef has no identifier, cannot add localization.");
        }

        const name = id.split(":")[1];
        const titleCaseName = ToTitleCase(name);

        this.langFile.addLine(`tile.${id}.name`, titleCaseName);
        return this;
    }

    addLocalization(value: string): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to BlockGenerator, cannot add localization.");
        }
        const id = this.getValueAtPath<string>("minecraft:block/description/identifier", "");
        if (id === "") {
            throw new Error("BlockDef has no identifier, cannot add localization.");
        }

        this.langFile.addLine(`tile.${id}.name`, value);
        return this;
    }
}

export class BlockComponents extends GeneratorBase<BlockComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    /**
     * Raw escape hatch for adding any block component shape.
     *
     * Prefer the dedicated `addXyz(...)` helpers when one exists; they encode
     * the common authoring shape and carry component-specific docs. Use this
     * method for custom JSON, experimental components, or one-off component
     * composition.
     *
     * The component id is written relative to the block's `components` object.
     *
     * @example
     * ```ts
     * new BlockComponents().addComponent("minecraft:friction", 0.4);
     * ```
     */
    addComponent(id: string, data: Record<string, unknown> | string | number | boolean): this {
        this.setValueAtPath(id, data);
        return this;
    }

    /**
     * Adds a block tag to the `minecraft:tags` component's `tags` array.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_tag
     */
    addTag(id: string): this {
        const tags = this.getValueAtPath<string[]>("minecraft:tags", []);
        if (!tags.includes(id)) tags.push(id);
        this.setValueAtPath("minecraft:tags", tags);
        return this;
    }

    /**
     * Adds `minecraft:block_entity`, enabling per-instance metadata for this block.
     *
     * Set `dynamicProperties` to true when the block entity needs dynamic
     * property storage from script. If omitted, Minecraft uses the component's
     * default dynamic-properties behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_block_entity
     */
    addBlockEntity(dynamicProperties = false): this {
        const data: Record<string, unknown> = {};
        if (dynamicProperties) {
            data.dynamic_properties = true;
        }

        return this.addComponent("minecraft:block_entity", data);
    }

    /**
     * Adds `minecraft:chest_obstruction`.
     *
     * This controls whether the block prevents a chest directly below it from
     * opening. `shape` uses the block AABB, `always` always obstructs, and
     * `never` never obstructs.
     *
     * Requires format version 1.26.20 or later, or Upcoming Creator Features
     * in earlier format versions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_chest_obstruction
     */
    addChestObstruction(obstructionRule: BlockChestObstructionInput = "shape"): this {
        const rule = typeof obstructionRule === "boolean"
            ? obstructionRule ? "shape" : "never"
            : obstructionRule;

        return this.addComponent("minecraft:chest_obstruction", {
            obstruction_rule: rule,
        });
    }

    /**
     * Adds `minecraft:connection_rule`.
     *
     * This defines whether blocks such as fences, walls, bars, and glass panes
     * can connect to this block. Connections can be enabled for each cardinal
     * direction. If `acceptsConnectionsFrom` is `none`, enabled directions are
     * ignored by Minecraft.
     *
     * Requires format version 1.26.0 or later, or Upcoming Creator Features in
     * earlier format versions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_connection_rule
     */
    addConnectionRule(
        acceptsConnectionsFrom: BlockConnectionType = "all",
        enabledDirections: BlockHorizontalDirection[] = ["north", "south", "east", "west"],
    ): this {
        return this.addComponent("minecraft:connection_rule", {
            accepts_connections_from: acceptsConnectionsFrom,
            enabled_directions: enabledDirections,
        });
    }

    /**
     * Adds `minecraft:destruction_particles`.
     *
     * This controls the particles spawned when the block is destroyed. The
     * texture is a terrain texture key. Particle count defaults to Minecraft's
     * documented value of 100 and is capped at 255 by the engine.
     *
     * Requires format version 1.21.80 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_destruction_particles
     */
    addDestructionParticles(
        texture: string,
        particleCount: number | undefined = undefined,
        tintMethod: BlockTintMethod | string | undefined = undefined,
    ): this {
        const data: Record<string, unknown> = {
            texture: texture,
        };

        if (particleCount !== undefined) {
            data.particle_count = particleCount;
        }

        if (tintMethod !== undefined) {
            data.tint_method = tintMethod;
        }

        return this.addComponent("minecraft:destruction_particles", data);
    }

    /**
     * Adds `minecraft:display_name`.
     *
     * The value can be a localization key or raw fallback text. If the key
     * cannot be resolved, Minecraft displays the raw string. If omitted,
     * Minecraft uses the block name.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_display_name
     */
    addDisplayName(value: string): this {
        return this.addComponent("minecraft:display_name", value);
    }

    /**
     * Adds `minecraft:embedded_visual`.
     *
     * This defines the geometry and material instances used when the block is
     * rendered inside another block, such as a flower inside a flower pot.
     *
     * Requires format version 1.21.120 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_embedded_visual
     */
    addEmbeddedVisual(geometry: BlockVisualGeometry, materialInstances: BlockMaterialInstances): this {
        return this.addComponent("minecraft:embedded_visual", {
            geometry: geometry,
            material_instances: materialInstances,
        });
    }

    /**
     * Adds `minecraft:entity_fall_on`.
     *
     * This sets the minimum distance an entity must fall onto the block before
     * script custom components receive `onEntityFallOn`. Without this
     * component, custom components use Minecraft's default distance of 1 block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_entity_fall_on
     */
    addEntityFallOn(minimumFallDistance = 1): this {
        return this.addComponent("minecraft:entity_fall_on", {
            minimum_fall_distance: minimumFallDistance,
        });
    }

    /**
     * Adds `minecraft:flammable`.
     *
     * With no arguments, or with `true`, Minecraft uses default flammability
     * values. `false` prevents the block from catching fire naturally from
     * neighboring fire, though it can still be directly ignited. Passing
     * numeric modifiers writes the detailed object shape.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_flammable
     */
    addFlammable(): this;
    addFlammable(enabled: boolean): this;
    addFlammable(
        catchChanceModifier: number,
        destroyChanceModifier?: number,
        lavaFlammable?: BlockLavaFlammableMode,
    ): this;
    addFlammable(
        catchChanceModifierOrEnabled: number | boolean | undefined = undefined,
        destroyChanceModifier: number | undefined = undefined,
        lavaFlammable: BlockLavaFlammableMode | undefined = undefined,
    ): this {
        if (catchChanceModifierOrEnabled === undefined) {
            return this.addComponent("minecraft:flammable", true);
        }

        if (typeof catchChanceModifierOrEnabled === "boolean") {
            return this.addComponent("minecraft:flammable", catchChanceModifierOrEnabled);
        }

        const data: Record<string, unknown> = {
            catch_chance_modifier: catchChanceModifierOrEnabled,
        };

        if (destroyChanceModifier !== undefined) {
            data.destroy_chance_modifier = destroyChanceModifier;
        }

        if (lavaFlammable !== undefined) {
            data.lava_flammable = lavaFlammable;
        }

        return this.addComponent("minecraft:flammable", data);
    }

    /**
     * Adds `minecraft:flower_pottable`.
     *
     * This allows the held item form of the block to be placed into an empty
     * flower pot.
     *
     * Requires format version 1.21.120 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_flower_pottable
     */
    addFlowerPottable(): this {
        return this.addComponent("minecraft:flower_pottable", {});
    }

    /**
     * Adds `minecraft:friction`.
     *
     * Friction affects entity movement on the block. Current docs describe the
     * range as 0.0 through 0.9, where higher values mean less sliding. Most
     * blocks use 0.4 and ice uses 0.02.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_friction
     */
    addFriction(value: number): this {
        return this.addComponent("minecraft:friction", value);
    }

    /**
     * Adds `minecraft:instrument_sound`.
     *
     * This defines which note-block instrument sound plays when the note block
     * is above or below this block. At least one face must be defined. An
     * undefined `up` face defaults to `note.harp`; an undefined `down` face
     * defaults to `note.none`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_instrument_sound
     */
    addInstrumentSound(up?: BlockInstrumentSound, down?: BlockInstrumentSound): this {
        const data: Record<string, unknown> = {};

        if (up !== undefined) {
            data.up = up;
        }

        if (down !== undefined) {
            data.down = down;
        }

        if (Object.keys(data).length === 0) {
            data.up = "note.harp";
        }

        return this.addComponent("minecraft:instrument_sound", data);
    }

    /**
     * Adds `minecraft:item_visual`.
     *
     * This defines the geometry and material instances used to render the item
     * form of the block. It can be used instead of separate item geometry and
     * material-instance components.
     *
     * Requires format version 1.21.60 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_item_visual
     */
    addItemVisual(geometry: BlockVisualGeometry, materialInstances: BlockMaterialInstances): this {
        return this.addComponent("minecraft:item_visual", {
            geometry: geometry,
            material_instances: materialInstances,
        });
    }

    /**
     * Adds `minecraft:leashable`.
     *
     * This allows a lead to be tied to the block. The offset controls the
     * leash-knot attachment point and defaults to Minecraft's documented
     * `[0, 0.25, 0]` value.
     *
     * Requires format version 1.26.0 or later.
     */
    addLeashable(offset: BlockVec3 = [0, 0.25, 0]): this {
        return this.addComponent("minecraft:leashable", {
            offset: offset,
        });
    }

    /**
     * Adds `minecraft:light_dampening`.
     *
     * This controls how much light is dampened as it passes through the block.
     * Current docs describe the range as 0 through 15, where 15 is fully
     * opaque like stone and 0 is transparent like glass.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_light_dampening
     */
    addLightDampening(value: number): this {
        return this.addComponent("minecraft:light_dampening", value);
    }

    /**
     * Adds `minecraft:light_emission`.
     *
     * This controls how much light the block emits. Current docs describe the
     * range as 0 through 15. Reference values include torch 14, glowstone 15,
     * redstone torch 7, and soul torch 10.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_light_emission
     */
    addLightEmission(value: number): this {
        return this.addComponent("minecraft:light_emission", value);
    }

    /**
     * Adds `minecraft:liquid_detection`.
     *
     * Rules define how the block reacts to liquid. Only one rule is honored
     * per liquid type; if multiple rules use the same liquid type, Minecraft
     * uses the first and ignores the rest. Current docs list `water` as the
     * supported liquid type.
     *
     * Requires format version 1.21.60 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_liquid_detection
     */
    addLiquidDetection(rules: BlockLiquidDetectionRule | BlockLiquidDetectionRule[]): this {
        return this.addComponent("minecraft:liquid_detection", {
            detection_rules: Array.isArray(rules) ? rules : [rules],
        });
    }

    /**
     * Adds `minecraft:map_color`.
     *
     * The color can be a `#RRGGBB` string or an `[R, G, B]` array using 0-255
     * channel values. Supplying a tint method writes the detailed object form;
     * otherwise this helper writes the compact scalar or array form.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_map_color
     */
    addMapColor(color: BlockMapColor, tintMethod: BlockTintMethod | string | undefined = undefined): this {
        if (tintMethod === undefined) {
            this.setValueAtPath("minecraft:map_color", color);
            return this;
        }

        return this.addComponent("minecraft:map_color", {
            color: color,
            tint_method: tintMethod,
        });
    }

    /**
     * Adds `minecraft:movable`.
     *
     * This controls how the block reacts to piston movement. `push_pull`
     * allows normal piston push and sticky-piston pull behavior, `push`
     * prevents sticky-piston pulling, `popped` destroys the block when moved,
     * and `immovable` prevents piston movement.
     *
     * Requires format version 1.21.100 or later, or Upcoming Creator Features
     * in earlier format versions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_movable
     */
    addMovable(movementType: BlockMovementType = "push_pull", sticky: BlockStickyMode = "none"): this {
        return this.addComponent("minecraft:movable", {
            movement_type: movementType,
            sticky: sticky,
        });
    }

    /**
     * Adds `minecraft:precipitation_interactions`.
     *
     * This controls how the block interacts with rain and snow. The current
     * Microsoft forms list `none`, `obstruct_rain`,
     * `obstruct_rain_accumulate_snow`, and `snowlogging`; the 1.26.20 update
     * notes also mention `snow_log_no_collision`.
     *
     * Requires format version 1.21.130 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_precipitation_interactions
     */
    addPrecipitationInteractions(precipitationBehavior: BlockPrecipitationBehavior): this {
        return this.addComponent("minecraft:precipitation_interactions", {
            precipitation_behavior: precipitationBehavior,
        });
    }

    /**
     * Adds `minecraft:redstone_consumer`.
     *
     * This allows script custom components to receive `onRedstoneUpdate` when
     * incoming power is at least `minPower`. If `propagatesPower` is true,
     * redstone signal can pass through this block. A block cannot have both
     * redstone consumer and redstone producer components.
     *
     * Requires format version 1.26.0 or later, or Upcoming Creator Features in
     * earlier format versions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_redstone_consumer
     */
    addRedstoneConsumer(minPower = 0, propagatesPower = false): this {
        return this.addComponent("minecraft:redstone_consumer", {
            min_power: minPower,
            propagates_power: propagatesPower,
        });
    }

    /**
     * Adds `minecraft:redstone_producer`.
     *
     * This makes the block output redstone power from 0 through 15. If
     * `stronglyPoweredFace` is supplied, the block touching that face becomes
     * strongly powered. If `connectedFaces` is omitted, all faces are connected.
     * `transformRelative` rotates the face settings with `minecraft:transformation`.
     *
     * A block cannot have both redstone producer and redstone consumer
     * components.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_redstone_producer
     */
    addRedstoneProducer(
        power: number,
        stronglyPoweredFace: BlockDirection | undefined = undefined,
        connectedFaces: BlockDirection[] | undefined = undefined,
        transformRelative = false,
    ): this {
        const data: Record<string, unknown> = {
            power: power,
            transform_relative: transformRelative,
        };

        if (stronglyPoweredFace !== undefined) {
            data.strongly_powered_face = stronglyPoweredFace;
        }

        if (connectedFaces !== undefined) {
            data.connected_faces = connectedFaces;
        }

        return this.addComponent("minecraft:redstone_producer", data);
    }

    /**
     * Adds `minecraft:replaceable`.
     *
     * Blocks with this component can be replaced when another block is placed
     * in the same position.
     *
     * Requires format version 1.21.70 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_replaceable
     */
    addReplaceable(): this {
        return this.addComponent("minecraft:replaceable", {});
    }

    /**
     * Adds `minecraft:support`.
     *
     * This defines the support shape exposed by the block. Current docs list
     * `fence` and `stair`. Custom stair support also requires the vertical-half
     * and placement-direction states described in the Minecraft docs.
     *
     * Requires format version 1.26.0 or later, or Upcoming Creator Features in
     * earlier format versions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_support
     */
    addSupport(shape: BlockSupportShape): this {
        return this.addComponent("minecraft:support", {
            shape: shape,
        });
    }

    /**
     * Specifies the loot table used when this block is destroyed.
     *
     * The path is relative to the behavior pack root, for example
     * `loot_tables/blocks/my_block.json`. Microsoft docs list a maximum path
     * length of 256 characters. If this component is omitted, the block drops
     * itself.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_loot
     */
    addLoot(table: string): this {
        return this.addComponent("minecraft:loot", table);
    }

    /**
     * Adds a simple `minecraft:material_instances` component using one texture
     * for every face and material instance.
     *
     * Material instances map block faces or geometry material instance names
     * to render settings. Microsoft docs list a maximum of 64 instances and
     * note that from format version 1.21.80 onward, custom geometry and custom
     * material instances must be provided together.
     *
     * @param textureName Texture key from `terrain_texture.json`.
     * @param renderMethod Optional render method. Defaults to Minecraft's
     * `opaque` behavior when omitted.
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_material_instances
     */
    addBasicMaterial(textureName: string, renderMethod: BlockRenderMethod | undefined = undefined): this {
        const materialData: Record<string, unknown> = {
            "*": {
                texture: textureName,
            },
        };

        if (renderMethod !== undefined) {
            (materialData["*"] as Record<string, string>)["render_method"] = renderMethod;
        }

        this.setValueAtPath("minecraft:material_instances", materialData);
        return this;
    }

    /**
     * Adds a full `minecraft:material_instances` component.
     *
     * Keys can be `*`, block faces such as `up` or `north`, or material
     * instance names from a geometry file. Values can either be a material
     * object or the name of another already-defined material instance.
     *
     * Supported material options include texture, render method, ambient
     * occlusion, face dimming, UV randomization, tint method, and alpha-masked
     * tinting.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_material_instances
     */
    addComplexMaterial(textures: BlockMaterialInstances): this {
        this.setValueAtPath("minecraft:material_instances", textures);
        return this;
    }

    /**
     * Adds a `minecraft:geometry` component for custom block rendering.
     *
     * The geometry identifier must match a geometry description in a loaded
     * resource pack, or one of the supported vanilla identifiers such as
     * `minecraft:geometry.full_block` or `minecraft:geometry.cross`.
     *
     * Microsoft docs note that from format version 1.21.80 onward, custom
     * geometry and custom material instances must be provided together.
     *
     * @param modelIdentifier Geometry description identifier.
     * @param boneVisibility Optional Molang visibility expressions keyed by
     * bone name. Current docs limit expressions to `query.block_state()`.
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_geometry
     */
    addBasicGeometry(modelIdentifier: string, boneVisibility: BlockBoneVisibility | undefined = undefined): this {
        const geometryData: Record<string, unknown> = {
            identifier: modelIdentifier,
        };

        if (boneVisibility !== undefined) {
            geometryData["bone_visibility"] = boneVisibility;
        }

        this.setValueAtPath("minecraft:geometry", geometryData);
        return this;
    }

    /**
     * Adds `minecraft:random_offset` for rendered position, outline, and
     * collision variation.
     *
     * The offset is seeded from the block position. This helper uses zero
     * steps on each axis, matching the existing API's min/max-only shape. If
     * the offset would push collision outside the cube bounds, Minecraft
     * automatically adjusts the effective range. Culling does not account for
     * random offset.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_random_offset
     */
    addRandomOffset(xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number): this {
        return this.addComponent("minecraft:random_offset", {
            x: {
                steps: 0,
                range: {
                    min: xMin,
                    max: xMax,
                },
            },
            y: {
                steps: 0,
                range: {
                    min: yMin,
                    max: yMax,
                },
            },
            z: {
                steps: 0,
                range: {
                    min: zMin,
                    max: zMax,
                },
            },
        });
    }

    /**
     * Adds `minecraft:tick` so block custom components can receive `onTick`.
     *
     * After each tick, Minecraft chooses the next interval from the provided
     * inclusive tick range. If both values are equal, the block ticks at a
     * fixed interval. The first value must be lower than or equal to the
     * second. If `looping` is false, the block ticks only once.
     *
     * Custom components listening to `onTick` require this component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_tick
     */
    addTickComponent(interval: BlockTickInterval, looping = true): this {
        return this.addComponent("minecraft:tick", {
            looping: looping,
            interval_range: interval,
        });
    }

    /**
     * Adds `minecraft:transformation` for block translation, rotation, and
     * scale relative to the center of the block's world position.
     *
     * Rotation values are in 90-degree increments. Pivots control where
     * rotation or scale is applied from. Omitted fields use Minecraft defaults.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_transformation
     */
    addTransformComponent(args: BlockTransformation): this {
        this.setValueAtPath("minecraft:transformation", args);
        return this;
    }

    /**
     * Adds a custom block component in the current direct component form.
     *
     * The component id must be registered from script using
     * `BlockComponentRegistry.registerCustomComponent(...)`, and should include
     * a namespace. `data` becomes the custom component parameters passed to
     * the script callback.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/scripting/custom-components
     * @see https://learn.microsoft.com/minecraft/creator/scriptapi/minecraft/server/blockcomponentregistry
     */
    addCustomComponent(id: string, data: Record<string, unknown> | string | number | boolean = {}): this {
        this.setValueAtPath(`${id}`, data);
        return this;
    }

    /**
     * Adds `minecraft:crafting_table` to make this block open the crafting UI
     * and craft recipes with matching crafting tags.
     *
     * Only shaped and shapeless recipe types are supported by this component.
     * Microsoft docs list a maximum of 64 crafting tags, with each tag limited
     * to 64 characters. If `tableName` is omitted, Minecraft falls back to the
     * display name component, then the block name.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_crafting_table
     */
    addCraftingTableComponent(tags: string[], tableName: string | undefined = undefined): this {
        return this.addComponent("minecraft:crafting_table", {
            crafting_tags: tags,
            table_name: tableName,
        });
    }

    /**
     * Adds `minecraft:placement_filter`, defining where this block can be
     * placed and survive.
     *
     * If a placement condition is not met, the block cannot be placed. If an
     * already-placed block later fails its conditions, it pops off and drops.
     * Conditions specify allowed faces and blocks that may exist in that
     * direction. Block filters can use block identifiers, name + states, or
     * Molang tag queries.
     *
     * Microsoft docs list a maximum of 64 conditions, 6 allowed faces per
     * condition, and 64 block filters per condition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_placement_filter
     */
    addPlacementFilter(condition: BlockPlacementFilterCondition[]): this {
        this.setValueAtPath("minecraft:placement_filter", {
            conditions: condition,
        });
        return this;
    }

    /**
     * Adds `minecraft:destructible_by_mining`.
     *
     * `true` uses Minecraft's default mining time. `false` makes the block
     * indestructible by mining. A number writes `seconds_to_destroy` and sets
     * the base mining time directly. If this component is omitted, Minecraft
     * uses the default mining time.
     *
     * Microsoft docs require format version 1.21.50 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_destructible_by_mining
     */
    addDestructibleByMining(value: number | boolean): this {
        if (typeof value === "boolean") {
            return this.addComponent("minecraft:destructible_by_mining", value);
        }

        return this.addComponent("minecraft:destructible_by_mining", {
            seconds_to_destroy: value,
        });
    }

    /**
     * Adds `minecraft:destructible_by_explosion`.
     *
     * `true` uses Minecraft's default explosion resistance. `false` makes the
     * block indestructible by explosions. A number writes
     * `explosion_resistance`; higher values are harder to destroy, while zero
     * or negative values explode easily. If this component is omitted,
     * Minecraft uses default explosion resistance.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_destructible_by_explosion
     */
    addDestructibleByExplosion(value: number | boolean): this {
        if (typeof value === "boolean") {
            return this.addComponent("minecraft:destructible_by_explosion", value);
        }

        return this.addComponent("minecraft:destructible_by_explosion", {
            explosion_resistance: value,
        });
    }

    /**
     * Adds `minecraft:redstone_conductivity`.
     *
     * This controls basic redstone behavior. `isRedstoneConductor` specifies
     * whether the block can be powered by redstone, and
     * `allowsWireToStepDown` specifies whether redstone wire can stair-step
     * downward on the block.
     *
     * Requires format version 1.21.30 or later. In earlier format versions,
     * Microsoft docs require Upcoming Creator Features.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_redstone_conductivity
     */
    addRedstoneConnectivity(isRedstoneConductor: boolean, allowsWireToStepDown: boolean = true): this {
        return this.addComponent("minecraft:redstone_conductivity", {
            redstone_conductor: isRedstoneConductor,
            allows_wire_to_step_down: allowsWireToStepDown,
        });
    }

    /**
     * Adds `minecraft:collision_box` for entity collision.
     *
     * Pass `true` to use Minecraft's default full-block collision, `false` to
     * disable entity collision, or `origin` and `size` to write a single
     * custom box. If the component is omitted, Minecraft uses the default
     * collision box.
     *
     * `origin` is the minimal position of the collision bounds. `size` is each
     * side length. The sum of origin + size must stay inside the inclusive
     * block bounds from [-8, 0, -8] to [8, 24, 8].
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_collision_box
     */
    addCollisionBox(enabled: boolean): this;
    addCollisionBox(origin: BlockVec3, size: BlockVec3): this;
    addCollisionBox(originOrEnabled: BlockVec3 | boolean, size?: BlockVec3): this {
        if (typeof originOrEnabled === "boolean") {
            this.setValueAtPath("minecraft:collision_box", originOrEnabled);
            return this;
        }

        if (size === undefined) {
            throw new Error("addCollisionBox requires a size when origin is provided.");
        }

        this.setValueAtPath("minecraft:collision_box", {
            origin: originOrEnabled,
            size: size,
        });
        return this;
    }

    /**
     * Adds `minecraft:collision_box` with multiple entity collision boxes.
     *
     * Minecraft allows up to 16 boxes, and every origin + size pair must stay
     * inside the inclusive block bounds from [-8, 0, -8] to [8, 24, 8].
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_collision_box
     */
    addComplexCollisionBox(boxes: BlockCollisionBox[]): this {
        this.setValueAtPath("minecraft:collision_box", boxes);
        return this;
    }

    /**
     * Adds `minecraft:selection_box` for the player's cursor outline.
     *
     * Pass `true` to use Minecraft's default full-block selection, `false` to
     * make the block not selectable by the player's cursor, or `origin` and
     * `size` to write a single custom box. If the component is omitted,
     * Minecraft uses the default selection box.
     *
     * `origin` is the minimal position of the selection bounds. `size` is each
     * side length. The sum of origin + size must stay inside the inclusive
     * block bounds from [-8, 0, -8] to [8, 16, 8].
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_selection_box
     */
    addSelectionBox(enabled: boolean): this;
    addSelectionBox(origin: BlockVec3, size: BlockVec3): this;
    addSelectionBox(originOrEnabled: BlockVec3 | boolean, size?: BlockVec3): this {
        if (typeof originOrEnabled === "boolean") {
            this.setValueAtPath("minecraft:selection_box", originOrEnabled);
            return this;
        }

        if (size === undefined) {
            throw new Error("addSelectionBox requires a size when origin is provided.");
        }

        this.setValueAtPath("minecraft:selection_box", {
            origin: originOrEnabled,
            size: size,
        });

        return this;
    }
}
