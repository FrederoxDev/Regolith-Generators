/**
 * Version string used by resource-pack particle effect JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_document
 */
export type ParticleFormatVersion = string;

/**
 * Namespaced particle effect identifier.
 */
export type ParticleIdentifier = string;

/**
 * String or numeric Molang value accepted by particle definitions.
 */
export type ParticleMolang = string | number;

/**
 * Two-dimensional vector whose values can be numbers or Molang expressions.
 */
export type ParticleVector2 = [ParticleMolang, ParticleMolang];

/**
 * Three-dimensional vector whose values can be numbers or Molang expressions.
 */
export type ParticleVector3 = [ParticleMolang, ParticleMolang, ParticleMolang];

/**
 * Four-value vector whose values can be numbers or Molang expressions.
 */
export type ParticleVector4 = [ParticleMolang, ParticleMolang, ParticleMolang, ParticleMolang];

/**
 * Built-in render materials commonly used by particle effects.
 */
export type ParticleMaterial =
    | "particles_alpha"
    | "particles_blend"
    | "particles_add"
    | (string & {});

/**
 * Root resource-pack particle effect document.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_document
 */
export interface ParticleDocumentData {
    /**
     * File format version.
     */
    format_version: ParticleFormatVersion;

    /**
     * The particle effect definition.
     */
    particle_effect: ParticleEffectData;

    /**
     * Future root fields.
     */
    [key: string]: unknown;
}

/**
 * `particle_effect` payload containing description, components, curves, and
 * events.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlesintroduction
 */
export interface ParticleEffectData {
    /**
     * Particle identifier and render parameters.
     */
    description: ParticleDescriptionData;

    /**
     * Emitter and particle components.
     */
    components: ParticleComponentsData;

    /**
     * Optional named Molang curves.
     */
    curves?: ParticleCurvesData;

    /**
     * Optional named event nodes.
     */
    events?: ParticleEventsData;

    /**
     * Future particle effect fields.
     */
    [key: string]: unknown;
}

/**
 * Description object for a particle effect.
 */
export interface ParticleDescriptionData {
    /**
     * Namespaced particle effect identifier.
     */
    identifier: ParticleIdentifier;

    /**
     * Material and texture used by the particle sprites.
     */
    basic_render_parameters: ParticleBasicRenderParametersData;

    /**
     * Future description fields.
     */
    [key: string]: unknown;
}

/**
 * Render material and texture path for a particle effect.
 */
export interface ParticleBasicRenderParametersData {
    /**
     * Particle material, commonly `particles_alpha`, `particles_blend`, or
     * `particles_add`.
     */
    material: ParticleMaterial;

    /**
     * Texture path, usually under `textures/particle`.
     */
    texture: string;

    /**
     * Future render parameter fields.
     */
    [key: string]: unknown;
}

/**
 * Known component ids for particle effects.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlecomponentlist
 */
export type KnownParticleComponentId = keyof ParticleComponentDataMap;

/**
 * Particle component id. Known ids are typed explicitly while custom or future
 * ids remain possible.
 */
export type ParticleComponentId = KnownParticleComponentId | (string & {});

/**
 * Component object keyed by component id.
 */
export type ParticleComponentsData = Partial<ParticleComponentDataMap> & Record<string, unknown>;

/**
 * Data type lookup for every documented particle component.
 */
