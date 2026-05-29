/**
 * Version string used by resource-pack attachable JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
 */
export type AttachableFormatVersion = string;

/**
 * Version value accepted by `description.min_engine_version`.
 */
export type AttachableMinEngineVersion = string | number;

/**
 * Namespaced attachable identifier.
 */
export type AttachableIdentifier = string;

/**
 * Namespaced item identifier associated with an attachable.
 */
export type AttachableItemIdentifier = string;

/**
 * Molang expression string used by attachable scripts.
 */
export type AttachableMolang = string;

/**
 * Resource identifier map used by materials, textures, geometry, animations,
 * particle effects, and sound effects.
 */
export type AttachableResourceMap = Record<string, string>;

/**
 * Animation resource identifier accepted by `description.animations`.
 */
export type AttachableAnimationId = `animation.${string}` | (string & {});

/**
 * Animation controller identifier accepted by `description.animations`.
 */
export type AttachableAnimationControllerId = `controller.animation.${string}` | (string & {});

/**
 * Render controller identifier accepted by `description.render_controllers`.
 */
export type AttachableRenderControllerId = `controller.render.${string}` | (string & {});

/**
 * Built-in material identifiers commonly used by vanilla attachables.
 */
export type AttachableMaterial =
    | "armor"
    | "armor_enchanted"
    | "elytra"
    | "elytra_glint"
    | (string & {});

/**
 * Entry accepted by `description.scripts.animate`.
 *
 * A string always plays the named animation alias. An object maps an animation
 * alias to a Molang condition.
 */
export type AttachableAnimateEntry = string | Record<string, AttachableMolang>;

/**
 * Entry accepted by `description.render_controllers`.
 *
 * A string always uses the render controller. An object maps a render
 * controller id to a Molang condition.
 */
export type AttachableRenderControllerEntry = string | Record<string, AttachableMolang>;

/**
 * Root resource-pack attachable document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
 */
export interface AttachableDocumentData {
    /**
     * File format version.
     */
    format_version: AttachableFormatVersion;

    /**
     * Attachable definition container.
     */
    "minecraft:attachable": AttachableData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * `minecraft:attachable` payload.
 */
export interface AttachableData {
    /**
     * All attachable configuration.
     */
    description: AttachableDescriptionData;

    /**
     * Future attachable fields.
     */
    [key: string]: unknown;
}

/**
 * Attachable description fields.
 */
export interface AttachableDescriptionData {
    /**
     * Unique attachable identifier. This usually matches the item identifier.
     */
    identifier: AttachableIdentifier;

    /**
     * Minimum engine version required for this attachable.
     */
    min_engine_version?: AttachableMinEngineVersion;

    /**
     * Item identifier this attachable is associated with. If omitted, Minecraft
     * uses the attachable identifier.
     */
    item?: AttachableItemIdentifier;

    /**
     * Material aliases for rendering.
     */
    materials?: AttachableResourceMap;

    /**
     * Texture aliases for rendering.
     */
    textures?: AttachableResourceMap;

    /**
     * Geometry aliases for rendering.
     */
    geometry?: AttachableResourceMap;

    /**
     * Animation and animation controller aliases.
     */
    animations?: AttachableResourceMap;

    /**
     * Script configuration for setup, animation, scale, and offscreen updates.
     */
    scripts?: AttachableScriptsData;

    /**
     * Render controller entries.
     */
    render_controllers?: AttachableRenderControllerEntry[];

    /**
     * Whether child attachables are allowed.
     */
    enable_attachables?: boolean;

    /**
     * Particle effect aliases.
     */
    particle_effects?: AttachableResourceMap;

    /**
     * Sound effect aliases.
     */
    sound_effects?: AttachableResourceMap;

    /**
     * Optional spawn egg configuration.
     */
    spawn_egg?: AttachableSpawnEggData;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Script settings under `description.scripts`.
 */
export interface AttachableScriptsData {
    /**
     * Molang script executed when the attachable is set up on the parent
     * entity.
     */
    parent_setup?: AttachableMolang;

    /**
     * Molang script executed before animations are processed.
     */
    pre_animation?: AttachableMolang;

    /**
     * Molang expression for attachable scale.
     */
    scale?: AttachableMolang;

    /**
     * Animations or animation controllers to play.
     */
    animate?: AttachableAnimateEntry[];

    /**
     * Whether bones and effects update while offscreen.
     */
    should_update_bones_and_effects_offscreen?: boolean;

    /**
     * Whether effects update while offscreen.
     */
    should_update_effects_offscreen?: boolean;

    /**
     * Future script fields.
     */
    [key: string]: unknown;
}

/**
 * Spawn egg configuration accepted by attachable descriptions.
 */
export interface AttachableSpawnEggData {
    /**
     * Spawn egg texture key or path.
     */
    texture?: string;

    /**
     * Texture variant index.
     */
    texture_index?: number;

    /**
     * Future spawn egg fields.
     */
    [key: string]: unknown;
}
