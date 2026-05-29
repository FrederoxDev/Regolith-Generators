import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type KnownParticleComponentId,
    type ParticleAppearanceBillboardData,
    type ParticleAppearanceLightingData,
    type ParticleAppearanceTintingData,
    type ParticleBasicRenderParametersData,
    type ParticleBillboardDirectionData,
    type ParticleBillboardFacingCameraMode,
    type ParticleColor,
    type ParticleComponentDataFor,
    type ParticleComponentId,
    type ParticleCurveBezierChainData,
    type ParticleCurveBezierNodeData,
    type ParticleCurveData,
    type ParticleCurveLinearData,
    type ParticleCurvesData,
    type ParticleDocumentData,
    type ParticleEmitterDirection,
    type ParticleEmitterInitializationData,
    type ParticleEmitterLifetimeEventsData,
    type ParticleEmitterLifetimeExpressionData,
    type ParticleEmitterLifetimeLoopingData,
    type ParticleEmitterLifetimeOnceData,
    type ParticleEmitterLocalSpaceData,
    type ParticleEmitterRateInstantData,
    type ParticleEmitterRateManualData,
    type ParticleEmitterRateSteadyData,
    type ParticleEmitterShapeBoxData,
    type ParticleEmitterShapeCustomData,
    type ParticleEmitterShapeDiscData,
    type ParticleEmitterShapeEntityAabbData,
    type ParticleEmitterShapePointData,
    type ParticleEmitterShapeSphereData,
    type ParticleEventNodeData,
    type ParticleEventsData,
    type ParticleFormatVersion,
    type ParticleIdentifier,
    type ParticleInitialSpeedData,
    type ParticleInitialSpinData,
    type ParticleInitializationData,
    type ParticleLifetimeEventsData,
    type ParticleLifetimeExpressionData,
    type ParticleMaterial,
    type ParticleMolang,
    type ParticleMotionCollisionData,
    type ParticleMotionDynamicData,
    type ParticleMotionParametricData,
    type ParticlePlaneNormal,
    type ParticleUvData,
    type ParticleVector2,
    type ParticleVector3,
    type ParticleVector4
} from "./ParticleTypes.ts";

export * from "./ParticleTypes.ts";

const DEFAULT_PARTICLE_FORMAT_VERSION: ParticleFormatVersion = "1.10.0";
const DEFAULT_PARTICLE_MATERIAL: ParticleMaterial = "particles_alpha";
const DEFAULT_PARTICLE_TEXTURE = "textures/particle/particles";
const PARTICLE_EFFECT_PATH = "particle_effect";

function qualifyIdentifier(projectNamespace: string, id: string): string {
    return id.includes(":") ? id : `${projectNamespace}:${id}`;
}

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compact<T extends Record<string, unknown>>(data: T): T {
    for (const key in data) {
        if (data[key] === undefined) {
            delete data[key];
        }
    }

    return data;
}

/**
 * Factory for resource-pack particle effect files.
 *
 * Generated files are written under `RP/particles`. Particle effects are
 * referenced by their namespaced identifier, so generated filenames are only a
 * storage detail.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlesintroduction
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlecomponentlist
 */
export class ParticleGenerator extends GeneratorFactory<ParticleDef> {
    /**
     * Creates a particle generator that writes into `RP/particles`.
     */
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/particles");
    }

    /**
     * Queues a particle effect.
     *
     * If `id` does not include a namespace, this generator's project namespace
     * is used.
     */
    makeParticle(
        id: string,
        material: ParticleMaterial = DEFAULT_PARTICLE_MATERIAL,
        texture: string = DEFAULT_PARTICLE_TEXTURE,
        formatVersion: ParticleFormatVersion = DEFAULT_PARTICLE_FORMAT_VERSION
    ): ParticleDef {
        const identifier = qualifyIdentifier(this.projectNamespace, id);
        const def = new ParticleDef(identifier, material, texture, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }

    /**
     * Queues a particle effect for an already-qualified identifier.
     */
    makeParticleForIdentifier(
        identifier: ParticleIdentifier,
        material: ParticleMaterial = DEFAULT_PARTICLE_MATERIAL,
        texture: string = DEFAULT_PARTICLE_TEXTURE,
        formatVersion: ParticleFormatVersion = DEFAULT_PARTICLE_FORMAT_VERSION
    ): ParticleDef {
        const def = new ParticleDef(identifier, material, texture, formatVersion);
        this.filesToGenerate.set(sanitiseIdentifierForFilename(identifier), def);
        return def;
    }
}