export interface ParticleComponentDataMap {
    "minecraft:emitter_initialization": ParticleEmitterInitializationData;
    "minecraft:emitter_lifetime_events": ParticleEmitterLifetimeEventsData;
    "minecraft:emitter_lifetime_expression": ParticleEmitterLifetimeExpressionData;
    "minecraft:emitter_lifetime_looping": ParticleEmitterLifetimeLoopingData;
    "minecraft:emitter_lifetime_once": ParticleEmitterLifetimeOnceData;
    "minecraft:emitter_local_space": ParticleEmitterLocalSpaceData;
    "minecraft:emitter_rate_instant": ParticleEmitterRateInstantData;
    "minecraft:emitter_rate_manual": ParticleEmitterRateManualData;
    "minecraft:emitter_rate_steady": ParticleEmitterRateSteadyData;
    "minecraft:emitter_shape_box": ParticleEmitterShapeBoxData;
    "minecraft:emitter_shape_custom": ParticleEmitterShapeCustomData;
    "minecraft:emitter_shape_disc": ParticleEmitterShapeDiscData;
    "minecraft:emitter_shape_entity_aabb": ParticleEmitterShapeEntityAabbData;
    "minecraft:emitter_shape_point": ParticleEmitterShapePointData;
    "minecraft:emitter_shape_sphere": ParticleEmitterShapeSphereData;
    "minecraft:particle_appearance_billboard": ParticleAppearanceBillboardData;
    "minecraft:particle_appearance_lighting": ParticleAppearanceLightingData;
    "minecraft:particle_appearance_tinting": ParticleAppearanceTintingData;
    "minecraft:particle_expire_if_in_blocks": string[];
    "minecraft:particle_expire_if_not_in_blocks": string[];
    "minecraft:particle_initial_speed": ParticleInitialSpeedData;
    "minecraft:particle_initial_spin": ParticleInitialSpinData;
    "minecraft:particle_initialization": ParticleInitializationData;
    "minecraft:particle_kill_plane": ParticleVector4;
    "minecraft:particle_lifetime_events": ParticleLifetimeEventsData;
    "minecraft:particle_lifetime_expression": ParticleLifetimeExpressionData;
    "minecraft:particle_motion_collision": ParticleMotionCollisionData;
    "minecraft:particle_motion_dynamic": ParticleMotionDynamicData;
    "minecraft:particle_motion_parametric": ParticleMotionParametricData;
}

/**
 * Component data type for a known component id.
 */
export type ParticleComponentDataFor<TComponentId extends KnownParticleComponentId> =
    ParticleComponentDataMap[TComponentId];

/**
 * A single event name, or a list of event names, used by lifecycle fields.
 */
export type ParticleEventReference = string | string[];

/**
 * Timeline event map keyed by time expression.
 */
export interface ParticleTimelineData {
    /**
     * Event name or event list for a timeline position.
     */
    [time: string]: ParticleEventReference;
}

/**
 * Travel-distance event used by emitter lifetime events.
 */
export interface ParticleTravelDistanceEventData {
    /**
     * Distance traveled before the event triggers.
     */
    distance: ParticleMolang;

    /**
     * Event name or event list to fire.
     */
    effects: ParticleEventReference;

    /**
     * Future travel-distance event fields.
     */
    [key: string]: unknown;
}

/**
 * Travel-distance event collection accepted by emitter lifetime events.
 */
export type ParticleTravelDistanceEventsData =
    | ParticleTravelDistanceEventData[]
    | Record<string, ParticleEventReference>
    | ParticleEventReference;

/**
 * Runs Molang when the emitter is created or updated.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_initialization
 */
export interface ParticleEmitterInitializationData {
    /**
     * Expression run once when the emitter is created.
     */
    creation_expression?: ParticleMolang;

    /**
     * Expression run every frame while the emitter is active.
     */
    per_update_expression?: ParticleMolang;

    /**
     * Future emitter initialization fields.
     */
    [key: string]: unknown;
}

/**
 * Event hooks for emitter creation, expiration, timeline, and travel distance.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
 */
export interface ParticleEmitterLifetimeEventsData {
    /**
     * Event or events fired when the emitter is created.
     */
    creation_event?: ParticleEventReference;

    /**
     * Event or events fired when the emitter expires.
     */
    expiration_event?: ParticleEventReference;

    /**
     * Events fired at times during the emitter lifetime.
     */
    timeline?: ParticleTimelineData | ParticleEventReference;

