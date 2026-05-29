import { GeneratorFactory, GeneratorBase } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import {
    type ClientEntityAnimateEntry,
    type ClientEntityAnimationControllerId,
    type ClientEntityAnimationId,
    type ClientEntityLocatorMap,
    type ClientEntityLocatorOffset,
    type ClientEntityMolang,
    type ClientEntityPublicVariables,
    type ClientEntityRenderControllerEntry,
    type ClientEntityResourceMap,
    type ClientEntitySpawnEgg,
    type ClientEntityVersion,
    EntityMaterials
} from "./ClientEntityTypes.ts";

export * from "./ClientEntityTypes.ts";

const DESCRIPTION_PATH = "minecraft:client_entity/description";
const SCRIPTS_PATH = `${DESCRIPTION_PATH}/scripts`;

/**
 * Factory for generating resource pack client entity definition files.
 *
 * Client entity files describe rendering resources such as geometry, textures,
 * materials, animations, particles, render controllers, and spawn egg visuals.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export class ClientEntityGenerator extends GeneratorFactory<ClientEntityDef> {
    /**
     * Creates a client entity generator that writes into `RP/entity`.
     *
     * @param projectNamespace Namespace prepended to identifiers created by
     * `makeEntity`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/entity");
    }

    /**
     * Queues a new client entity definition for generation.
     *
     * @param id Entity id without the namespace.
     */
    makeEntity(id: string): ClientEntityDef {
        const def = new ClientEntityDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }

    /**
     * Writes queued client entity files as `{id}.entity.json`.
     */
    public override generate(): void {
        for (const [id, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${id}.entity.json`);
        }
    }
}

/**
 * Fluent builder for `minecraft:client_entity` resource definitions.
 *
 * The constructor creates a valid shell with `format_version` and
 * `description.identifier`; helper methods then fill the documented client
 * entity description fields.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
 */
export class ClientEntityDef extends GeneratorBase<ClientEntityDef> {
    data: Record<string, unknown>;

    /**
     * Creates a client entity definition.
     *
     * @param projectNamespace Namespace used in the generated entity identifier.
     * @param id Entity id without the namespace.
     */
    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.26.20",
            "minecraft:client_entity": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                }
            }
        };
    }

    private static toArray<T>(value: T | T[]): T[] {
        return Array.isArray(value) ? value : [value];
    }

    private static toMolang(value: ClientEntityMolang | number | boolean): ClientEntityMolang {
        if (typeof value === "boolean") {
            return value ? "1.0" : "0.0";
        }

        return value.toString();
    }

    private addResourceAlias(path: string, alias: string, value: string): this {
        const existing = this.getValueAtPath<ClientEntityResourceMap>(path, {});
        existing[alias] = value;
        this.setValueAtPath(path, existing);
        return this;
    }

    private addScriptLines(path: string, molang: ClientEntityMolang | ClientEntityMolang[]): this {
        const existing = this.getValueAtPath<ClientEntityMolang[]>(path, []);
        existing.push(...ClientEntityDef.toArray(molang));
        this.setValueAtPath(path, existing);
        return this;
    }

    /**
     * Sets the root `format_version` for this client entity file.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setFormatVersion(version: ClientEntityVersion): this {
        this.setValueAtPath("format_version", version);
        return this;
    }

    /**
     * Replaces the fully-qualified client entity identifier.
     *
     * The default identifier is created from the generator namespace and id.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#identifier
     */
    setIdentifier(identifier: string): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/identifier`, identifier);
        return this;
    }

    /**
     * Sets the minimum engine version used to choose between duplicate client
     * entity definitions with the same identifier.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#min_engine_version
     */
    setMinEngineVersion(version: ClientEntityVersion): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/min_engine_version`, version);
        return this;
    }

    /**
     * Adds or replaces a geometry alias in `description.geometry`.
     *
     * Aliases are referenced by render controllers and other client-side
     * resources.
     *
     * @param geometryID Geometry identifier such as `geometry.example`.
     * @param as Alias used inside the client entity definition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#materials-textures-animations
     */
    addGeometry(geometryID: string, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/geometry`, as, geometryID);
    }

    /**
     * Sets the optional queryable geometry identifier.
     *
     * Queryable geometry exposes named geometry data for client-side queries.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setQueryableGeometry(geometryID: string): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/queryable_geometry`, geometryID);
        return this;
    }

    /**
     * Adds or replaces a texture alias in `description.textures`.
     *
     * @param texturePath Texture path without the `.png` extension.
     * @param as Alias used inside the client entity definition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#materials-textures-animations
     */
    addTexture(texturePath: string, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/textures`, as, texturePath);
    }

    /**
     * Adds or replaces a material alias in `description.materials`.
     *
     * @param material Built-in material id or a custom material id.
     * @param as Alias used inside the client entity definition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#materials-textures-animations
     */
    addMaterial(material: EntityMaterials | string, as = "default"): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/materials`, as, material);
    }

    /**
     * Adds `controller.render.default` to `description.render_controllers`.
     *
     * @param condition Optional Molang condition for conditional render
     * controller selection.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addDefaultRenderController(condition?: ClientEntityMolang): this {
        if (condition === undefined) {
            return this.addRenderController("controller.render.default");
        }

        return this.addRenderController("controller.render.default", condition);
    }

    /**
     * Adds a render controller that always applies.
     *
     * @param controllerId Render controller identifier.
     */
    addRenderController(controllerId: string): this;

    /**
     * Adds a render controller with a Molang condition.
     *
     * @param controllerId Render controller identifier.
     * @param condition Molang expression that enables the render controller.
     */
    addRenderController(controllerId: string, condition: ClientEntityMolang): this;

    /**
     * Adds a render controller entry to `description.render_controllers`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addRenderController(controllerId: string, condition?: ClientEntityMolang): this {
        const controllers = this.getValueAtPath<ClientEntityRenderControllerEntry[]>(
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
     * Maps an animation or animation controller resource id to a short alias.
     *
     * Use the alias with `addAnimation` or in animation controller files.
     *
     * @param alias Short animation name used by the client entity.
     * @param animId Full animation or animation controller identifier.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#animations
     */
    defineAnimation(alias: string, animId: ClientEntityAnimationId | ClientEntityAnimationControllerId): this {
        if (alias.startsWith("animation.") || alias.startsWith("controller.")) {
            throw new Error("Animation alias cannot start with animation. or controller.; the parameters may be backwards.");
        }

        return this.addResourceAlias(`${DESCRIPTION_PATH}/animations`, alias, animId);
    }

    /**
     * Maps an animation controller resource id to a short alias in
     * `description.animations`.
     *
     * Modern client entity files reference animation controllers through the
     * animations map, then play the alias from `scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    defineAnimationController(alias: string, controllerId: ClientEntityAnimationControllerId): this {
        return this.defineAnimation(alias, controllerId);
    }

    /**
     * Maps a particle effect id to an alias in `description.particle_effects`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#particle
     */
    defineParticle(alias: string, particleId: string): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/particle_effects`, alias, particleId);
    }

    /**
     * Alias for `defineParticle`, named after the documented field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    defineParticleEffect(alias: string, particleId: string): this {
        return this.defineParticle(alias, particleId);
    }

    /**
     * Maps a particle emitter id to an alias in `description.particle_emitters`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addParticleEmitter(alias: string, emitterId: string): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/particle_emitters`, alias, emitterId);
    }

    /**
     * Alias for `addParticleEmitter`, matching the existing `define*` resource
     * naming style used by this generator.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    defineParticleEmitter(alias: string, emitterId: string): this {
        return this.addParticleEmitter(alias, emitterId);
    }

    /**
     * Maps a sound effect id to an alias in `description.sound_effects`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    defineSound(alias: string, soundId: string): this {
        return this.addResourceAlias(`${DESCRIPTION_PATH}/sound_effects`, alias, soundId);
    }

    /**
     * Alias for `defineSound`, named after the documented field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    defineSoundEffect(alias: string, soundId: string): this {
        return this.defineSound(alias, soundId);
    }

    /**
     * Adds an animation alias that always plays from `scripts.animate`.
     *
     * @param animName Animation alias previously registered with
     * `defineAnimation` or `defineAnimationController`.
     */
    addAnimation(animName: string): this;

    /**
     * Adds an animation alias that plays conditionally from `scripts.animate`.
     *
     * @param animName Animation alias previously registered with
     * `defineAnimation` or `defineAnimationController`.
     * @param condition Molang expression that enables the animation.
     */
    addAnimation(animName: string, condition: ClientEntityMolang): this;

    /**
     * Adds an entry to `description.scripts.animate`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addAnimation(animName: string, condition?: ClientEntityMolang): this {
        if (animName.startsWith("animation.")) {
            throw new Error("Use defineAnimation to map animation IDs. animName must be the short alias.");
        }

        const animateFields = this.getValueAtPath<ClientEntityAnimateEntry[]>(`${SCRIPTS_PATH}/animate`, []);

        if (condition === undefined) {
            animateFields.push(animName);
        }
        else {
            animateFields.push({ [animName]: condition });
        }

        this.setValueAtPath(`${SCRIPTS_PATH}/animate`, animateFields);
        return this;
    }

    /**
     * Adds one or more Molang expressions to `description.scripts.initialize`.
     *
     * Initialize scripts run before normal animation processing.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addInitialize(molang: ClientEntityMolang | ClientEntityMolang[]): this {
        return this.addScriptLines(`${SCRIPTS_PATH}/initialize`, molang);
    }

    /**
     * Adds one or more Molang expressions to `description.scripts.pre_animation`.
     *
     * Pre-animation scripts are evaluated immediately before animations are
     * processed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#scripts
     */
    addPreAnimation(molang: ClientEntityMolang | ClientEntityMolang[]): this {
        return this.addScriptLines(`${SCRIPTS_PATH}/pre_animation`, molang);
    }

    /**
     * Declares a public client-side Molang variable.
     *
     * Public variables can be read by other mobs through Molang's arrow
     * operator. Pass either `foo` or `variable.foo`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    addPublicVariable(variableName: string): this {
        const variableId = variableName.startsWith("variable.") ? variableName : `variable.${variableName}`;

        if (!/^variable\.[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableId)) {
            throw new Error(`Invalid public variable name: ${variableName}`);
        }

        const variables = this.getValueAtPath<ClientEntityPublicVariables>(`${SCRIPTS_PATH}/variables`, {});
        variables[variableId as `variable.${string}`] = "public";
        this.setValueAtPath(`${SCRIPTS_PATH}/variables`, variables);
        return this;
    }

    /**
     * Sets the Molang expression used to scale the entity model uniformly.
     *
     * This client-side scale affects rendering, not the server collision box.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#scripts
     */
    setScale(scale: ClientEntityMolang | number): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/scale`, ClientEntityDef.toMolang(scale));
        return this;
    }

    /**
     * Sets the Molang expression used to scale the entity model on the X axis.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setScaleX(scale: ClientEntityMolang | number): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/scaleX`, ClientEntityDef.toMolang(scale));
        return this;
    }

    /**
     * Sets the Molang expression used to scale the entity model on the Y axis.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setScaleY(scale: ClientEntityMolang | number): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/scaleY`, ClientEntityDef.toMolang(scale));
        return this;
    }

    /**
     * Sets the Molang expression used to scale the entity model on the Z axis.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setScaleZ(scale: ClientEntityMolang | number): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/scaleZ`, ClientEntityDef.toMolang(scale));
        return this;
    }

    /**
     * Sets the `description.scripts.parent_setup` Molang expression.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setParentSetup(molang: ClientEntityMolang): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/parent_setup`, molang);
        return this;
    }

    /**
     * Keeps bones and effects updating while the entity is off screen when the
     * expression returns a non-zero value.
     *
     * Pass a boolean for a constant expression.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setShouldUpdateBonesAndEffectsOffscreen(value: ClientEntityMolang | boolean): this {
        this.setValueAtPath(
            `${SCRIPTS_PATH}/should_update_bones_and_effects_offscreen`,
            ClientEntityDef.toMolang(value)
        );
        return this;
    }

    /**
     * Keeps effects updating while the entity is off screen when the expression
     * returns a non-zero value.
     *
     * Pass a boolean for a constant expression.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setShouldUpdateEffectsOffscreen(value: ClientEntityMolang | boolean): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/should_update_effects_offscreen`, ClientEntityDef.toMolang(value));
        return this;
    }

    /**
     * Hides items held by the entity when the expression returns a non-zero
     * value.
     *
     * This script setting overrides attachable rendering for held items.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_resource_definition.v1.26.0
     */
    setHideHeldItems(value: ClientEntityMolang | boolean): this {
        this.setValueAtPath(`${SCRIPTS_PATH}/hide_held_items`, ClientEntityDef.toMolang(value));
        return this;
    }

    /**
     * Enables rendering attachables such as armor and weapons for this entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#enable_attachables
     */
    setEnableAttachables(enabled = true): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/enable_attachables`, enabled);
        return this;
    }

    /**
     * Controls whether held items render fully lit instead of using surrounding
     * lighting.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#held_item_ignores_lighting
     */
    setHeldItemIgnoresLighting(enabled = true): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/held_item_ignores_lighting`, enabled);
        return this;
    }

    /**
     * Hides armor attached to this entity.
     *
     * This setting overrides armor rendering from `enable_attachables`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#hide_armor
     */
    setHideArmor(hidden = true): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/hide_armor`, hidden);
        return this;
    }

    /**
     * Sets `description.spawn_egg` directly.
     *
     * Use `setSpawnEggColors` or `setSpawnEggTexture` for the common forms.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#spawn-egg
     */
    setSpawnEgg(spawnEgg: ClientEntitySpawnEgg): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/spawn_egg`, { ...spawnEgg });
        return this;
    }

    /**
     * Sets the spawn egg colors using hex color strings.
     *
     * @param baseColor Base spawn egg color, such as `#53443E`.
     * @param overlayColor Overlay spawn egg color, such as `#2E6854`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#spawn-egg
     */
    setSpawnEggColors(baseColor: string, overlayColor: string): this {
        return this.setSpawnEgg({
            "base_color": baseColor,
            "overlay_color": overlayColor
        });
    }

    /**
     * Sets the spawn egg texture key and optional texture variant index.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#spawn-egg
     */
    setSpawnEggTexture(texture: string, textureIndex?: number): this {
        const spawnEgg: ClientEntitySpawnEgg = {
            "texture": texture
        };

        if (textureIndex !== undefined) {
            spawnEgg.texture_index = textureIndex;
        }

        return this.setSpawnEgg(spawnEgg);
    }

    /**
     * Sets all description locators at once.
     *
     * Locator offsets are specified in model space and are keyed by locator name
     * and then by bone name.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#locators
     */
    setLocators(locators: ClientEntityLocatorMap): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/locators`, locators);
        return this;
    }

    /**
     * Adds or replaces a single description locator offset.
     *
     * @param locatorName Locator name such as `lead`.
     * @param boneName Bone that owns the locator offset.
     * @param offset Model-space offset.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction#locators
     */
    addLocator(locatorName: string, boneName: string, offset: ClientEntityLocatorOffset): this {
        this.setValueAtPath(`${DESCRIPTION_PATH}/locators/${locatorName}/${boneName}`, offset);
        return this;
    }
}
