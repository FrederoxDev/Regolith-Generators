import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type RenderControllerArrayMap,
    type RenderControllerArraysData,
    type RenderControllerColorData,
    type RenderControllerData,
    type RenderControllerDocumentData,
    type RenderControllerFormatVersion,
    type RenderControllerIdentifier,
    type RenderControllerMaterialEntry,
    type RenderControllerMolang,
    type RenderControllerPartVisibilityEntry,
    type RenderControllerUvAnimData,
    type RenderControllerVector2
} from "./RenderControllerTypes.ts";

export * from "./RenderControllerTypes.ts";

const DEFAULT_RENDER_CONTROLLER_FORMAT_VERSION: RenderControllerFormatVersion = "1.8.0";

function qualifyRenderControllerIdentifier(projectNamespace: string, id: string): RenderControllerIdentifier {
    return id.startsWith("controller.render.")
        ? id
        : `controller.render.${projectNamespace}.${id}`;
}

function normalizeArrayName(name: string): string {
    return name.includes(".") ? name : `Array.${name}`;
}

/**
 * Factory for resource-pack render controller files.
 *
 * Generated files are written under `RP/render_controllers`. A single
 * generator instance writes one render controller document containing all
 * controllers queued through `makeRenderController`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationrendercontroller
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0
 */
export class RenderControllerGenerator extends GeneratorFactory<RenderControllerDef> {
    fileName: string;
    formatVersion: RenderControllerFormatVersion;

    /**
     * Creates a render controller generator.
     */
    constructor(
        projectNamespace: string,
        fileName = "render_controllers",
        formatVersion: RenderControllerFormatVersion = DEFAULT_RENDER_CONTROLLER_FORMAT_VERSION
    ) {
        super(projectNamespace, "RP/render_controllers");
        this.fileName = fileName;
        this.formatVersion = formatVersion;
    }

    /**
     * Sets the root document `format_version`.
     */
    setFormatVersion(version: RenderControllerFormatVersion): this {
        this.formatVersion = version;
        return this;
    }