    /**
     * Events fired after the emitter travels a configured distance.
     */
    travel_distance_events?: ParticleTravelDistanceEventsData;

    /**
     * Repeating travel-distance events.
     */
    looping_travel_distance_events?: ParticleTravelDistanceEventData[];

    /**
     * Future emitter lifetime event fields.
     */
    [key: string]: unknown;
}

/**
 * Expression-driven emitter activation and expiration.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_expression
 */
export interface ParticleEmitterLifetimeExpressionData {
    /**
     * Activates the emitter when the expression is non-zero.
     */
    activation_expression?: ParticleMolang;

    /**
     * Expires the emitter when the expression is non-zero.
     */
    expiration_expression?: ParticleMolang;

    /**
     * Future lifetime expression fields.
     */
    [key: string]: unknown;
}

/**
 * Looping emitter lifetime.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_looping
 */
export interface ParticleEmitterLifetimeLoopingData {
    /**
     * Time in seconds the emitter stays active.
     */
    active_time?: ParticleMolang;

    /**
     * Time in seconds the emitter sleeps between active periods.
     */
    sleep_time?: ParticleMolang;

    /**
     * Future looping lifetime fields.
     */
    [key: string]: unknown;
}

/**
 * One-shot emitter lifetime.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_lifetime_once
 */
export interface ParticleEmitterLifetimeOnceData {
    /**
     * Time in seconds the emitter stays active before ending.
     */
    active_time?: ParticleMolang;

    /**
     * Future one-shot lifetime fields.
     */
    [key: string]: unknown;
}

/**
 * Controls whether particles inherit emitter local-space transforms.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_local_space
 */
export interface ParticleEmitterLocalSpaceData {
    /**
     * Particles stay relative to emitter position.
     */
    position?: boolean;

    /**
     * Particles stay relative to emitter rotation.
     */
    rotation?: boolean;

    /**
     * Particles inherit emitter velocity.
     */
    velocity?: boolean;

    /**
     * Future local-space fields.
     */
    [key: string]: unknown;
}

/**
 * Emits all particles in one burst.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_instant
 */
export interface ParticleEmitterRateInstantData {
    /**
     * Number of particles emitted at once.
     */
    num_particles: ParticleMolang;

    /**
     * Future instant-rate fields.
     */
    [key: string]: unknown;
}

/**
 * Manual emission mode used by event-driven effects.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_manual
 */
export interface ParticleEmitterRateManualData {
    /**
     * Maximum active particles for this emitter.
     */
    max_particles: ParticleMolang;

    /**
     * Future manual-rate fields.
     */
    [key: string]: unknown;
}

/**
 * Continuous emission at a steady rate.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_rate_steady
 */
export interface ParticleEmitterRateSteadyData {
    /**
     * Maximum active particles for this emitter.
     */
    max_particles: ParticleMolang;

    /**
     * Particles spawned per second.
     */
    spawn_rate: ParticleMolang;

    /**
     * Future steady-rate fields.
     */
    [key: string]: unknown;
}

/**
 * Direction keyword or vector used by volume emitter shapes.
 */
export type ParticleEmitterDirection =
    | "inwards"
    | "outwards"
    | ParticleVector3
    | (string & {});

/**
 * Axis or vector used by disc emitters.
 */
export type ParticlePlaneNormal =
    | "x"
    | "y"
    | "z"
    | ParticleVector3
    | (string & {});

/**
 * Emits particles from a rectangular box volume.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_box
 */
export interface ParticleEmitterShapeBoxData {
    /**
     * Half dimensions of the box.
     */
    half_dimensions: ParticleVector3;

    /**
     * Offset from the emitter origin.
     */
    offset?: ParticleVector3;

    /**
     * Emission direction.
     */
    direction?: ParticleEmitterDirection;

    /**
     * When true, emits only from the box surface.
     */
    surface_only?: boolean;

    /**
     * Future box-shape fields.
     */
    [key: string]: unknown;
}

