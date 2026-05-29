import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import {
    type TextureSetColorLayer,
    type TextureSetData,
    type TextureSetDocumentData,
    type TextureSetFormatVersion,
    type TextureSetHeightmapLayer,
    type TextureSetMerLayer,
    type TextureSetMersLayer,
    type TextureSetPath
} from "./TextureSetTypes.ts";

export * from "./TextureSetTypes.ts";

const DEFAULT_TEXTURE_SET_FORMAT_VERSION: TextureSetFormatVersion = "1.21.30";
const TEXTURE_SET_PATH = "minecraft:texture_set";

function normalizeTextureSetPath(path: string): TextureSetPath {
    return path
        .replace(/\\/g, "/")
        .replace(/^RP\/textures\//, "")
        .replace(/^textures\//, "")
        .replace(/\.texture_set\.json$/i, "")
        .replace(/\.json$/i, "")
        .replace(/\.(png|tga|jpe?g)$/i, "");
}

/**
 * Factory for resource-pack texture set files.
 *
 * Generated files are written under `RP/textures` with the
 * `.texture_set.json` suffix. Pass paths relative to `RP/textures`, such as
 * `blocks/iron_block`, `entity/pig/pig`, `items/custom_sword`, or
 * `particle/spark`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/texturesetsreference/texturesetsconcepts/texturesetsintroduction
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/texture_set.v1.21.30
 */
export class TextureSetGenerator extends GeneratorFactory<TextureSetDef> {
    /**
     * Creates a texture set generator that writes into `RP/textures`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/textures");
    }

    /**
     * Queues a texture set file at a path relative to `RP/textures`.
     *
     * The `.texture_set.json` suffix is added automatically. A leading
     * `textures/` prefix and common image extensions are stripped for
     * convenience.
     */
    makeTextureSet(
        path: string,
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ): TextureSetDef {
        const normalizedPath = normalizeTextureSetPath(path);
        const def = new TextureSetDef(color, formatVersion);
        this.filesToGenerate.set(normalizedPath, def);
        return def;
    }

    /**
     * Queues a block texture set under `RP/textures/blocks`.
     */
    makeBlockTextureSet(
        textureName: string,
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ): TextureSetDef {
        return this.makeTextureSet(`blocks/${textureName}`, color, formatVersion);
    }

    /**
     * Queues an entity texture set under `RP/textures/entity`.
     */
    makeEntityTextureSet(
        textureName: string,
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ): TextureSetDef {
        return this.makeTextureSet(`entity/${textureName}`, color, formatVersion);
    }

    /**
     * Queues an item texture set under `RP/textures/items`.
     */
    makeItemTextureSet(
        textureName: string,
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ): TextureSetDef {
        return this.makeTextureSet(`items/${textureName}`, color, formatVersion);
    }

    /**
     * Queues a particle texture set under `RP/textures/particle`.
     */
    makeParticleTextureSet(
        textureName: string,
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ): TextureSetDef {
        return this.makeTextureSet(`particle/${textureName}`, color, formatVersion);
    }

    /**
     * Writes queued texture set files.
     */
    public override generate(): void {
        for (const [path, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${path}.texture_set.json`);
        }
    }
}

/**
 * Fluent builder for a `minecraft:texture_set` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/texturesetsreference/texturesetsconcepts/texturesetsintroduction
 */
export class TextureSetDef extends GeneratorBase<TextureSetDef> {
    data: TextureSetDocumentData;

    /**
     * Creates a texture set definition.
     */
    constructor(
        color: TextureSetColorLayer,
        formatVersion: TextureSetFormatVersion = DEFAULT_TEXTURE_SET_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:texture_set": {
                "color": color
            }
        };
    }

    private textureSet(): TextureSetData {
        return this.data["minecraft:texture_set"];
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: TextureSetFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the full `minecraft:texture_set` object.
     */
    setTextureSet(data: TextureSetData): this {
        this.data["minecraft:texture_set"] = data;
        return this;
    }

    /**
     * Sets a field inside `minecraft:texture_set`.
     */
    setTextureSetProperty(key: string, value: unknown): this {
        this.setValueAtPath(`${TEXTURE_SET_PATH}/${key}`, value);
        return this;
    }

    /**
     * Sets the required color layer.
     *
     * Strings can reference a texture image in the same folder or specify a
     * supported hex color. Arrays specify a uniform RGBA value.
     */
    setColor(color: TextureSetColorLayer): this {
        this.textureSet().color = color;
        return this;
    }

    /**
     * Sets the normal map layer and removes `heightmap`, because those layers
     * are mutually exclusive.
     */
    setNormal(texture: string): this {
        const textureSet = this.textureSet();
        textureSet.normal = texture;
        delete textureSet.heightmap;
        return this;
    }

    /**
     * Sets the heightmap layer and removes `normal`, because those layers are
     * mutually exclusive.
     */
    setHeightmap(heightmap: TextureSetHeightmapLayer): this {
        const textureSet = this.textureSet();
        textureSet.heightmap = heightmap;
        delete textureSet.normal;
        return this;
    }

    /**
     * Sets the metalness/emissive/roughness layer and removes
     * `metalness_emissive_roughness_subsurface`, because MER and MERS are
     * mutually exclusive.
     */
    setMetalnessEmissiveRoughness(value: TextureSetMerLayer): this {
        const textureSet = this.textureSet();
        textureSet.metalness_emissive_roughness = value;
        delete textureSet.metalness_emissive_roughness_subsurface;
        return this;
    }

    /**
     * Alias for `setMetalnessEmissiveRoughness`.
     */
    setMer(value: TextureSetMerLayer): this {
        return this.setMetalnessEmissiveRoughness(value);
    }

    /**
     * Sets the metalness/emissive/roughness/subsurface layer and removes
     * `metalness_emissive_roughness`, because MER and MERS are mutually
     * exclusive.
     */
    setMetalnessEmissiveRoughnessSubsurface(value: TextureSetMersLayer): this {
        const textureSet = this.textureSet();
        textureSet.metalness_emissive_roughness_subsurface = value;
        delete textureSet.metalness_emissive_roughness;
        return this;
    }

    /**
     * Alias for `setMetalnessEmissiveRoughnessSubsurface`.
     */
    setMers(value: TextureSetMersLayer): this {
        return this.setMetalnessEmissiveRoughnessSubsurface(value);
    }
}
