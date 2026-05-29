/**
 * Version string used by resource-pack animation controller JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_controller_document
 */
export type AnimationControllerFormatVersion = string;

/**
 * Namespaced animation controller identifier.
 */
export type AnimationControllerIdentifier = `controller.animation.${string}` | (string & {});

/**
 * Molang expression used by animation controllers.
 */
export type AnimationControllerMolang = string;

/**
 * Animation entry accepted by a controller state.
 *
 * A string always plays the named animation alias. An object maps an animation
 * alias to a Molang blend condition.
 */
export type AnimationControllerAnimationEntry = string | Record<string, AnimationControllerMolang>;

/**
 * The state `animations` field. The visual reference also allows a direct
 * Molang expression.
 */
export type AnimationControllerAnimationsData =
    | AnimationControllerAnimationEntry[]
    | AnimationControllerMolang;

/**
 * Transition entry accepted by a controller state.
 */
export type AnimationControllerTransitionEntry = string | Record<string, AnimationControllerMolang>;

/**
 * Particle effect event in a controller state.
 */
export interface AnimationControllerParticleEffectData {
    /**
     * Particle effect alias from the client entity or attachable resource
     * definition.
     */
    effect: string;

    /**
     * Locator where the effect should play.
     */
    locator?: string;

    /**
     * Set to false to spawn the effect in the world instead of binding it to
     * the actor.
     */
    bind_to_actor?: boolean;

    /**
     * Molang script run when the particle emitter initializes.
     */
    pre_effect_script?: AnimationControllerMolang;

    /**
     * Future particle effect fields.
     */
    [key: string]: unknown;
}

/**
 * Sound effect event in a controller state.
 */
export interface AnimationControllerSoundEffectData {
    /**
     * Sound effect alias from the client entity or attachable resource
     * definition.
     */
    effect: string;

    /**
     * Locator where the sound should originate.
     */
    locator?: string;

    /**
     * Future sound effect fields.
     */
    [key: string]: unknown;
}

/**
 * Variable remap curve keyed by input value.
 */
export type AnimationControllerRemapCurve = Record<string, number | AnimationControllerMolang>;

/**
 * State variable definition.
 */
export interface AnimationControllerVariableData {
    /**
     * Input Molang expression.
     */
    input: AnimationControllerMolang;

    /**
     * Linear remap curve for the input.
     */
    remap_curve?: AnimationControllerRemapCurve;

    /**
     * Future variable fields.
     */
    [key: string]: unknown;
}

/**
 * State data in an animation controller.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation_controller.v1.10.0
 */
export interface AnimationControllerStateData {
    /**
     * Animations or animation controllers to process in this state.
     */
    animations?: AnimationControllerAnimationsData;

    /**
     * Ordered transitions to evaluate each frame.
     */
    transitions?: AnimationControllerTransitionEntry[];

    /**
     * Cross-fade time when transitioning away from this state.
     */
    blend_transition?: number | AnimationControllerMolang;

    /**
     * Blend euler axes through the shortest rotation path.
     */
    blend_via_shortest_path?: boolean;

    /**
     * Molang scripts run when entering this state.
     */
    on_entry?: AnimationControllerMolang[];

    /**
     * Molang scripts run when exiting this state.
     */
    on_exit?: AnimationControllerMolang[];

    /**
     * Particle effects triggered on entry to this state.
     */
    particle_effects?: (AnimationControllerParticleEffectData | string)[];

    /**
     * Sound effects triggered on entry to this state.
     */
    sound_effects?: (AnimationControllerSoundEffectData | string)[];

    /**
     * Variables available while processing this state.
     */
    variables?: Record<string, AnimationControllerVariableData>;

    /**
     * Future state fields.
     */
    [key: string]: unknown;
}

/**
 * Single animation controller definition.
 */
export interface AnimationControllerData {
    /**
     * Initial state name.
     */
    initial_state?: string;

    /**
     * State machine states.
     */
    states: Record<string, AnimationControllerStateData>;

    /**
     * Future controller fields.
     */
    [key: string]: unknown;
}

/**
 * Root animation controller document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_controller_document
 */
export interface AnimationControllerDocumentData {
    /**
     * File format version.
     */
    format_version: AnimationControllerFormatVersion;

    /**
     * Dictionary of animation controller definitions.
     */
    animation_controllers: Record<string, AnimationControllerData>;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}