/**
 * Emits particles from custom Molang-defined position and direction vectors.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_custom
 */
export interface ParticleEmitterShapeCustomData {
    /**
     * Spawn offset from the emitter origin.
     */
    offset?: ParticleVector3;

    /**
     * Initial direction vector.
     */
    direction?: ParticleVector3;

    /**
     * Future custom-shape fields.
     */
    [key: string]: unknown;
}

/**
 * Emits particles from a flat disc.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_disc
 */
export interface ParticleEmitterShapeDiscData {
    /**
     * Radius of the disc.
     */
    radius?: ParticleMolang;

    /**
     * Disc plane normal.
     */
    plane_normal?: ParticlePlaneNormal;

    /**
     * Offset from the emitter origin.
     */
    offset?: ParticleVector3;

    /**
     * Emission direction.
     */
    direction?: ParticleEmitterDirection;

    /**
     * When true, emits only from the disc edge.
     */
    surface_only?: boolean;

    /**
     * Future disc-shape fields.
     */
    [key: string]: unknown;
}

/**
 * Emits particles from an entity's axis-aligned bounding box.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_entity_aabb
 */
export interface ParticleEmitterShapeEntityAabbData {
    /**
     * Emission direction.
     */
    direction?: ParticleEmitterDirection;

    /**
     * When true, emits only from the bounding box surface.
     */
    surface_only?: boolean;

    /**
     * Future entity-AABB shape fields.
     */
    [key: string]: unknown;
}

/**
 * Emits particles from a point.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_point
 */
export interface ParticleEmitterShapePointData {
    /**
     * Initial direction vector.
     */
    direction?: ParticleVector3;

    /**
     * Offset from the emitter origin.
     */
    offset?: ParticleVector3;

    /**
     * Future point-shape fields.
     */
    [key: string]: unknown;
}

/**
 * Emits particles from a spherical volume.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/emitter_shape_sphere
 */
export interface ParticleEmitterShapeSphereData {
    /**
     * Sphere radius.
     */
    radius?: ParticleMolang;

    /**
     * Offset from the emitter origin.
     */
    offset?: ParticleVector3;

    /**
     * Emission direction.
     */
    direction?: ParticleEmitterDirection;

    /**
     * When true, emits only from the sphere surface.
     */
    surface_only?: boolean;

    /**
     * Future sphere-shape fields.
     */
    [key: string]: unknown;
}

/**
 * Initial particle speed as a scalar speed or vector.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_effect_component
 */
export type ParticleInitialSpeedData = ParticleMolang | ParticleVector3;

/**
 * Initial particle rotation and angular speed.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_initial_spin
 */
export interface ParticleInitialSpinData {
    /**
     * Initial rotation in degrees.
     */
    rotation?: ParticleMolang;

    /**
     * Rotation rate in degrees per second.
     */
    rotation_rate?: ParticleMolang;

    /**
     * Future initial-spin fields.
     */
    [key: string]: unknown;
}

/**
 * Per-particle initialization expressions.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_initialization
 */
export interface ParticleInitializationData {
    /**
     * Expression run every frame before particle update.
     */
    per_update_expression?: ParticleMolang;

    /**
     * Expression run every render frame.
     */
    per_render_expression?: ParticleMolang;

    /**
     * Future particle initialization fields.
     */
    [key: string]: unknown;
}

/**
 * Particle motion controlled by acceleration and drag.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_dynamic
 */
export interface ParticleMotionDynamicData {
    /**
     * Constant linear acceleration vector.
     */
    linear_acceleration?: ParticleVector3;

    /**
     * Linear drag coefficient.
     */
    linear_drag_coefficient?: ParticleMolang;

    /**
     * Angular acceleration.
     */
    rotation_acceleration?: ParticleMolang;

    /**
     * Angular drag coefficient.
     */
    rotation_drag_coefficient?: ParticleMolang;

