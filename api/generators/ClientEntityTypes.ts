/**
 * Molang expression string used by client entity resource definitions.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityMolang = string;

/**
 * Minecraft version string used by `format_version` and `min_engine_version`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityVersion = string;

/**
 * Animation resource identifier accepted by the client entity `animations` map.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction
 */
export type ClientEntityAnimationId = `animation.${string}`;

/**
 * Animation controller identifier accepted by the client entity `animations` map.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction
 */
export type ClientEntityAnimationControllerId = `controller.${string}`;

/**
 * Render controller identifier accepted by `render_controllers`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityRenderControllerId = `controller.render.${string}`;

/**
 * Resource alias map used by materials, textures, geometry, effects, and sounds.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityResourceMap = Record<string, string>;

/**
 * Entry accepted by `scripts.animate`.
 *
 * A string always plays the named animation alias. An object maps an animation
 * alias to a Molang condition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityAnimateEntry = string | Record<string, ClientEntityMolang>;

/**
 * Entry accepted by `render_controllers`.
 *
 * A string always uses the render controller. An object maps a render
 * controller id to a Molang condition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityRenderControllerEntry = string | Record<string, ClientEntityMolang>;

/**
 * Public Molang variables declared by `scripts.variables`.
 *
 * Current client entity documentation only supports the `public` setting.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export type ClientEntityPublicVariables = Record<`variable.${string}`, "public">;

/**
 * Spawn egg definition accepted by `description.spawn_egg`.
 *
 * Use either color fields or a texture field. If a texture has multiple
 * variants, `texture_index` selects one of them.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#spawn-egg
 */
export interface ClientEntitySpawnEgg {
    /**
     * Texture key from `textures/item_texture.json`.
     */
    texture?: string;

    /**
     * Base spawn egg color as a hex string.
     */
    base_color?: string;

    /**
     * Overlay spawn egg color as a hex string.
     */
    overlay_color?: string;

    /**
     * Texture variant index used when the texture key has multiple textures.
     */
    texture_index?: number;
}

/**
 * Three-number offset used by client entity description locators.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#locators
 */
export type ClientEntityLocatorOffset = [number, number, number];

/**
 * Locator map shaped as locator name, then bone name, then model-space offset.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#locators
 */
export type ClientEntityLocatorMap = Record<string, Record<string, ClientEntityLocatorOffset>>;

/**
 * Built-in entity material identifiers commonly used by vanilla client
 * entities.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export enum EntityMaterials {
    Entity = "entity",
    EntityAlphablend = "entity_alphablend",
    EntityAlphablendNoColorEntityStatic = "entity_alphablend_no_color_entity_static",
    EntityAlphatest = "entity_alphatest",
    EntityAlphatestChangeColor = "entity_alphatest_change_color",
    EntityAlphatestChangeColorGlint = "entity_alphatest_change_color_glint",
    EntityAlphatestGlint = "entity_alphatest_glint",
    EntityAlphatestGlintItem = "entity_alphatest_glint_item",
    EntityAlphatestMulticolorTint = "entity_alphatest_multicolor_tint",
    EntityBeam = "entity_beam",
    EntityBeamAdditive = "entity_beam_additive",
    EntityChangeColor = "entity_change_color",
    EntityChangeColorGlint = "entity_change_color_glint",
    EntityCustom = "entity_custom",
    EntityDissolveLayer0 = "entity_dissolve_layer_0",
    EntityDissolveLayer1 = "entity_dissolve_layer_1",
    EntityEmissive = "entity_emissive",
    EntityEmissiveAlpha = "entity_emissive_alpha",
    EntityEmissiveAlphaOneSided = "entity_emissive_alpha_one_sided",
    EntityFlatColorLine = "entity_flat_color_line",
    EntityGlint = "entity_glint",
    EntityLeadBase = "entity_lead_base",
    EntityLoyaltyRope = "entity_loyalty_rope",
    EntityMultitexture = "entity_multitexture",
    EntityMultitextureAlphaTest = "entity_multitexture_alpha_test",
    EntityMultitextureAlphaTestColorMask = "entity_multitexture_alpha_test_color_mask",
    EntityMultitextureColorMask = "entity_multitexture_color_mask",
    EntityMultitextureMasked = "entity_multitexture_masked",
    EntityMultitextureMultiplicativeBlend = "entity_multitexture_multiplicative_blend"
}
