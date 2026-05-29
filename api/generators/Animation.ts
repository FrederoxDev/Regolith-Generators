import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type AnimationBoneData,
    type AnimationChannelData,
    type AnimationData,
    type AnimationDocumentData,
    type AnimationFormatVersion,
    type AnimationIdentifier,
    type AnimationKeyframeData,
    type AnimationLoopMode,
    type AnimationMolang,
    type AnimationParticleEffectData,
    type AnimationParticleEffectsData,
    type AnimationSoundEffectData,
    type AnimationSoundEffectsData,
    type AnimationTimelineData
} from "./AnimationTypes.ts";

export * from "./AnimationTypes.ts";

const DEFAULT_ANIMATION_FORMAT_VERSION: AnimationFormatVersion = "1.8.0";

function qualifyAnimationIdentifier(projectNamespace: string, id: string): AnimationIdentifier {
    return id.startsWith("animation.") ? id : `animation.${projectNamespace}.${id}`;
}

/**
 * Factory for resource-pack animation files.
 *
 * Generated files are written under `RP/animations` as one animation document
 * per queued animation.
 *
 * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationsoverview
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_document
 */
export class AnimationGenerator extends GeneratorFactory<AnimationDef> {
    /**
     * Creates an animation generator that writes into `RP/animations`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/animations");
    }

    /**
     * Queues an animation definition.
     *
     * If `id` does not start with `animation.`, the generated identifier is
     * `animation.<projectNamespace>.<id>`.
     */
    makeAnimation(
        id: string,
        formatVersion: AnimationFormatVersion = DEFAULT_ANIMATION_FORMAT_VERSION
    ): AnimationDef {
        const identifier = qualifyAnimationIdentifier(this.projectNamespace, id);
        const def = new AnimationDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues an animation definition for an already-qualified identifier.
     */
    makeAnimationForIdentifier(
        identifier: AnimationIdentifier,
        formatVersion: AnimationFormatVersion = DEFAULT_ANIMATION_FORMAT_VERSION
    ): AnimationDef {
        const def = new AnimationDef(identifier, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Writes queued animation files as `{id}.animation.json`.
     */
    public override generate(): void {
        for (const [id, def] of this.filesToGenerate) {
            createFile(def.toString(), `${this.exportFolder}/${id}.animation.json`);
        }
    }
}

/**
 * Fluent builder for a resource-pack animation JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation.v1.8.0
 */
export class AnimationDef extends GeneratorBase<AnimationDef> {
    data: AnimationDocumentData;
    identifier: AnimationIdentifier;

    /**
     * Creates an animation definition.
     */
    constructor(
        identifier: AnimationIdentifier,
        formatVersion: AnimationFormatVersion = DEFAULT_ANIMATION_FORMAT_VERSION
    ) {
        super();

        this.identifier = identifier;
        this.data = {
            "format_version": formatVersion,
            "animations": {
                [identifier]: {}
            }
        };
    }

    private animationPath(path: string = ""): string {
        return `animations/${this.identifier}${path.length === 0 ? "" : `/${path}`}`;
    }

    private bonePath(boneName: string, path: string = ""): string {
        return this.animationPath(`bones/${boneName}${path.length === 0 ? "" : `/${path}`}`);
    }

    /**
     * Sets the root `format_version`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/animationsreference/examples/animationdefinitions/animation_document
     */
    setFormatVersion(version: AnimationFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the animation data object.
     */
    setAnimation(data: AnimationData): this {
        this.setValueAtPath(this.animationPath(), data);
        return this;
    }

    /**
     * Sets a field inside this animation definition.
     */
    setAnimationProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.animationPath(key), value);
        return this;
    }

    /**
     * Sets how time advances while this animation plays.
     */
    setAnimTimeUpdate(expression: AnimationMolang): this {
        this.setValueAtPath(this.animationPath("anim_time_update"), expression);
        return this;
    }

    /**
     * Sets the animation blend weight.
     */
    setBlendWeight(expression: AnimationMolang): this {
        this.setValueAtPath(this.animationPath("blend_weight"), expression);
        return this;
    }

    /**
     * Sets the animation length in seconds.
     */
    setAnimationLength(length: number): this {
        this.setValueAtPath(this.animationPath("animation_length"), length);
        return this;
    }

    /**
     * Sets whether this animation loops, stops, or holds on the last frame.
     */
    setLoop(loop: AnimationLoopMode = true): this {
        this.setValueAtPath(this.animationPath("loop"), loop);
        return this;
    }

    /**
     * Sets this animation to hold on the last frame when it finishes.
     */
    holdOnLastFrame(): this {
        return this.setLoop("hold_on_last_frame");
    }

    /**
     * Sets the delay before a looping animation loops again.
     */
    setLoopDelay(delay: AnimationMolang): this {
        this.setValueAtPath(this.animationPath("loop_delay"), delay);
        return this;
    }

    /**
     * Sets the delay before the animation starts.
     */
    setStartDelay(delay: AnimationMolang): this {
        this.setValueAtPath(this.animationPath("start_delay"), delay);
        return this;
    }

    /**
     * Controls whether this animation resets animated bones to their default
     * pose before applying its channels.
     */
    setOverridePreviousAnimation(override = true): this {
        this.setValueAtPath(this.animationPath("override_previous_animation"), override);
        return this;
    }

    /**
     * Replaces the full `bones` object.
     */
    setBones(bones: Record<string, AnimationBoneData>): this {
        this.setValueAtPath(this.animationPath("bones"), bones);
        return this;
    }

    /**
     * Adds or replaces one bone animation.
     */
    addBone(boneName: string, data: AnimationBoneData): this {
        this.setValueAtPath(this.bonePath(boneName), data);
        return this;
    }

    /**
     * Sets one field on a bone animation.
     */
    setBoneProperty(boneName: string, key: string, value: unknown): this {
        this.setValueAtPath(this.bonePath(boneName, key), value);
        return this;
    }

    /**
     * Sets the position channel for one bone.
     */
    setBonePosition(boneName: string, position: AnimationChannelData): this {
        this.setValueAtPath(this.bonePath(boneName, "position"), position);
        return this;
    }

    /**
     * Sets the rotation channel for one bone.
     */
    setBoneRotation(boneName: string, rotation: AnimationChannelData): this {
        this.setValueAtPath(this.bonePath(boneName, "rotation"), rotation);
        return this;
    }

    /**
     * Sets the scale channel for one bone.
     */
    setBoneScale(boneName: string, scale: AnimationChannelData): this {
        this.setValueAtPath(this.bonePath(boneName, "scale"), scale);
        return this;
    }

    /**
     * Makes one bone's rotation relative to the entity instead of its parent.
     */
    setBoneRotationRelativeToEntity(boneName: string): this {
        this.setValueAtPath(this.bonePath(boneName, "relative_to/rotation"), "entity");
        return this;
    }

    /**
     * Adds or replaces a keyframe on a bone channel.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/animations/animationsoverview#key-frames
     */
    addKeyframe(
        boneName: string,
        channel: "position" | "rotation" | "scale",
        time: number | string,
        value: AnimationChannelData | AnimationKeyframeData
    ): this {
        this.setValueAtPath(this.bonePath(boneName, `${channel}/${time}`), value);
        return this;
    }

    /**
     * Replaces the animation `timeline` object.
     */
    setTimeline(timeline: AnimationTimelineData): this {
        this.setValueAtPath(this.animationPath("timeline"), timeline);
        return this;
    }

    /**
     * Adds a timeline Molang command or command list at a time in seconds.
     */
    addTimelineEvent(time: number | string, event: string | string[]): this {
        this.setValueAtPath(this.animationPath(`timeline/${time}`), event);
        return this;
    }

    /**
     * Replaces `particle_effects`.
     */
    setParticleEffects(particleEffects: AnimationParticleEffectsData): this {
        this.setValueAtPath(this.animationPath("particle_effects"), particleEffects);
        return this;
    }

    /**
     * Adds a particle effect at a time in seconds.
     */
    addParticleEffect(time: number | string, data: AnimationParticleEffectData): this;
    addParticleEffect(
        time: number | string,
        effect: string,
        locator?: string,
        bindToActor?: boolean,
        preEffectScript?: string
    ): this;
    addParticleEffect(
        time: number | string,
        dataOrEffect: AnimationParticleEffectData | string,
        locator?: string,
        bindToActor?: boolean,
        preEffectScript?: string
    ): this {
        const data = typeof dataOrEffect === "string"
            ? {
                effect: dataOrEffect,
                locator,
                bind_to_actor: bindToActor,
                pre_effect_script: preEffectScript
            }
            : dataOrEffect;

        this.setValueAtPath(this.animationPath(`particle_effects/${time}`), data);
        return this;
    }

    /**
     * Replaces `sound_effects`.
     */
    setSoundEffects(soundEffects: AnimationSoundEffectsData): this {
        this.setValueAtPath(this.animationPath("sound_effects"), soundEffects);
        return this;
    }

    /**
     * Adds a sound effect at a time in seconds.
     */
    addSoundEffect(time: number | string, data: AnimationSoundEffectData): this;
    addSoundEffect(time: number | string, effect: string, locator?: string): this;
    addSoundEffect(
        time: number | string,
        dataOrEffect: AnimationSoundEffectData | string,
        locator?: string
    ): this {
        const data = typeof dataOrEffect === "string"
            ? {
                effect: dataOrEffect,
                locator
            }
            : dataOrEffect;

        this.setValueAtPath(this.animationPath(`sound_effects/${time}`), data);
        return this;
    }
}