    /**
     * Future dynamic motion fields.
     */
    [key: string]: unknown;
}

/**
 * Particle motion controlled by per-frame Molang expressions.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_parametric
 */
export interface ParticleMotionParametricData {
    /**
     * Particle position relative to the emitter.
     */
    relative_position?: ParticleVector3;

    /**
     * Direction vector.
     */
    direction?: ParticleVector3;

    /**
     * Rotation expression.
     */
    rotation?: ParticleMolang;

    /**
     * Future parametric motion fields.
     */
    [key: string]: unknown;
}

/**
 * Collision event fired by particle motion collision.
 */
export interface ParticleMotionCollisionEventData {
    /**
     * Event or events fired when the collision speed threshold is met.
     */
    event: ParticleEventReference;

    /**
     * Minimum collision speed required to fire the event.
     */
    min_speed?: number;

    /**
     * Future collision event fields.
     */
    [key: string]: unknown;
}

/**
 * Particle collision with world geometry.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_motion_collision
 */
export interface ParticleMotionCollisionData {
    /**
     * Whether collision is enabled; can be Molang.
     */
    enabled?: ParticleMolang;

    /**
     * Collision radius, documented as up to 0.5.
     */
    collision_radius: number;

    /**
     * Bounce coefficient after collision.
     */
    coefficient_of_restitution?: number;

    /**
     * Drag applied while colliding.
     */
    collision_drag?: number;

    /**
     * When true, particles expire on contact.
     */
    expire_on_contact?: boolean;

    /**
     * Events fired on collision.
     */
    events?: ParticleMotionCollisionEventData | ParticleMotionCollisionEventData[];

    /**
     * Future collision fields.
     */
    [key: string]: unknown;
}

/**
 * Particle billboard camera-facing modes.
 */
export type ParticleBillboardFacingCameraMode =
    | "lookat_xyz"
    | "lookat_y"
    | "lookat_direction"
    | "rotate_xyz"
    | "rotate_y"
    | "direction_x"
    | "direction_y"
    | "direction_z"
    | "emitter_transform_xy"
    | "emitter_transform_xz"
    | "emitter_transform_yz"
    | (string & {});

/**
 * Direction mode used by billboard rendering.
 */
export type ParticleBillboardDirectionMode =
    | "custom"
    | "derive_from_velocity"
    | (string & {});

/**
 * Billboard direction settings.
 */
export interface ParticleBillboardDirectionData {
    /**
     * Direction mode.
     */
    mode: ParticleBillboardDirectionMode;

    /**
     * Custom direction vector when `mode` is `custom`.
     */
    custom_direction?: ParticleVector3;

    /**
     * Minimum speed used by velocity-derived direction.
     */
    min_speed_threshold?: number;

    /**
     * Future direction settings fields.
     */
    [key: string]: unknown;
}

/**
 * Flipbook animation settings for billboard UVs.
 */
export interface ParticleBillboardFlipbookData {
    /**
     * Base UV coordinate of the first frame.
     */
    base_UV: ParticleVector2;

    /**
     * Frame size in UV pixels.
     */
    size_UV?: [number, number];

    /**
     * UV step from one frame to the next.
     */
    step_UV?: [number, number];

    /**
     * Frames per second.
     */
    frames_per_second?: number;

    /**
     * Maximum frame index or Molang expression.
     */
    max_frame: ParticleMolang;

    /**
     * When true, stretches the animation to particle lifetime.
     */
    stretch_to_lifetime?: boolean;

    /**
     * When true, loops the flipbook animation.
     */
    loop?: boolean;

    /**
     * Future flipbook fields.
     */
    [key: string]: unknown;
}

/**
 * Texture UV data for particle billboards.
 */
export interface ParticleUvData {
    /**
     * Texture width in pixels.
     */
    texture_width?: number;

    /**
     * Texture height in pixels.
     */
    texture_height?: number;