/**
 * Fluent builder for a resource-pack `particle_effect` JSON file.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlesintroduction
 */
export class ParticleDef extends GeneratorBase<ParticleDef> {
    data: ParticleDocumentData;

    /**
     * Creates a particle effect definition.
     */
    constructor(
        identifier: ParticleIdentifier,
        material: ParticleMaterial = DEFAULT_PARTICLE_MATERIAL,
        texture: string = DEFAULT_PARTICLE_TEXTURE,
        formatVersion: ParticleFormatVersion = DEFAULT_PARTICLE_FORMAT_VERSION
    ) {
        super();

        this.data = {
            "format_version": formatVersion,
            "particle_effect": {
                "description": {
                    "identifier": identifier,
                    "basic_render_parameters": {
                        "material": material,
                        "texture": texture
                    }
                },
                "components": {}
            }
        };
    }

    private particlePath(path: string): string {
        return path.length === 0 ? PARTICLE_EFFECT_PATH : `${PARTICLE_EFFECT_PATH}/${path}`;
    }

    private componentPath(componentId: string, path: string = ""): string {
        return this.particlePath(`components/${componentId}${path.length === 0 ? "" : `/${path}`}`);
    }

    /**
     * Sets the root `format_version`.
     */
    setFormatVersion(version: ParticleFormatVersion): this {
        this.data.format_version = version;
        return this;
    }

    /**
     * Replaces the particle effect identifier.
     */
    setIdentifier(identifier: ParticleIdentifier): this {
        this.setValueAtPath(this.particlePath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the full `basic_render_parameters` object.
     */
    setBasicRenderParameters(data: ParticleBasicRenderParametersData): this;
    /**
     * Sets particle material and texture render parameters.
     */
    setBasicRenderParameters(material: ParticleMaterial, texture: string): this;
    setBasicRenderParameters(
        dataOrMaterial: ParticleBasicRenderParametersData | ParticleMaterial,
        texture?: string
    ): this {
        const data = isRecord(dataOrMaterial)
            ? dataOrMaterial
            : {
                material: dataOrMaterial,
                texture: texture ?? DEFAULT_PARTICLE_TEXTURE
            };

        this.setValueAtPath(this.particlePath("description/basic_render_parameters"), data);
        return this;
    }

    /**
     * Sets the render material.
     */
    setMaterial(material: ParticleMaterial): this {
        this.setValueAtPath(this.particlePath("description/basic_render_parameters/material"), material);
        return this;
    }

    /**
     * Sets the texture path used by this particle effect.
     */
    setTexture(texture: string): this {
        this.setValueAtPath(this.particlePath("description/basic_render_parameters/texture"), texture);
        return this;
    }

    /**
     * Sets a field inside the `particle_effect` object.
     */
    setParticleEffectProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.particlePath(key), value);
        return this;
    }

    /**
     * Sets a field inside the particle `description` object.
     */
    setDescriptionProperty(key: string, value: unknown): this {
        this.setValueAtPath(this.particlePath(`description/${key}`), value);
        return this;
    }

    /**
     * Adds or replaces a particle component.
     *
     * Use this as the low-level escape hatch for component fields that do not
     * yet have a convenience method.
     */
    addComponent<TComponentId extends KnownParticleComponentId>(
        componentId: TComponentId,
        data: ParticleComponentDataFor<TComponentId>
    ): this;
    addComponent(componentId: ParticleComponentId, data?: unknown): this;
    addComponent(componentId: ParticleComponentId, data: unknown = {}): this {
        this.setValueAtPath(this.componentPath(componentId), data);
        return this;
    }

    /**
     * Sets a single field on a particle component.
     */
    setComponentProperty(componentId: ParticleComponentId, key: string, value: unknown): this {
        this.setValueAtPath(this.componentPath(componentId, key), value);
        return this;
    }

