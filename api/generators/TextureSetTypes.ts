/**
 * Version string used by resource-pack texture set JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/texture_set.v1.21.30
 */
export type TextureSetFormatVersion = string;

/**
 * Texture set file path relative to `RP/textures`, without the
 * `.texture_set.json` suffix.
 */
export type TextureSetPath = string;

/**
 * Referenced texture layer name, or a hex color value for uniform layers.
 */
export type TextureSetLayerReference = string;

/**
 * Four-channel RGBA value for uniform color layers.
 */
export type TextureSetRgba = [number, number, number, number];

/**
 * Three-channel MER value: red = metalness, green = emissive, blue = roughness.
 */
export type TextureSetMer = [number, number, number];

/**
 * Four-channel MERS value: red = metalness, green = emissive, blue = roughness,
 * alpha = subsurface scattering.
 */
export type TextureSetMers = [number, number, number, number];

/**
 * Color layer. Strings can be texture names or supported hex values.
 */
export type TextureSetColorLayer = TextureSetLayerReference | TextureSetRgba;

/**
 * Heightmap layer. Strings reference a texture image; numbers represent a
 * uniform single-channel height value.
 */
export type TextureSetHeightmapLayer = TextureSetLayerReference | number;

/**
 * Metalness/emissive/roughness layer. Strings can be texture names or
 * supported hex values.
 */
export type TextureSetMerLayer = TextureSetLayerReference | TextureSetMer;

/**
 * Metalness/emissive/roughness/subsurface layer. Strings can be texture names
 * or supported hex values.
 */
export type TextureSetMersLayer = TextureSetLayerReference | TextureSetMers;

/**
 * `minecraft:texture_set` payload.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/texturesetsreference/texturesetsconcepts/texturesetsintroduction
 */
export interface TextureSetData {
    /**
     * Required color layer. This is the only layer used by the classic
     * pipeline.
     */
    color: TextureSetColorLayer;

    /**
     * Normal map layer. Do not define with `heightmap`.
     */
    normal?: TextureSetLayerReference;

    /**
     * Heightmap layer. Do not define with `normal`; Vibrant Visuals does not
     * apply heightmaps to texture-based objects such as items.
     */
    heightmap?: TextureSetHeightmapLayer;

    /**
     * Metalness/emissive/roughness layer. Do not define with
     * `metalness_emissive_roughness_subsurface`.
     */
    metalness_emissive_roughness?: TextureSetMerLayer;

    /**
     * Metalness/emissive/roughness/subsurface layer. This is supported by
     * Vibrant Visuals and ignored by RTX.
     */
    metalness_emissive_roughness_subsurface?: TextureSetMersLayer;

    /**
     * Future texture set fields.
     */
    [key: string]: unknown;
}

/**
 * Root texture set document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/texture_set.v1.21.30
 */
export interface TextureSetDocumentData {
    /**
     * File format version.
     */
    format_version: TextureSetFormatVersion;

    /**
     * Texture set layer definition.
     */
    "minecraft:texture_set": TextureSetData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}
