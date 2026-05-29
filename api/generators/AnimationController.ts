import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type AnimationControllerAnimationEntry,
    type AnimationControllerAnimationsData,
    type AnimationControllerData,
    type AnimationControllerDocumentData,
    type AnimationControllerFormatVersion,
    type AnimationControllerIdentifier,
    type AnimationControllerMolang,
    type AnimationControllerParticleEffectData,
    type AnimationControllerSoundEffectData,
    type AnimationControllerStateData,
    type AnimationControllerTransitionEntry,
    type AnimationControllerVariableData
} from "./AnimationControllerTypes.ts";

export * from "./AnimationControllerTypes.ts";

const DEFAULT_ANIMATION_CONTROLLER_FORMAT_VERSION: AnimationControllerFormatVersion = "1.17.30";

function qualifyControllerIdentifier(projectNamespace: string, id: string): AnimationControllerIdentifier {
    return id.startsWith("controller.animation.")
        ? id
        : `controller.animation.${projectNamespace}.${id}`;
}

/**
 * Factory for resource-pack animation controller files.
 *
 * Generated files are written under `RP/animation_controllers`. A single
 * generator instance writes one animation controller document containing all
 * controllers queued through `makeController`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationcontroller
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_controller_document
 */
export class AnimationControllerGenerator extends GeneratorFactory<AnimationControllerDef> {
    fileName: string;
    formatVersion: AnimationControllerFormatVersion;

    /**
     * Creates an animation controller generator.
     */
    constructor(
        projectNamespace: string,
        fileName = "animation_controllers",
        formatVersion: AnimationControllerFormatVersion = DEFAULT_ANIMATION_CONTROLLER_FORMAT_VERSION
    ) {
        super(projectNamespace, "RP/animation_controllers");
        this.fileName = fileName;
        this.formatVersion = formatVersion;
    }

    /**
     * Sets the root document `format_version`.
     */
    setFormatVersion(version: AnimationControllerFormatVersion): this {
        this.formatVersion = version;
        return this;
    }