    /**
     * Replaces the full `curves` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlecurves
     */
    setCurves(curves: ParticleCurvesData): this {
        this.setValueAtPath(this.particlePath("curves"), curves);
        return this;
    }

    /**
     * Adds or replaces a named curve.
     *
     * Curve names become Molang variables, so names normally start with
     * `variable.`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlecurves
     */
    addCurve(name: string, data: ParticleCurveData): this {
        this.setValueAtPath(this.particlePath(`curves/${name}`), data);
        return this;
    }

    /**
     * Adds a linear, bezier, or catmull-rom curve.
     */
    addLinearCurve(
        name: string,
        input: ParticleMolang,
        nodes: ParticleCurveLinearData["nodes"],
        horizontalRange: ParticleMolang = 1,
        type: ParticleCurveLinearData["type"] = "linear"
    ): this {
        return this.addCurve(name, {
            type,
            input,
            nodes,
            horizontal_range: horizontalRange
        });
    }

    /**
     * Adds a bezier-chain curve.
     */
    addBezierChainCurve(
        name: string,
        input: ParticleMolang,
        nodes: Record<string, ParticleCurveBezierNodeData>
    ): this {
        const data: ParticleCurveBezierChainData = {
            type: "bezier_chain",
            input,
            nodes
        };

        return this.addCurve(name, data);
    }

    /**
     * Replaces the full `events` object.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
     */
    setEvents(events: ParticleEventsData): this {
        this.setValueAtPath(this.particlePath("events"), events);
        return this;
    }

    /**
     * Adds or replaces a named particle event.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
     */
    addEvent(name: string, data: ParticleEventNodeData): this {
        this.setValueAtPath(this.particlePath(`events/${name}`), data);
        return this;
    }

    /**
     * Adds `minecraft:emitter_initialization`.
     *
     * Runs Molang when the emitter is created or updated.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_initialization
     */
    addEmitterInitialization(data: ParticleEmitterInitializationData): this;
    addEmitterInitialization(creationExpression?: ParticleMolang, perUpdateExpression?: ParticleMolang): this;
    addEmitterInitialization(
        dataOrCreationExpression: ParticleEmitterInitializationData | ParticleMolang = {},
        perUpdateExpression?: ParticleMolang
    ): this {
        const data = isRecord(dataOrCreationExpression)
            ? dataOrCreationExpression
            : compact({
                creation_expression: dataOrCreationExpression,
                per_update_expression: perUpdateExpression
            });

        return this.addComponent("minecraft:emitter_initialization", data);
    }

    /**
     * Adds `minecraft:emitter_lifetime_events`.
     *
     * Fires events when the emitter is created, expires, reaches timeline
     * points, or travels configured distances.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
     */
    addEmitterLifetimeEvents(data: ParticleEmitterLifetimeEventsData): this {
        return this.addComponent("minecraft:emitter_lifetime_events", data);
    }

    /**
     * Adds `minecraft:emitter_lifetime_expression`.
     *
     * Controls emitter activation and expiration with Molang.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_expression
     */
    addEmitterLifetimeExpression(data: ParticleEmitterLifetimeExpressionData): this;
    addEmitterLifetimeExpression(
        activationExpression?: ParticleMolang,
        expirationExpression?: ParticleMolang
    ): this;
    addEmitterLifetimeExpression(
        dataOrActivationExpression: ParticleEmitterLifetimeExpressionData | ParticleMolang = {},
        expirationExpression?: ParticleMolang
    ): this {
        const data = isRecord(dataOrActivationExpression)
            ? dataOrActivationExpression
            : compact({
                activation_expression: dataOrActivationExpression,
                expiration_expression: expirationExpression
            });

        return this.addComponent("minecraft:emitter_lifetime_expression", data);
    }

    /**
     * Adds `minecraft:emitter_lifetime_looping`.
     *
     * Makes the emitter repeat active and sleep periods.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_looping
     */
    addEmitterLifetimeLooping(data: ParticleEmitterLifetimeLoopingData): this;
    addEmitterLifetimeLooping(activeTime?: ParticleMolang, sleepTime?: ParticleMolang): this;
    addEmitterLifetimeLooping(
        dataOrActiveTime: ParticleEmitterLifetimeLoopingData | ParticleMolang = {},
        sleepTime?: ParticleMolang
    ): this {
        const data = isRecord(dataOrActiveTime)
            ? dataOrActiveTime
            : compact({
                active_time: dataOrActiveTime,
                sleep_time: sleepTime
            });

        return this.addComponent("minecraft:emitter_lifetime_looping", data);
    }