    /**
     * Queues a render controller.
     *
     * If `id` does not start with `controller.render.`, the generated
     * identifier is `controller.render.<projectNamespace>.<id>`.
     */
    makeRenderController(id: string): RenderControllerDef {
        const identifier = qualifyRenderControllerIdentifier(this.projectNamespace, id);
        const def = new RenderControllerDef(identifier);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Alias for `makeRenderController`.
     */
    makeController(id: string): RenderControllerDef {
        return this.makeRenderController(id);
    }

    /**
     * Queues a render controller for an already-qualified identifier.
     */
    makeRenderControllerForIdentifier(identifier: RenderControllerIdentifier): RenderControllerDef {
        const def = new RenderControllerDef(identifier);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Writes the queued render controller document.
     */
    public override generate(): void {
        const data: RenderControllerDocumentData = {
            "format_version": this.formatVersion,
            "render_controllers": {}
        };

        for (const def of this.filesToGenerate.values()) {
            data.render_controllers[def.identifier] = def.toJson() as RenderControllerData;
        }

        createFile(JSON.stringify(data, null, 2), `${this.exportFolder}/${this.fileName}.render_controllers.json`);
    }
}

/**
 * Fluent builder for one render controller definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/render_controller.v1.8.0
 */
export class RenderControllerDef extends GeneratorBase<RenderControllerDef> {
    data: RenderControllerData;
    identifier: RenderControllerIdentifier;

    /**
     * Creates a render controller definition.
     */
    constructor(identifier: RenderControllerIdentifier) {
        super();

        this.identifier = identifier;
        this.data = {};
    }

    private arrayPath(kind: "geometries" | "materials" | "textures", name: string): string {
        return `arrays/${kind}/${normalizeArrayName(name)}`;
    }

    /**
     * Replaces the full render controller data object.
     */
    setController(data: RenderControllerData): this {
        this.data = data;
        return this;
    }

    /**
     * Sets a field inside this render controller.
     */
    setControllerProperty(key: string, value: unknown): this {
        this.setValueAtPath(key, value);
        return this;
    }

    /**
     * Replaces the full `arrays` object.
     */
    setArrays(arrays: RenderControllerArraysData): this {
        this.setValueAtPath("arrays", arrays);
        return this;
    }

    /**
     * Replaces one array category.
     */
    setArrayCollection(
        kind: "geometries" | "materials" | "textures",
        arrays: RenderControllerArrayMap
    ): this {
        this.setValueAtPath(`arrays/${kind}`, arrays);
        return this;
    }

    /**
     * Adds or replaces one named array.
     *
     * Pass either `skins` or `Array.skins` for the array name.
     */
    addArray(kind: "geometries" | "materials" | "textures", name: string, values: string[]): this {
        this.setValueAtPath(this.arrayPath(kind, name), values);
        return this;
    }

    /**
     * Adds or replaces one geometry array.
     */
    addGeometryArray(name: string, geometries: string[]): this {
        return this.addArray("geometries", name, geometries);
    }

    /**
     * Adds or replaces one material array.
     */
    addMaterialArray(name: string, materials: string[]): this {
        return this.addArray("materials", name, materials);
    }

    /**
     * Adds or replaces one texture array.
     */
    addTextureArray(name: string, textures: string[]): this {
        return this.addArray("textures", name, textures);
    }

    /**
     * Sets the geometry reference or array expression.
     */
    setGeometry(geometry: string): this {
        this.setValueAtPath("geometry", geometry);
        return this;
    }

    /**
     * Sets the geometry to read from a named array.
     */
    setGeometryFromArray(arrayName: string, indexExpression: RenderControllerMolang): this {
        return this.setGeometry(`${normalizeArrayName(arrayName)}[${indexExpression}]`);
    }

    /**
     * Replaces the full `materials` array.
     */
    setMaterials(materials: RenderControllerMaterialEntry[]): this {
        this.setValueAtPath("materials", materials);
        return this;
    }

    /**
     * Adds a material entry that applies to all parts.
     */
    addMaterial(material: string): this;
    /**
     * Adds a material entry for a part or wildcard pattern.
     */
    addMaterial(partPattern: string, material: string): this;
    addMaterial(partOrMaterial: string, material?: string): this {
        const materials = this.getValueAtPath<RenderControllerMaterialEntry[]>("materials", []);

        if (material === undefined) {
            materials.push(partOrMaterial);
        }
        else {
            materials.push({ [partOrMaterial]: material });
        }

        this.setValueAtPath("materials", materials);
        return this;
    }

    /**
     * Adds a material entry that selects from a named material array.
     */
    addMaterialFromArray(
        partPattern: string,
        arrayName: string,
        indexExpression: RenderControllerMolang
    ): this {
        return this.addMaterial(partPattern, `${normalizeArrayName(arrayName)}[${indexExpression}]`);
    }

    /**
     * Replaces the `textures` field.
     */
    setTextures(textures: string | string[]): this {
        this.setValueAtPath("textures", textures);
        return this;
    }

    /**
     * Adds a texture layer.
     */
    addTexture(texture: string): this {
        const existing = this.getValueAtPath<string | string[]>("textures", []);
        const textures = Array.isArray(existing) ? existing : [existing];
        textures.push(texture);
        this.setValueAtPath("textures", textures);
        return this;
    }

    /**
     * Adds a texture layer selected from a named texture array.
     */
    addTextureFromArray(arrayName: string, indexExpression: RenderControllerMolang): this {
        return this.addTexture(`${normalizeArrayName(arrayName)}[${indexExpression}]`);
    }

    /**
     * Replaces the full `part_visibility` array.
     */
    setPartVisibility(partVisibility: RenderControllerPartVisibilityEntry[]): this {
        this.setValueAtPath("part_visibility", partVisibility);
        return this;
    }

    /**
     * Adds a part visibility expression for a part or wildcard pattern.
     */
    addPartVisibility(partPattern: string, condition: RenderControllerMolang): this {
        const partVisibility = this.getValueAtPath<RenderControllerPartVisibilityEntry[]>("part_visibility", []);
        partVisibility.push({ [partPattern]: condition });
        this.setValueAtPath("part_visibility", partVisibility);
        return this;
    }

    /**
     * Hides a part or wildcard pattern.
     */
    hidePart(partPattern: string): this {
        return this.addPartVisibility(partPattern, 0);
    }

    /**
     * Shows a part or wildcard pattern.
     */
    showPart(partPattern: string): this {
        return this.addPartVisibility(partPattern, 1);
    }

    /**
     * Sets the tint color.
     */
    setColor(color: RenderControllerColorData): this;
    setColor(r: RenderControllerMolang, g: RenderControllerMolang, b: RenderControllerMolang, a?: RenderControllerMolang): this;
    setColor(
        colorOrR: RenderControllerColorData | RenderControllerMolang,
        g?: RenderControllerMolang,
        b?: RenderControllerMolang,
        a?: RenderControllerMolang
    ): this {
        const color = typeof colorOrR === "object"
            ? colorOrR
            : { r: colorOrR, g, b, a };

        this.setValueAtPath("color", color);
        return this;
    }

    /**
     * Sets the hurt color.
     */
    setIsHurtColor(color: RenderControllerColorData): this;
    setIsHurtColor(r: RenderControllerMolang, g: RenderControllerMolang, b: RenderControllerMolang, a?: RenderControllerMolang): this;
    setIsHurtColor(
        colorOrR: RenderControllerColorData | RenderControllerMolang,
        g?: RenderControllerMolang,
        b?: RenderControllerMolang,
        a?: RenderControllerMolang
    ): this {
        const color = typeof colorOrR === "object"
            ? colorOrR
            : { r: colorOrR, g, b, a };

        this.setValueAtPath("is_hurt_color", color);
        return this;
    }

    /**
     * Sets the on-fire color.
     */
    setOnFireColor(color: RenderControllerColorData): this;
    setOnFireColor(r: RenderControllerMolang, g: RenderControllerMolang, b: RenderControllerMolang, a?: RenderControllerMolang): this;
    setOnFireColor(
        colorOrR: RenderControllerColorData | RenderControllerMolang,
        g?: RenderControllerMolang,
        b?: RenderControllerMolang,
        a?: RenderControllerMolang
    ): this {
        const color = typeof colorOrR === "object"
            ? colorOrR
            : { r: colorOrR, g, b, a };

        this.setValueAtPath("on_fire_color", color);
        return this;
    }

    /**
     * Sets the overlay color.
     */
    setOverlayColor(color: RenderControllerColorData): this;
    setOverlayColor(r: RenderControllerMolang, g: RenderControllerMolang, b: RenderControllerMolang, a?: RenderControllerMolang): this;
    setOverlayColor(
        colorOrR: RenderControllerColorData | RenderControllerMolang,
        g?: RenderControllerMolang,
        b?: RenderControllerMolang,
        a?: RenderControllerMolang
    ): this {
        const color = typeof colorOrR === "object"
            ? colorOrR
            : { r: colorOrR, g, b, a };

        this.setValueAtPath("overlay_color", color);
        return this;
    }

    /**
     * Sets UV animation data.
     */
    setUvAnim(data: RenderControllerUvAnimData): this;
    setUvAnim(offset: RenderControllerVector2, scale: RenderControllerVector2): this;
    setUvAnim(
        dataOrOffset: RenderControllerUvAnimData | RenderControllerVector2,
        scale?: RenderControllerVector2
    ): this {
        const data = Array.isArray(dataOrOffset)
            ? {
                offset: dataOrOffset,
                scale: scale ?? [1, 1]
            }
            : dataOrOffset;

        this.setValueAtPath("uv_anim", data);
        return this;
    }

    /**
     * Sets the light color multiplier.
     */
    setLightColorMultiplier(multiplier: RenderControllerMolang): this {
        this.setValueAtPath("light_color_multiplier", multiplier);
        return this;
    }

    /**
     * Sets whether this render controller ignores lighting.
     */
    setIgnoreLighting(enabled = true): this {
        this.setValueAtPath("ignore_lighting", enabled);
        return this;
    }

    /**
     * Sets whether this render controller filters lighting.
     */
    setFilterLighting(enabled = true): this {
        this.setValueAtPath("filter_lighting", enabled);
        return this;
    }

    /**
     * Sets whether animation matrices should be rebuilt.
     */
    setRebuildAnimationMatrices(enabled = true): this {
        this.setValueAtPath("rebuild_animation_matrices", enabled);
        return this;
    }
}