    /**
     * Top-left UV coordinate.
     */
    uv?: ParticleVector2;

    /**
     * UV region size.
     */
    uv_size?: ParticleVector2;

    /**
     * Optional flipbook animation.
     */
    flipbook?: ParticleBillboardFlipbookData;

    /**
     * Future UV fields.
     */
    [key: string]: unknown;
}

/**
 * Billboard sprite appearance.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_billboard
 */
export interface ParticleAppearanceBillboardData {
    /**
     * Billboard size as `[width, height]`.
     */
    size: ParticleVector2;

    /**
     * Camera-facing mode.
     */
    facing_camera_mode?: ParticleBillboardFacingCameraMode;

    /**
     * Optional direction settings.
     */
    direction?: ParticleBillboardDirectionData;

    /**
     * Optional UV and flipbook settings.
     */
    uv?: ParticleUvData;

    /**
     * Future billboard appearance fields.
     */
    [key: string]: unknown;
}

/**
 * Three-channel color value.
 */
export type ParticleRgbColor = [ParticleMolang, ParticleMolang, ParticleMolang];

/**
 * Four-channel color value.
 */
export type ParticleRgbaColor = [ParticleMolang, ParticleMolang, ParticleMolang, ParticleMolang];

/**
 * Solid particle color, either a hex string or channel array.
 */
export type ParticleSolidColor = string | ParticleRgbColor | ParticleRgbaColor;

/**
 * Particle color gradient, either an array of colors or a map keyed by time.
 */
export type ParticleColorGradient = ParticleSolidColor[] | Record<string, ParticleSolidColor>;

/**
 * Gradient color data sampled by a Molang interpolant.
 */
export interface ParticleColorGradientData {
    /**
     * Gradient values to sample.
     */
    gradient: ParticleColorGradient;

    /**
     * Molang value selecting the gradient position.
     */
    interpolant: ParticleMolang;

    /**
     * Future color gradient fields.
     */
    [key: string]: unknown;
}

/**
 * Particle color value accepted by tinting.
 */
export type ParticleColor = ParticleSolidColor | ParticleColorGradientData;

/**
 * Particle color tinting.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_tinting
 */
export interface ParticleAppearanceTintingData {
    /**
     * Solid color or gradient data.
     */
    color: ParticleColor;

    /**
     * Future tinting fields.
     */
    [key: string]: unknown;
}

/**
 * Enables scene lighting for particle rendering.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_appearance_lighting
 */
export interface ParticleAppearanceLightingData {
    /**
     * Future lighting fields.
     */
    [key: string]: unknown;
}

/**
 * Per-particle lifetime events.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
 */
export interface ParticleLifetimeEventsData {
    /**
     * Event or events fired when each particle is created.
     */
    creation_event?: ParticleEventReference;

    /**
     * Event or events fired when each particle expires.
     */
    expiration_event?: ParticleEventReference;

    /**
     * Events fired at times during each particle lifetime.
     */
    timeline?: ParticleTimelineData | ParticleEventReference;

    /**
     * Future particle lifetime event fields.
     */
    [key: string]: unknown;
}

/**
 * Per-particle lifetime expressions.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/examples/particlecomponents/particle_lifetime_expression
 */
export interface ParticleLifetimeExpressionData {
    /**
     * Maximum lifetime in seconds.
     */
    max_lifetime?: ParticleMolang;

    /**
     * Expires the particle when the expression is non-zero.
     */
    expiration_expression?: ParticleMolang;

    /**
     * Future lifetime expression fields.
     */
    [key: string]: unknown;
}

/**
 * Supported particle curve types.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particlecurves
 */
export type ParticleCurveType =
    | "linear"
    | "bezier"
    | "bezier_chain"
    | "catmull_rom"
    | (string & {});

/**
 * Bezier chain control node.
 */
export interface ParticleCurveBezierNodeData {
    /**
     * Node value.
     */
    value?: ParticleMolang;