    /**
     * Adds `minecraft:emitter_lifetime_once`.
     *
     * Makes the emitter run for one active period and then stop.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_once
     */
    addEmitterLifetimeOnce(data: ParticleEmitterLifetimeOnceData): this;
    addEmitterLifetimeOnce(activeTime?: ParticleMolang): this;
    addEmitterLifetimeOnce(dataOrActiveTime: ParticleEmitterLifetimeOnceData | ParticleMolang = {}): this {
        const data = isRecord(dataOrActiveTime)
            ? dataOrActiveTime
            : compact({ active_time: dataOrActiveTime });

        return this.addComponent("minecraft:emitter_lifetime_once", data);
    }

    /**
     * Adds `minecraft:emitter_local_space`.
     *
     * Controls whether particles inherit position, rotation, and velocity from
     * the emitter.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_local_space
     */
    addEmitterLocalSpace(data: ParticleEmitterLocalSpaceData): this;
    addEmitterLocalSpace(position?: boolean, rotation?: boolean, velocity?: boolean): this;
    addEmitterLocalSpace(
        dataOrPosition: ParticleEmitterLocalSpaceData | boolean = true,
        rotation: boolean = true,
        velocity: boolean = true
    ): this {
        const data = isRecord(dataOrPosition)
            ? dataOrPosition
            : {
                position: dataOrPosition,
                rotation,
                velocity
            };

        return this.addComponent("minecraft:emitter_local_space", data);
    }

    /**
     * Adds `minecraft:emitter_rate_instant`.
     *
     * Emits all particles at once when the emitter activates.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_instant
     */
    addEmitterRateInstant(numParticles: ParticleMolang): this {
        const data: ParticleEmitterRateInstantData = {
            num_particles: numParticles
        };

        return this.addComponent("minecraft:emitter_rate_instant", data);
    }

    /**
     * Adds `minecraft:emitter_rate_manual`.
     *
     * Allows events to manually emit particles up to `maxParticles`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_manual
     */
    addEmitterRateManual(maxParticles: ParticleMolang = 50): this {
        const data: ParticleEmitterRateManualData = {
            max_particles: maxParticles
        };

        return this.addComponent("minecraft:emitter_rate_manual", data);
    }

    /**
     * Adds `minecraft:emitter_rate_steady`.
     *
     * Continuously emits particles at `spawnRate`, capped by `maxParticles`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_steady
     */
    addEmitterRateSteady(spawnRate: ParticleMolang, maxParticles: ParticleMolang = 50): this {
        const data: ParticleEmitterRateSteadyData = {
            spawn_rate: spawnRate,
            max_particles: maxParticles
        };

        return this.addComponent("minecraft:emitter_rate_steady", data);
    }

