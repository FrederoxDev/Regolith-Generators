/**
 * Version string used by resource-pack animation JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_document
 */
export type AnimationFormatVersion = string;

/**
 * Namespaced animation identifier.
 */
export type AnimationIdentifier = `animation.${string}` | (string & {});

/**
 * String or numeric Molang value accepted by animation definitions.
 */
export type AnimationMolang = string | number;

/**
 * Three-dimensional vector whose values can be numbers or Molang expressions.
 */
export type AnimationVector3 = [AnimationMolang, AnimationMolang, AnimationMolang];

/**
 * Transform value accepted by animation channels.
 *
 * Scale can be a single value, a one-value array, or a three-value vector.
 * Position and rotation commonly use three-value vectors.
 */
export type AnimationTransformValue =
    | AnimationMolang
    | [AnimationMolang]
    | AnimationVector3;

/**
 * Interpolation mode for a keyframe.
 */
export type AnimationLerpMode = "linear" | "catmullrom" | (string & {});

/**
 * Keyframe object with separate pre/post values.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationsoverview#key-frames
 */
export interface AnimationKeyframeData {
    /**
     * Value used as time approaches this keyframe.
     */
    pre?: AnimationTransformValue;

    /**
     * Value used from this keyframe onward.
     */
    post?: AnimationTransformValue;

    /**
     * Interpolation mode.
     */
    lerp_mode?: AnimationLerpMode;

    /**
     * Future keyframe fields.
     */
    [key: string]: unknown;
}

/**
 * Keyed channel values by time in seconds.
 */
export type AnimationKeyframeMap = Record<string, AnimationTransformValue | AnimationKeyframeData>;

/**
 * Bone channel data for `position`, `rotation`, or `scale`.
 */
export type AnimationChannelData =
    | AnimationTransformValue
    | AnimationKeyframeMap
    | AnimationKeyframeData[];

/**
 * Relative transform settings for a bone.
 */
export interface AnimationBoneRelativeToData {
    /**
     * When set to `entity`, bone rotation is relative to the entity instead of
     * the bone's parent.
     */
    rotation?: "entity" | (string & {});

    /**
     * Future relative transform fields.
     */
    [key: string]: unknown;
}

/**
 * Animation data for one model bone.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0
 */
export interface AnimationBoneData {
    /**
     * Position channel.
     */
    position?: AnimationChannelData;

    /**
     * Rotation channel.
     */
    rotation?: AnimationChannelData;

    /**
     * Scale channel.
     */
    scale?: AnimationChannelData;

    /**
     * Relative transform settings.
     */
    relative_to?: AnimationBoneRelativeToData;

    /**
     * Future bone fields.
     */
    [key: string]: unknown;
}

/**
 * Loop setting for an animation.
 */
export type AnimationLoopMode = boolean | "hold_on_last_frame";

/**
 * Particle effect event fired by an animation timeline.
 */
export interface AnimationParticleEffectData {
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
    pre_effect_script?: string;

    /**
     * Future particle effect fields.
     */
    [key: string]: unknown;
}

/**
 * Sound effect event fired by an animation timeline.
 */
export interface AnimationSoundEffectData {
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
 * Timeline commands keyed by time in seconds.
 */
export type AnimationTimelineData = Record<string, string | string[]>;

/**
 * Particle effects keyed by time, or the array form accepted by the visual
 * reference schema.
 */
export type AnimationParticleEffectsData =
    | Record<string, AnimationParticleEffectData | AnimationParticleEffectData[]>
    | AnimationParticleEffectData[];

/**
 * Sound effects keyed by time, or the array form accepted by the visual
 * reference schema.
 */
export type AnimationSoundEffectsData =
    | Record<string, AnimationSoundEffectData | AnimationSoundEffectData[]>
    | AnimationSoundEffectData[];

/**
 * Single animation definition.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0
 */
export interface AnimationData {
    /**
     * How time advances while playing this animation.
     */
    anim_time_update?: AnimationMolang;

    /**
     * Molang blend weight for the animation.
     */
    blend_weight?: AnimationMolang;

    /**
     * Animation length in seconds.
     */
    animation_length?: number;

    /**
     * Whether this animation loops, stops, or holds on the last frame.
     */
    loop?: AnimationLoopMode;

    /**
     * Delay before a looping animation loops again.
     */
    loop_delay?: AnimationMolang;

    /**
     * Delay before the animation starts.
     */
    start_delay?: AnimationMolang;

    /**
     * Resets animated bones to their default pose before applying this
     * animation.
     */
    override_previous_animation?: boolean;

    /**
     * Bone animation channels.
     */
    bones?: Record<string, AnimationBoneData>;

    /**
     * Timeline Molang commands keyed by time.
     */
    timeline?: AnimationTimelineData;

    /**
     * Particle effects keyed by time or listed as event objects.
     */
    particle_effects?: AnimationParticleEffectsData;

    /**
     * Sound effects keyed by time or listed as event objects.
     */
    sound_effects?: AnimationSoundEffectsData;

    /**
     * Future animation fields.
     */
    [key: string]: unknown;
}

/**
 * Root animation document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_document
 */
export interface AnimationDocumentData {
    /**
     * File format version.
     */
    format_version: AnimationFormatVersion;

    /**
     * Dictionary of animation definitions.
     */
    animations: Record<string, AnimationData>;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}
