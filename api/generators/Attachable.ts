import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type AttachableAnimateEntry,
    type AttachableAnimationControllerId,
    type AttachableAnimationId,
    type AttachableDescriptionData,
    type AttachableDocumentData,
    type AttachableFormatVersion,
    type AttachableIdentifier,
    type AttachableItemIdentifier,
    type AttachableMaterial,
    type AttachableMinEngineVersion,
    type AttachableMolang,
    type AttachableRenderControllerEntry,
    type AttachableRenderControllerId,
    type AttachableResourceMap,
    type AttachableScriptsData,
    type AttachableSpawnEggData
} from "./AttachableTypes.ts";

export * from "./AttachableTypes.ts";

const DEFAULT_ATTACHABLE_FORMAT_VERSION: AttachableFormatVersion = "1.10.0";
const DESCRIPTION_PATH = "minecraft:attachable/description";
const SCRIPTS_PATH = `${DESCRIPTION_PATH}/scripts`;

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

/**
 * Factory for resource-pack attachable definition files.
 *
 * Generated files are written under `RP/attachables`. Attachables define how
 * items render when equipped or held, including armor, weapons, tools, and
 * wearable item visuals.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/attachables
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
 */
export class AttachableGenerator extends GeneratorFactory<AttachableDef> {
    /**
     * Creates an attachable generator that writes into `RP/attachables`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/attachables");
    }

    /**
     * Queues an attachable definition.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used.
     */
    makeAttachable(
        id: string,
        formatVersion: AttachableFormatVersion = DEFAULT_ATTACHABLE_FORMAT_VERSION
    ): AttachableDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new AttachableDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues an attachable definition for an already-qualified identifier.
     */
    makeAttachableForIdentifier(
        identifier: AttachableIdentifier,
        formatVersion: AttachableFormatVersion = DEFAULT_ATTACHABLE_FORMAT_VERSION
    ): AttachableDef {
        const def = new AttachableDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a resource-pack `minecraft:attachable` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
 */
export class AttachableDef extends GeneratorBase<AttachableDef> {
    data: AttachableDocumentData;

    /**
     * Creates an attachable definition.
     */
    constructor(
        identifier: AttachableIdentifier,
        formatVersion: AttachableFormatVersion = DEFAULT_ATTACHABLE_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "minecraft:attachable": {
                "description": {
                    "identifier": identifier
                }
            }
        };
    }

    private addResourceAlias(path: string, alias: string, value: string): this {
        const existing = this.getValueAtPath<AttachableResourceMap>(path, {});
        existing[alias] = value;
        this.setValueAtPath(path, existing);
        return this;
    }

    /**
     * Sets the root `format_version`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setFormatVersion(version: AttachableFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the fully-qualified attachable identifier.
     *
     * This usually matches the item identifier the attachable renders for.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/attachables
     */
    setIdentifier(identifier: AttachableIdentifier): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/identifier`, identifier);
        return this;
    }

    /**
     * Sets the minimum engine version required by the attachable.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setMinEngineVersion(version: AttachableMinEngineVersion): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/min_engine_version`, version);
        return this;
    }

    /**
     * Sets the item identifier this attachable is associated with.
     *
     * When omitted, Minecraft uses the attachable identifier.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setItem(item: AttachableItemIdentifier): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/item`, item);
        return this;
    }

    /**
     * Sets a field inside the `minecraft:attachable` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setAttachableProperty(key: string, value: unknown): this {
        this.setValueAtPath(`minecraft:attachable/${key}`, value);
        return this;
    }

    /**
     * Sets a field inside the attachable `description` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setDescriptionProperty(key: string, value: unknown): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/${key}`, value);
        return this;
    }

    /**
     * Replaces the full attachable description object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setDescription(description: AttachableDescriptionData): this {
        this.setValueAtPath(DESCRIPTION_PATH, description);
        return this;
    }

    /**
     * Replaces the full `description.materials` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setMaterials(materials: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/materials`, materials);
        return this;
    }

    /**
     * Adds or replaces a material alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addMaterial(material: AttachableMaterial, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/materials`, as, material);
    }

    /**
     * Replaces the full `description.textures` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setTextures(textures: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/textures`, textures);
        return this;
    }

    /**
     * Adds or replaces a texture alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addTexture(texturePath: string, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/textures`, as, texturePath);
    }

    /**
     * Replaces the full `description.geometry` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setGeometry(geometry: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/geometry`, geometry);
        return this;
    }

    /**
     * Adds or replaces a geometry alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addGeometry(geometryId: string, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/geometry`, as, geometryId);
    }

    /**
     * Replaces the full `description.animations` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setAnimations(animations: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/animations`, animations);
        return this;
    }

    /**
     * Maps an animation or animation controller resource id to a short alias.
     *
     * Use the alias in `scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineAnimation(alias: string, animationId: AttachableAnimationId | AttachableAnimationControllerId): this {
        if (alias.startsWith("animation.") || alias.startsWith("controller.")) {
            throw new Error("Animation alias cannot start with animation. or controller.; the parameters may be backwards.");
        }

        return this.addResourceAlias(`${DESCRIPTION_PATH}/animations`, alias, animationId);
    }

    /**
     * Maps an animation controller resource id to a short alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineAnimationController(alias: string, controllerId: AttachableAnimationControllerId): this {
        return this.defineAnimation(alias, controllerId);
    }

    /**
     * Replaces the full `description.scripts` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setScripts(scripts: AttachableScriptsData): this {
        this.setValueAtPath(SCRIPTS_PATH, scripts);
        return this;
    }

    /**
     * Sets a single field inside `description.scripts`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setScriptProperty(key: string, value: unknown): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/${key}`, value);
        return this;
    }

    /**
     * Sets `description.scripts.parent_setup`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setParentSetup(molang: AttachableMolang): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/parent_setup`, molang);
        return this;
    }

    /**
     * Sets `description.scripts.pre_animation`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setPreAnimation(molang: AttachableMolang): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/pre_animation`, molang);
        return this;
    }

    /**
     * Sets `description.scripts.scale`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setScale(scale: AttachableMolang | number): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/scale`, scale.toString());
        return this;
    }

    /**
     * Adds an animation alias that always plays from `scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addAnimation(animationName: string): this;
    /**
     * Adds an animation alias that plays conditionally from `scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addAnimation(animationName: string, condition: AttachableMolang): this;
    addAnimation(animationName: string, condition?: AttachableMolang): this {
        if (animationName.startsWith("animation.") || animationName.startsWith("controller.")) {
            throw new Error("Use defineAnimation to map animation IDs. animationName must be the short alias.");
        }

        const animate = this.getValueAtPath<AttachableAnimateEntry[]>(`${SCRIPTS_PATH}/animate`, []);

        if (condition === undefined) {
            animate.push(animationName);
        }
        else {
            animate.push({ [animationName]: condition });
        }

        this.setValueAtPath(`${SCRIPTS_PATH}/animate`, animate);
        return this;
    }

    /**
     * Replaces `description.scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setAnimate(animate: AttachableAnimateEntry[]): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/animate`, animate);
        return this;
    }

    /**
     * Controls whether bones and effects update while offscreen.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setShouldUpdateBonesAndEffectsOffscreen(enabled = true): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/should_update_bones_and_effects_offscreen`, enabled);
        return this;
    }

    /**
     * Controls whether effects update while offscreen.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setShouldUpdateEffectsOffscreen(enabled = true): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/should_update_effects_offscreen`, enabled);
        return this;
    }

    /**
     * Replaces `description.render_controllers`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setRenderControllers(controllers: AttachableRenderControllerEntry[]): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/render_controllers`, controllers);
        return this;
    }

    /**
     * Adds a render controller that always applies.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addRenderController(controllerId: AttachableRenderControllerId): this;
    /**
     * Adds a render controller with a Molang condition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addRenderController(controllerId: AttachableRenderControllerId, condition: AttachableMolang): this;
    addRenderController(controllerId: AttachableRenderControllerId, condition?: AttachableMolang): this {
        const controllers = this.getValueAtPath<AttachableRenderControllerEntry[]>(
            `${DESCRIPTION_PATH}/render_controllers`,
            []
        );

        if (condition === undefined) {
            controllers.push(controllerId);
        }
        else {
            controllers.push({ [controllerId]: condition });
        }

        this.setValueAtPath(`${DESCRIPTION_PATH}/render_controllers`, controllers);
        return this;
    }

    /**
     * Adds `controller.render.default` to `description.render_controllers`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addDefaultRenderController(condition?: AttachableMolang): this {
        if (condition === undefined) {
            return this.addRenderController("controller.render.default");
        }

        return this.addRenderController("controller.render.default", condition);
    }

    /**
     * Adds `controller.render.armor` to `description.render_controllers`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    addArmorRenderController(condition?: AttachableMolang): this {
        if (condition === undefined) {
            return this.addRenderController("controller.render.armor");
        }

        return this.addRenderController("controller.render.armor", condition);
    }

    /**
     * Sets `description.enable_attachables`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setEnableAttachables(enabled = true): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/enable_attachables`, enabled);
        return this;
    }

    /**
     * Replaces the full `description.particle_effects` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setParticleEffects(particleEffects: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/particle_effects`, particleEffects);
        return this;
    }

    /**
     * Maps a particle effect id to an alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineParticle(alias: string, particleId: string): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/particle_effects`, alias, particleId);
    }

    /**
     * Alias for `defineParticle`, named after the documented field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineParticleEffect(alias: string, particleId: string): this {
        return this.defineParticle(alias, particleId);
    }

    /**
     * Replaces the full `description.sound_effects` map.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setSoundEffects(soundEffects: AttachableResourceMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/sound_effects`, soundEffects);
        return this;
    }

    /**
     * Maps a sound effect id to an alias.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineSound(alias: string, soundId: string): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/sound_effects`, alias, soundId);
    }

    /**
     * Alias for `defineSound`, named after the documented field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    defineSoundEffect(alias: string, soundId: string): this {
        return this.defineSound(alias, soundId);
    }

    /**
     * Sets `description.spawn_egg`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setSpawnEgg(spawnEgg: AttachableSpawnEggData): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/spawn_egg`, spawnEgg);
        return this;
    }

    /**
     * Sets the spawn egg texture and optional texture index.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/attachablereference/examples/attachabledefinitions/attachable
     */
    setSpawnEggTexture(texture: string, textureIndex?: number): this {
        const spawnEgg: AttachableSpawnEggData = {
            texture
        };

        if (textureIndex !== undefined) {
            spawnEgg.texture_index = textureIndex;
        }

        return this.setSpawnEgg(spawnEgg);
    }
}