    /**
     * Adds `minecraft:emitter_shape_box`.
     *
     * Emits from a rectangular volume.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_box
     */
    addEmitterShapeBox(data: ParticleEmitterShapeBoxData): this;
    addEmitterShapeBox(
        halfDimensions: ParticleVector3,
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this;
    addEmitterShapeBox(
        dataOrHalfDimensions: ParticleEmitterShapeBoxData | ParticleVector3,
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this {
        const data = Array.isArray(dataOrHalfDimensions)
            ? compact({
                half_dimensions: dataOrHalfDimensions,
                direction,
                offset,
                surface_only: surfaceOnly
            })
            : dataOrHalfDimensions;

        return this.addComponent("minecraft:emitter_shape_box", data);
    }

    /**
     * Adds `minecraft:emitter_shape_custom`.
     *
     * Emits from positions calculated by custom Molang vectors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_custom
     */
    addEmitterShapeCustom(data: ParticleEmitterShapeCustomData): this;
    addEmitterShapeCustom(offset?: ParticleVector3, direction?: ParticleVector3): this;
    addEmitterShapeCustom(
        dataOrOffset: ParticleEmitterShapeCustomData | ParticleVector3 = {},
        direction?: ParticleVector3
    ): this {
        const data = Array.isArray(dataOrOffset)
            ? compact({
                offset: dataOrOffset,
                direction
            })
            : dataOrOffset;

        return this.addComponent("minecraft:emitter_shape_custom", data);
    }

    /**
     * Adds `minecraft:emitter_shape_disc`.
     *
     * Emits from a circular disc or ring.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_disc
     */
    addEmitterShapeDisc(data: ParticleEmitterShapeDiscData): this;
    addEmitterShapeDisc(
        radius?: ParticleMolang,
        planeNormal?: ParticlePlaneNormal,
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this;
    addEmitterShapeDisc(
        dataOrRadius: ParticleEmitterShapeDiscData | ParticleMolang = {},
        planeNormal: ParticlePlaneNormal = [0, 1, 0],
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this {
        const data = isRecord(dataOrRadius)
            ? dataOrRadius
            : compact({
                radius: dataOrRadius,
                plane_normal: planeNormal,
                direction,
                offset,
                surface_only: surfaceOnly
            });

        return this.addComponent("minecraft:emitter_shape_disc", data);
    }

    /**
     * Adds `minecraft:emitter_shape_entity_aabb`.
     *
     * Emits from the attached entity's bounding box.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_entity_aabb
     */
    addEmitterShapeEntityAabb(data: ParticleEmitterShapeEntityAabbData): this;
    addEmitterShapeEntityAabb(direction?: ParticleEmitterDirection, surfaceOnly?: boolean): this;
    addEmitterShapeEntityAabb(
        dataOrDirection: ParticleEmitterShapeEntityAabbData | ParticleEmitterDirection = {},
        surfaceOnly?: boolean
    ): this {
        const data = isRecord(dataOrDirection)
            ? dataOrDirection
            : compact({
                direction: dataOrDirection,
                surface_only: surfaceOnly
            });

        return this.addComponent("minecraft:emitter_shape_entity_aabb", data);
    }

    /**
     * Adds `minecraft:emitter_shape_point`.
     *
     * Emits from a single point.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_point
     */
    addEmitterShapePoint(data: ParticleEmitterShapePointData): this;
    addEmitterShapePoint(direction?: ParticleVector3, offset?: ParticleVector3): this;
    addEmitterShapePoint(
        dataOrDirection: ParticleEmitterShapePointData | ParticleVector3 = {},
        offset?: ParticleVector3
    ): this {
        const data = Array.isArray(dataOrDirection)
            ? compact({
                direction: dataOrDirection,
                offset
            })
            : dataOrDirection;

        return this.addComponent("minecraft:emitter_shape_point", data);
    }

    /**
     * Adds `minecraft:emitter_shape_sphere`.
     *
     * Emits from a spherical volume or shell.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_sphere
     */
    addEmitterShapeSphere(data: ParticleEmitterShapeSphereData): this;
    addEmitterShapeSphere(
        radius?: ParticleMolang,
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this;
    addEmitterShapeSphere(
        dataOrRadius: ParticleEmitterShapeSphereData | ParticleMolang = {},
        direction?: ParticleEmitterDirection,
        offset?: ParticleVector3,
        surfaceOnly?: boolean
    ): this {
        const data = isRecord(dataOrRadius)
            ? dataOrRadius
            : compact({
                radius: dataOrRadius,
                direction,
                offset,
                surface_only: surfaceOnly
            });

        return this.addComponent("minecraft:emitter_shape_sphere", data);
    }

    /**
     * Adds `minecraft:particle_initial_speed`.
     *
     * Sets initial particle speed as a scalar or vector.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_effect_component
     */
    addParticleInitialSpeed(speed: ParticleInitialSpeedData): this {
        return this.addComponent("minecraft:particle_initial_speed", speed);
    }

    /**
     * Adds `minecraft:particle_initial_spin`.
     *
     * Sets initial particle rotation and rotation rate.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_initial_spin
     */
    addParticleInitialSpin(data: ParticleInitialSpinData): this;
    addParticleInitialSpin(rotation?: ParticleMolang, rotationRate?: ParticleMolang): this;
    addParticleInitialSpin(
        dataOrRotation: ParticleInitialSpinData | ParticleMolang = {},
        rotationRate?: ParticleMolang
    ): this {
        const data = isRecord(dataOrRotation)
            ? dataOrRotation
            : compact({
                rotation: dataOrRotation,
                rotation_rate: rotationRate
            });

        return this.addComponent("minecraft:particle_initial_spin", data);
    }

    /**
     * Adds `minecraft:particle_initialization`.
     *
     * Runs Molang for each individual particle.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_initialization
     */
    addParticleInitialization(data: ParticleInitializationData): this;
    addParticleInitialization(perUpdateExpression?: ParticleMolang, perRenderExpression?: ParticleMolang): this;
    addParticleInitialization(
        dataOrPerUpdateExpression: ParticleInitializationData | ParticleMolang = {},
        perRenderExpression?: ParticleMolang
    ): this {
        const data = isRecord(dataOrPerUpdateExpression)
            ? dataOrPerUpdateExpression
            : compact({
                per_update_expression: dataOrPerUpdateExpression,
                per_render_expression: perRenderExpression
            });

        return this.addComponent("minecraft:particle_initialization", data);
    }

    /**
     * Adds `minecraft:particle_motion_collision`.
     *
     * Enables particle collision against world geometry.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_collision
     */
    addParticleMotionCollision(data: ParticleMotionCollisionData): this;
    addParticleMotionCollision(
        collisionRadius?: number,
        expireOnContact?: boolean,
        coefficientOfRestitution?: number,
        collisionDrag?: number
    ): this;
    addParticleMotionCollision(
        dataOrCollisionRadius: ParticleMotionCollisionData | number = 0.01,
        expireOnContact?: boolean,
        coefficientOfRestitution?: number,
        collisionDrag?: number
    ): this {
        const data = isRecord(dataOrCollisionRadius)
            ? dataOrCollisionRadius
            : compact({
                collision_radius: dataOrCollisionRadius,
                expire_on_contact: expireOnContact,
                coefficient_of_restitution: coefficientOfRestitution,
                collision_drag: collisionDrag
            });

        return this.addComponent("minecraft:particle_motion_collision", data);
    }

    /**
     * Adds `minecraft:particle_motion_dynamic`.
     *
     * Applies acceleration and drag physics to particles.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_dynamic
     */
    addParticleMotionDynamic(data: ParticleMotionDynamicData): this;
    addParticleMotionDynamic(
        linearAcceleration?: ParticleVector3,
        linearDragCoefficient?: ParticleMolang,
        rotationAcceleration?: ParticleMolang,
        rotationDragCoefficient?: ParticleMolang
    ): this;
    addParticleMotionDynamic(
        dataOrLinearAcceleration: ParticleMotionDynamicData | ParticleVector3 = {},
        linearDragCoefficient?: ParticleMolang,
        rotationAcceleration?: ParticleMolang,
        rotationDragCoefficient?: ParticleMolang
    ): this {
        const data = Array.isArray(dataOrLinearAcceleration)
            ? compact({
                linear_acceleration: dataOrLinearAcceleration,
                linear_drag_coefficient: linearDragCoefficient,
                rotation_acceleration: rotationAcceleration,
                rotation_drag_coefficient: rotationDragCoefficient
            })
            : dataOrLinearAcceleration;

        return this.addComponent("minecraft:particle_motion_dynamic", data);
    }

    /**
     * Adds `minecraft:particle_motion_parametric`.
     *
     * Controls particle position, direction, and rotation with Molang each
     * frame.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_parametric
     */
    addParticleMotionParametric(data: ParticleMotionParametricData): this;
    addParticleMotionParametric(
        relativePosition?: ParticleVector3,
        direction?: ParticleVector3,
        rotation?: ParticleMolang
    ): this;
    addParticleMotionParametric(
        dataOrRelativePosition: ParticleMotionParametricData | ParticleVector3 = {},
        direction?: ParticleVector3,
        rotation?: ParticleMolang
    ): this {
        const data = Array.isArray(dataOrRelativePosition)
            ? compact({
                relative_position: dataOrRelativePosition,
                direction,
                rotation
            })
            : dataOrRelativePosition;

        return this.addComponent("minecraft:particle_motion_parametric", data);
    }

    /**
     * Adds `minecraft:particle_appearance_billboard`.
     *
     * Configures sprite size, camera-facing mode, UVs, and direction settings.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_billboard
     */
    addParticleAppearanceBillboard(data: ParticleAppearanceBillboardData): this;
    addParticleAppearanceBillboard(
        size: ParticleVector2,
        facingCameraMode?: ParticleBillboardFacingCameraMode,
        uv?: ParticleUvData,
        direction?: ParticleBillboardDirectionData
    ): this;
    addParticleAppearanceBillboard(
        dataOrSize: ParticleAppearanceBillboardData | ParticleVector2,
        facingCameraMode: ParticleBillboardFacingCameraMode = "lookat_xyz",
        uv?: ParticleUvData,
        direction?: ParticleBillboardDirectionData
    ): this {
        const data = Array.isArray(dataOrSize)
            ? compact({
                size: dataOrSize,
                facing_camera_mode: facingCameraMode,
                uv,
                direction
            })
            : dataOrSize;

        return this.addComponent("minecraft:particle_appearance_billboard", data);
    }

    /**
     * Adds `minecraft:particle_appearance_lighting`.
     *
     * Enables particles to be affected by scene lighting.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_lighting
     */
    addParticleAppearanceLighting(data: ParticleAppearanceLightingData = {}): this {
        return this.addComponent("minecraft:particle_appearance_lighting", data);
    }

    /**
     * Adds `minecraft:particle_appearance_tinting`.
     *
     * Applies a solid color or gradient tint to the particle texture.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_tinting
     */
    addParticleAppearanceTinting(data: ParticleAppearanceTintingData): this;
    addParticleAppearanceTinting(color: ParticleColor): this;
    addParticleAppearanceTinting(dataOrColor: ParticleAppearanceTintingData | ParticleColor): this {
        const data = isRecord(dataOrColor) && "color" in dataOrColor
            ? dataOrColor
            : { color: dataOrColor };

        return this.addComponent("minecraft:particle_appearance_tinting", data);
    }

    /**
     * Adds `minecraft:particle_expire_if_in_blocks`.
     *
     * Expires particles when they enter any listed block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_effect_component
     */
    addParticleExpireIfInBlocks(blocks: string | string[]): this {
        return this.addComponent("minecraft:particle_expire_if_in_blocks", toArray(blocks));
    }

    /**
     * Adds `minecraft:particle_expire_if_not_in_blocks`.
     *
     * Expires particles when they are not inside one of the listed blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_effect_component
     */
    addParticleExpireIfNotInBlocks(blocks: string | string[]): this {
        return this.addComponent("minecraft:particle_expire_if_not_in_blocks", toArray(blocks));
    }

    /**
     * Adds `minecraft:particle_kill_plane`.
     *
     * Kills particles that cross the plane `[A, B, C, D]` where
     * `Ax + By + Cz + D = 0`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_effect_component
     */
    addParticleKillPlane(plane: ParticleVector4): this {
        return this.addComponent("minecraft:particle_kill_plane", plane);
    }

    /**
     * Adds `minecraft:particle_lifetime_events`.
     *
     * Fires events when particles are created, expire, or hit timeline points.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
     */
    addParticleLifetimeEvents(data: ParticleLifetimeEventsData): this {
        return this.addComponent("minecraft:particle_lifetime_events", data);
    }

    /**
     * Adds `minecraft:particle_lifetime_expression`.
     *
     * Controls particle maximum lifetime and early expiration with Molang.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_lifetime_expression
     */
    addParticleLifetimeExpression(data: ParticleLifetimeExpressionData): this;
    addParticleLifetimeExpression(maxLifetime?: ParticleMolang, expirationExpression?: ParticleMolang): this;
    addParticleLifetimeExpression(
        dataOrMaxLifetime: ParticleLifetimeExpressionData | ParticleMolang = {},
        expirationExpression?: ParticleMolang
    ): this {
        const data = isRecord(dataOrMaxLifetime)
            ? dataOrMaxLifetime
            : compact({
                max_lifetime: dataOrMaxLifetime,
                expiration_expression: expirationExpression
            });

        return this.addComponent("minecraft:particle_lifetime_expression", data);
    }
}