    /**
     * Queues an animation controller.
     *
     * If `id` does not start with `controller.animation.`, the generated
     * identifier is `controller.animation.<projectNamespace>.<id>`.
     */
    makeController(id: string): AnimationControllerDef {
        const identifier = qualifyControllerIdentifier(this.projectNamespace, id);
        const def = new AnimationControllerDef(identifier);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues an animation controller for an already-qualified identifier.
     */
    makeControllerForIdentifier(identifier: AnimationControllerIdentifier): AnimationControllerDef {
        const def = new AnimationControllerDef(identifier);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Writes the queued animation controller document.
     */
    public override generate(): void {
        const data: AnimationControllerDocumentData = {
            "format_version": this.formatVersion,
            "animation_controllers": {}
        };

        for (const def of this.filesToGenerate.values()) {
            data.animation_controllers[def.identifier] = def.toJson() as AnimationControllerData;
        }

        createFile(JSON.stringify(data, null, 2), `${this.exportFolder}/${this.fileName}.controller.json`);
    }
}

/**
 * Base fluent builder for one animation controller definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation_controller.v1.10.0
 */
export class AnimationControllerBase<TSelf extends AnimationControllerBase<TSelf>> extends GeneratorBase<TSelf> {
    data: AnimationControllerData;
    identifier: AnimationControllerIdentifier;

    /**
     * Creates an animation controller definition.
     */
    constructor(identifier: AnimationControllerIdentifier) {
        super();

        this.identifier = identifier;
        this.data = {
            "states": {}
        };
    }

    private statePath(stateName: string, path: string = ""): string {
        return `states/${stateName}${path.length === 0 ? "" : `/${path}`}`;
    }

    /**
     * Sets the controller `initial_state`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_controller_document
     */
    setInitialState(state: string): this {
        this.setValueAtPath("initial_state", state);
        return this;
    }

    /**
     * Replaces the full `states` object.
     */
    setStates(states: Record<string, AnimationControllerStateData>): this {
        this.setValueAtPath("states", states);
        return this;
    }

    /**
     * Adds or replaces one state.
     */
    addState(name: string, data: AnimationControllerStateData = {}): this {
        this.setValueAtPath(this.statePath(name), data);
        return this;
    }

    /**
     * Sets a field inside one state.
     */
    setStateProperty(stateName: string, key: string, value: unknown): this {
        this.setValueAtPath(this.statePath(stateName, key), value);
        return this;
    }

    /**
     * Replaces one state's `animations` field.
     */
    setStateAnimations(stateName: string, animations: AnimationControllerAnimationsData): this {
        this.setValueAtPath(this.statePath(stateName, "animations"), animations);
        return this;
    }

    /**
     * Adds an animation alias that always plays in one state.
     */
    addStateAnimation(stateName: string, animationName: string): this;
    /**
     * Adds an animation alias with a Molang blend condition in one state.
     */
    addStateAnimation(stateName: string, animationName: string, condition: AnimationControllerMolang): this;
    addStateAnimation(stateName: string, animationName: string, condition?: AnimationControllerMolang): this {
        const animations = this.getValueAtPath<AnimationControllerAnimationEntry[]>(
            this.statePath(stateName, "animations"),
            []
        );

        if (condition === undefined) {
            animations.push(animationName);
        }
        else {
            animations.push({ [animationName]: condition });
        }

        this.setValueAtPath(this.statePath(stateName, "animations"), animations);
        return this;
    }

    /**
     * Replaces one state's `transitions` field.
     */
    setStateTransitions(stateName: string, transitions: AnimationControllerTransitionEntry[]): this {
        this.setValueAtPath(this.statePath(stateName, "transitions"), transitions);
        return this;
    }

    /**
     * Adds a transition to another state.
     */
    addStateTransition(stateName: string, targetState: string, condition: AnimationControllerMolang): this {
        const transitions = this.getValueAtPath<AnimationControllerTransitionEntry[]>(
            this.statePath(stateName, "transitions"),
            []
        );
        transitions.push({ [targetState]: condition });
        this.setValueAtPath(this.statePath(stateName, "transitions"), transitions);
        return this;
    }

    /**
     * Sets one state's `blend_transition` cross-fade time.
     */
    setStateBlendTransition(stateName: string, seconds: number | AnimationControllerMolang): this {
        this.setValueAtPath(this.statePath(stateName, "blend_transition"), seconds);
        return this;
    }

    /**
     * Sets one state's `blend_via_shortest_path` flag.
     */
    setStateBlendViaShortestPath(stateName: string, enabled = true): this {
        this.setValueAtPath(this.statePath(stateName, "blend_via_shortest_path"), enabled);
        return this;
    }

    /**
     * Replaces one state's `on_entry` scripts.
     */
    setStateOnEntry(stateName: string, scripts: AnimationControllerMolang[]): this {
        this.setValueAtPath(this.statePath(stateName, "on_entry"), scripts);
        return this;
    }

    /**
     * Adds a Molang script to one state's `on_entry`.
     */
    addStateOnEntry(stateName: string, script: AnimationControllerMolang): this {
        const scripts = this.getValueAtPath<AnimationControllerMolang[]>(this.statePath(stateName, "on_entry"), []);
        scripts.push(script);
        this.setValueAtPath(this.statePath(stateName, "on_entry"), scripts);
        return this;
    }

    /**
     * Replaces one state's `on_exit` scripts.
     */
    setStateOnExit(stateName: string, scripts: AnimationControllerMolang[]): this {
        this.setValueAtPath(this.statePath(stateName, "on_exit"), scripts);
        return this;
    }

    /**
     * Adds a Molang script to one state's `on_exit`.
     */
    addStateOnExit(stateName: string, script: AnimationControllerMolang): this {
        const scripts = this.getValueAtPath<AnimationControllerMolang[]>(this.statePath(stateName, "on_exit"), []);
        scripts.push(script);
        this.setValueAtPath(this.statePath(stateName, "on_exit"), scripts);
        return this;
    }

    /**
     * Replaces one state's `particle_effects`.
     */
    setStateParticleEffects(stateName: string, effects: (AnimationControllerParticleEffectData | string)[]): this {
        this.setValueAtPath(this.statePath(stateName, "particle_effects"), effects);
        return this;
    }

    /**
     * Adds a particle effect to one state.
     */
    addStateParticleEffect(stateName: string, data: AnimationControllerParticleEffectData): this;
    addStateParticleEffect(
        stateName: string,
        effect: string,
        locator?: string,
        bindToActor?: boolean,
        preEffectScript?: AnimationControllerMolang
    ): this;
    addStateParticleEffect(
        stateName: string,
        dataOrEffect: AnimationControllerParticleEffectData | string,
        locator?: string,
        bindToActor?: boolean,
        preEffectScript?: AnimationControllerMolang
    ): this {
        const effects = this.getValueAtPath<(AnimationControllerParticleEffectData | string)[]>(
            this.statePath(stateName, "particle_effects"),
            []
        );
        const data = typeof dataOrEffect === "string"
            ? {
                effect: dataOrEffect,
                locator,
                bind_to_actor: bindToActor,
                pre_effect_script: preEffectScript
            }
            : dataOrEffect;

        effects.push(data);
        this.setValueAtPath(this.statePath(stateName, "particle_effects"), effects);
        return this;
    }

    /**
     * Replaces one state's `sound_effects`.
     */
    setStateSoundEffects(stateName: string, effects: (AnimationControllerSoundEffectData | string)[]): this {
        this.setValueAtPath(this.statePath(stateName, "sound_effects"), effects);
        return this;
    }

    /**
     * Adds a sound effect to one state.
     */
    addStateSoundEffect(stateName: string, data: AnimationControllerSoundEffectData): this;
    addStateSoundEffect(stateName: string, effect: string, locator?: string): this;
    addStateSoundEffect(
        stateName: string,
        dataOrEffect: AnimationControllerSoundEffectData | string,
        locator?: string
    ): this {
        const effects = this.getValueAtPath<(AnimationControllerSoundEffectData | string)[]>(
            this.statePath(stateName, "sound_effects"),
            []
        );
        const data = typeof dataOrEffect === "string"
            ? {
                effect: dataOrEffect,
                locator
            }
            : dataOrEffect;

        effects.push(data);
        this.setValueAtPath(this.statePath(stateName, "sound_effects"), effects);
        return this;
    }

    /**
     * Replaces one state's `variables` object.
     */
    setStateVariables(stateName: string, variables: Record<string, AnimationControllerVariableData>): this {
        this.setValueAtPath(this.statePath(stateName, "variables"), variables);
        return this;
    }

    /**
     * Adds or replaces one state variable.
     */
    addStateVariable(
        stateName: string,
        variableName: string,
        input: AnimationControllerMolang,
        remapCurve?: AnimationControllerVariableData["remap_curve"]
    ): this {
        const variables = this.getValueAtPath<Record<string, AnimationControllerVariableData>>(
            this.statePath(stateName, "variables"),
            {}
        );
        variables[variableName] = {
            input,
            ...(remapCurve === undefined ? {} : { remap_curve: remapCurve })
        };
        this.setValueAtPath(this.statePath(stateName, "variables"), variables);
        return this;
    }
}

/**
 * Fluent builder for one animation controller definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation_controller.v1.10.0
 */
export class AnimationControllerDef extends AnimationControllerBase<AnimationControllerDef> {
    /**
     * Creates an animation controller definition.
     */
    constructor(identifier: AnimationControllerIdentifier) {
        super(identifier);
    }
}