    /**
     * Shared slope for both sides.
     */
    slope?: ParticleMolang;

    /**
     * Value used from the left side.
     */
    left_value?: ParticleMolang;

    /**
     * Value used from the right side.
     */
    right_value?: ParticleMolang;

    /**
     * Slope used from the left side.
     */
    left_slope?: ParticleMolang;

    /**
     * Slope used from the right side.
     */
    right_slope?: ParticleMolang;

    /**
     * Future curve node fields.
     */
    [key: string]: unknown;
}

/**
 * Linear, bezier, or catmull-rom particle curve.
 */
export interface ParticleCurveLinearData {
    /**
     * Curve type.
     */
    type: Exclude<ParticleCurveType, "bezier_chain">;

    /**
     * Molang input used to sample the curve.
     */
    input: ParticleMolang;

    /**
     * Curve nodes.
     */
    nodes: ParticleMolang[] | Record<string, ParticleMolang | ParticleCurveBezierNodeData>;

    /**
     * Horizontal input range.
     */
    horizontal_range?: ParticleMolang;

    /**
     * Future curve fields.
     */
    [key: string]: unknown;
}

/**
 * Bezier chain particle curve.
 */
export interface ParticleCurveBezierChainData {
    /**
     * Bezier chain curve type.
     */
    type: "bezier_chain";

    /**
     * Molang input used to sample the curve.
     */
    input: ParticleMolang;

    /**
     * Control nodes keyed by input position.
     */
    nodes: Record<string, ParticleCurveBezierNodeData>;

    /**
     * Future curve fields.
     */
    [key: string]: unknown;
}

/**
 * Particle curve data.
 */
export type ParticleCurveData = ParticleCurveLinearData | ParticleCurveBezierChainData;

/**
 * Named particle curve collection.
 */
export type ParticleCurvesData = Record<string, ParticleCurveData>;

/**
 * Type of particle effect spawned by an event node.
 */
export type ParticleVisualEffectEventType =
    | "emitter"
    | "emitter_bound"
    | "particle"
    | "particle_with_velocity"
    | (string & {});

/**
 * Visual particle effect event.
 */
export interface ParticleVisualEffectEventData {
    /**
     * Particle effect identifier to spawn.
     */
    effect: ParticleIdentifier;

    /**
     * How the referenced effect is spawned.
     */
    type: ParticleVisualEffectEventType;

    /**
     * Molang expression run before spawning the effect.
     */
    pre_effect_expression?: ParticleMolang;

    /**
     * Future visual effect event fields.
     */
    [key: string]: unknown;
}

/**
 * Sound event node payload.
 */
export interface ParticleSoundEffectEventData {
    /**
     * Sound event name.
     */
    event_name: string;

    /**
     * Future sound effect fields.
     */
    [key: string]: unknown;
}

/**
 * Particle event node.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/particlesreference/particleeffectevents
 */
export interface ParticleEventNodeData {
    /**
     * Molang expression to run when the event fires.
     */
    expression?: ParticleMolang;

    /**
     * Content log message emitted when the event fires.
     */
    log?: string;

    /**
     * Visual particle effect to spawn.
     */
    particle_effect?: ParticleVisualEffectEventData;

    /**
     * Sound event to play.
     */
    sound_effect?: ParticleSoundEffectEventData;

    /**
     * Event nodes run in order.
     */
    sequence?: ParticleEventNodeData[];

    /**
     * Weighted random event nodes.
     */
    randomize?: ParticleRandomEventNodeData[];

    /**
     * Future event node fields.
     */
    [key: string]: unknown;
}

/**
 * Weighted random particle event node.
 */
export interface ParticleRandomEventNodeData extends ParticleEventNodeData {
    /**
     * Random selection weight.
     */
    weight?: number;
}

/**
 * Named particle event collection.
 */
export type ParticleEventsData = Record<string, ParticleEventNodeData>;
