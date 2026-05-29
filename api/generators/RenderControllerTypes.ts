/**
 * Version string used by resource-pack render controller JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0
 */
export type RenderControllerFormatVersion = string;

/**
 * Render controller identifier.
 */
export type RenderControllerIdentifier = `controller.render.${string}` | (string & {});

/**
 * String or numeric Molang value accepted by render controllers.
 */
export type RenderControllerMolang = string | number;

/**
 * Two-dimensional vector whose values can be numbers or Molang expressions.
 */
export type RenderControllerVector2 = [RenderControllerMolang, RenderControllerMolang];

/**
 * Named render controller array map.
 */
export type RenderControllerArrayMap = Record<string, string[]>;

/**
 * Dynamic selection arrays for geometries, materials, and textures.
 */
export interface RenderControllerArraysData {
    /**
     * Geometry arrays, commonly keyed as `Array.geos`.
     */
    geometries?: RenderControllerArrayMap;

    /**
     * Material arrays, commonly keyed as `Array.materials`.
     */
    materials?: RenderControllerArrayMap;

    /**
     * Texture arrays, commonly keyed as `Array.skins`.
     */
    textures?: RenderControllerArrayMap;

    /**
     * Future array categories.
     */
    [key: string]: unknown;
}

/**
 * RGBA color object. Each channel can be a number or Molang expression.
 */
export interface RenderControllerColorData {
    /**
     * Red channel.
     */
    r?: RenderControllerMolang;

    /**
     * Green channel.
     */
    g?: RenderControllerMolang;

    /**
     * Blue channel.
     */
    b?: RenderControllerMolang;

    /**
     * Alpha channel.
     */
    a?: RenderControllerMolang;

    /**
     * Future color fields.
     */
    [key: string]: unknown;
}

/**
 * Material selection entry. Object keys are bone/material patterns such as
 * `*`, `body`, or `*Saddle*`.
 */
export type RenderControllerMaterialEntry = string | Record<string, RenderControllerMolang>;

/**
 * Part visibility entry. Object keys are part patterns such as `*` or
 * `chest*`; values are Molang expressions.
 */
export type RenderControllerPartVisibilityEntry = string | Record<string, RenderControllerMolang>;

/**
 * UV animation settings.
 */
export interface RenderControllerUvAnimData {
    /**
     * UV offset expression.
     */
    offset: RenderControllerVector2;

    /**
     * UV scale expression.
     */
    scale: RenderControllerVector2;

    /**
     * Future UV animation fields.
     */
    [key: string]: unknown;
}

/**
 * Single render controller definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0
 */
export interface RenderControllerData {
    /**
     * Dynamic selection arrays.
     */
    arrays?: RenderControllerArraysData;

    /**
     * Geometry reference or array expression, such as `Geometry.default` or
     * `Array.geos[query.variant]`.
     */
    geometry?: string;

    /**
     * Material selections.
     */
    materials?: RenderControllerMaterialEntry[];

    /**
     * Texture reference or texture layer selections.
     */
    textures?: string | string[];

    /**
     * Part visibility selections.
     */
    part_visibility?: RenderControllerPartVisibilityEntry[];

    /**
     * Tint color.
     */
    color?: RenderControllerColorData;

    /**
     * Color used while hurt.
     */
    is_hurt_color?: RenderControllerColorData;

    /**
     * Color used while on fire.
     */
    on_fire_color?: RenderControllerColorData;

    /**
     * Overlay color.
     */
    overlay_color?: RenderControllerColorData;

    /**
     * UV animation settings.
     */
    uv_anim?: RenderControllerUvAnimData;

    /**
     * Light color multiplier.
     */
    light_color_multiplier?: RenderControllerMolang;

    /**
     * Ignore scene lighting.
     */
    ignore_lighting?: boolean;

    /**
     * Filter lighting.
     */
    filter_lighting?: boolean;

    /**
     * Rebuild animation matrices.
     */
    rebuild_animation_matrices?: boolean;

    /**
     * Future render controller fields.
     */
    [key: string]: unknown;
}

/**
 * Root render controller document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationrendercontroller
 */
export interface RenderControllerDocumentData {
    /**
     * File format version.
     */
    format_version: RenderControllerFormatVersion;

    /**
     * Dictionary of render controller definitions.
     */
    render_controllers: Record<string, RenderControllerData>;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}
