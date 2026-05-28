/**
 * Data accepted by a raw server entity component.
 *
 * Entity components are very broad: marker components are `{}`, numeric
 * resource components often use numbers or ranges, and behavior components
 * usually use object payloads.
 */
export type EntityComponentData = object | string | number | boolean;

/**
 * Server entity component ids from the Microsoft Creator entity component
 * schema. `EntityComponents` exposes these as generated `addXyz(...)`
 * methods.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/aigoallist
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/triggerlist
 */
export enum EntityComponentIds {
    Absorption = "minecraft:absorption",
    Addrider = "minecraft:addrider",
    AdmireItem = "minecraft:admire_item",
    Ageable = "minecraft:ageable",
    AirDragModifier = "minecraft:air_drag_modifier",
    AmbientSoundInterval = "minecraft:ambient_sound_interval",
    AngerLevel = "minecraft:anger_level",
    Angry = "minecraft:angry",
    AnnotationBreakDoor = "minecraft:annotation.break_door",
    AnnotationOpenDoor = "minecraft:annotation.open_door",
    ApplyKnockbackRules = "minecraft:apply_knockback_rules",
    ApplyKnockbackRulesInstance = "minecraft:apply_knockback_rules_instance",
    AreaAttack = "minecraft:area_attack",
    Attack = "minecraft:attack",
    AttackCooldown = "minecraft:attack_cooldown",
    AttackDamage = "minecraft:attack_damage",
    Balloon = "minecraft:balloon",
    Balloonable = "minecraft:balloonable",
    Barter = "minecraft:barter",
    BehaviorAdmireItem = "minecraft:behavior.admire_item",
    BehaviorAquaticChargeAttack = "minecraft:behavior.aquatic_charge_attack",
    BehaviorAvoidBlock = "minecraft:behavior.avoid_block",
    BehaviorAvoidMobType = "minecraft:behavior.avoid_mob_type",
    BehaviorBarter = "minecraft:behavior.barter",
    BehaviorBeg = "minecraft:behavior.beg",
    BehaviorBreakDoor = "minecraft:behavior.break_door",
    BehaviorBreed = "minecraft:behavior.breed",
    BehaviorCelebrate = "minecraft:behavior.celebrate",
    BehaviorCelebrateSurvive = "minecraft:behavior.celebrate_survive",
    BehaviorChargeAttack = "minecraft:behavior.charge_attack",
    BehaviorChargeHeldItem = "minecraft:behavior.charge_held_item",
    BehaviorCircleAroundAnchor = "minecraft:behavior.circle_around_anchor",
    BehaviorControlledByPlayer = "minecraft:behavior.controlled_by_player",
    BehaviorCroak = "minecraft:behavior.croak",
    BehaviorDefendTrustedTarget = "minecraft:behavior.defend_trusted_target",
    BehaviorDefendVillageTarget = "minecraft:behavior.defend_village_target",
    BehaviorDelayedAttack = "minecraft:behavior.delayed_attack",
    BehaviorDig = "minecraft:behavior.dig",
    BehaviorDoorInteract = "minecraft:behavior.door_interact",
    BehaviorDragonchargeplayer = "minecraft:behavior.dragonchargeplayer",
    BehaviorDragondeath = "minecraft:behavior.dragondeath",
    BehaviorDragonflaming = "minecraft:behavior.dragonflaming",
    BehaviorDragonholdingpattern = "minecraft:behavior.dragonholdingpattern",
    BehaviorDragonlanding = "minecraft:behavior.dragonlanding",
    BehaviorDragonscanning = "minecraft:behavior.dragonscanning",
    BehaviorDragonstrafeplayer = "minecraft:behavior.dragonstrafeplayer",
    BehaviorDragontakeoff = "minecraft:behavior.dragontakeoff",
    BehaviorDrinkMilk = "minecraft:behavior.drink_milk",
    BehaviorDrinkPotion = "minecraft:behavior.drink_potion",
    BehaviorDropItemFor = "minecraft:behavior.drop_item_for",
    BehaviorEatBlock = "minecraft:behavior.eat_block",
    BehaviorEatCarriedItem = "minecraft:behavior.eat_carried_item",
    BehaviorEatMob = "minecraft:behavior.eat_mob",
    BehaviorEmerge = "minecraft:behavior.emerge",
    BehaviorEndermanLeaveBlock = "minecraft:behavior.enderman_leave_block",
    BehaviorEndermanTakeBlock = "minecraft:behavior.enderman_take_block",
    BehaviorEquipItem = "minecraft:behavior.equip_item",
    BehaviorExploreOutskirts = "minecraft:behavior.explore_outskirts",
    BehaviorFertilizeFarmBlock = "minecraft:behavior.fertilize_farm_block",
    BehaviorFindCover = "minecraft:behavior.find_cover",
    BehaviorFindMount = "minecraft:behavior.find_mount",
    BehaviorFindUnderwaterTreasure = "minecraft:behavior.find_underwater_treasure",
    BehaviorFireAtTarget = "minecraft:behavior.fire_at_target",
    BehaviorFleeSun = "minecraft:behavior.flee_sun",
    BehaviorFloat = "minecraft:behavior.float",
    BehaviorFloatTempt = "minecraft:behavior.float_tempt",
    BehaviorFloatWander = "minecraft:behavior.float_wander",
    BehaviorFollowCaravan = "minecraft:behavior.follow_caravan",
    BehaviorFollowMob = "minecraft:behavior.follow_mob",
    BehaviorFollowOwner = "minecraft:behavior.follow_owner",
    BehaviorFollowParent = "minecraft:behavior.follow_parent",
    BehaviorFollowTargetCaptain = "minecraft:behavior.follow_target_captain",
    BehaviorFollowTargetLeader = "minecraft:behavior.follow_target_leader",
    BehaviorGoAndGiveItemsToNoteblock = "minecraft:behavior.go_and_give_items_to_noteblock",
    BehaviorGoAndGiveItemsToOwner = "minecraft:behavior.go_and_give_items_to_owner",
    BehaviorGoHome = "minecraft:behavior.go_home",
    BehaviorGuardianAttack = "minecraft:behavior.guardian_attack",
    BehaviorHarvestFarmBlock = "minecraft:behavior.harvest_farm_block",
    BehaviorHide = "minecraft:behavior.hide",
    BehaviorHoldGround = "minecraft:behavior.hold_ground",
    BehaviorHover = "minecraft:behavior.hover",
    BehaviorHurtByTarget = "minecraft:behavior.hurt_by_target",
    BehaviorInspectBookshelf = "minecraft:behavior.inspect_bookshelf",
    BehaviorInvestigateSuspiciousLocation = "minecraft:behavior.investigate_suspicious_location",
    BehaviorJumpAroundTarget = "minecraft:behavior.jump_around_target",
    BehaviorJumpToBlock = "minecraft:behavior.jump_to_block",
    BehaviorKnockbackRoar = "minecraft:behavior.knockback_roar",
    BehaviorLayDown = "minecraft:behavior.lay_down",
    BehaviorLayEgg = "minecraft:behavior.lay_egg",
    BehaviorLeapAtTarget = "minecraft:behavior.leap_at_target",
    BehaviorLookAtEntity = "minecraft:behavior.look_at_entity",
    BehaviorLookAtPlayer = "minecraft:behavior.look_at_player",
    BehaviorLookAtTarget = "minecraft:behavior.look_at_target",
    BehaviorLookAtTradingPlayer = "minecraft:behavior.look_at_trading_player",
    BehaviorMakeLove = "minecraft:behavior.make_love",
    BehaviorMeleeAttack = "minecraft:behavior.melee_attack",
    BehaviorMeleeBoxAttack = "minecraft:behavior.melee_box_attack",
    BehaviorMingle = "minecraft:behavior.mingle",
    BehaviorMountPathing = "minecraft:behavior.mount_pathing",
    BehaviorMoveAroundTarget = "minecraft:behavior.move_around_target",
    BehaviorMoveIndoors = "minecraft:behavior.move_indoors",
    BehaviorMoveOutdoors = "minecraft:behavior.move_outdoors",
    BehaviorMoveThroughVillage = "minecraft:behavior.move_through_village",
    BehaviorMoveToBlock = "minecraft:behavior.move_to_block",
    BehaviorMoveToLand = "minecraft:behavior.move_to_land",
    BehaviorMoveToLava = "minecraft:behavior.move_to_lava",
    BehaviorMoveToLiquid = "minecraft:behavior.move_to_liquid",
    BehaviorMoveToPoi = "minecraft:behavior.move_to_poi",
    BehaviorMoveToRandomBlock = "minecraft:behavior.move_to_random_block",
    BehaviorMoveToVillage = "minecraft:behavior.move_to_village",
    BehaviorMoveToWater = "minecraft:behavior.move_to_water",
    BehaviorMoveTowardsDwellingRestriction = "minecraft:behavior.move_towards_dwelling_restriction",
    BehaviorMoveTowardsHomeRestriction = "minecraft:behavior.move_towards_home_restriction",
    BehaviorMoveTowardsRestriction = "minecraft:behavior.move_towards_restriction",
    BehaviorMoveTowardsTarget = "minecraft:behavior.move_towards_target",
    BehaviorNap = "minecraft:behavior.nap",
    BehaviorNearestAttackableTarget = "minecraft:behavior.nearest_attackable_target",
    BehaviorNearestPrioritizedAttackableTarget = "minecraft:behavior.nearest_prioritized_attackable_target",
    BehaviorOcelotSitOnBlock = "minecraft:behavior.ocelot_sit_on_block",
    BehaviorOcelotattack = "minecraft:behavior.ocelotattack",
    BehaviorOfferFlower = "minecraft:behavior.offer_flower",
    BehaviorOpenDoor = "minecraft:behavior.open_door",
    BehaviorOwnerHurtByTarget = "minecraft:behavior.owner_hurt_by_target",
    BehaviorOwnerHurtTarget = "minecraft:behavior.owner_hurt_target",
    BehaviorPanic = "minecraft:behavior.panic",
    BehaviorPetSleepWithOwner = "minecraft:behavior.pet_sleep_with_owner",
    BehaviorPickupItems = "minecraft:behavior.pickup_items",
    BehaviorPlaceBlock = "minecraft:behavior.place_block",
    BehaviorPlay = "minecraft:behavior.play",
    BehaviorPlayDead = "minecraft:behavior.play_dead",
    BehaviorPlayerRideTamed = "minecraft:behavior.player_ride_tamed",
    BehaviorRaidGarden = "minecraft:behavior.raid_garden",
    BehaviorRamAttack = "minecraft:behavior.ram_attack",
    BehaviorRandomBreach = "minecraft:behavior.random_breach",
    BehaviorRandomFly = "minecraft:behavior.random_fly",
    BehaviorRandomHover = "minecraft:behavior.random_hover",
    BehaviorRandomLookAround = "minecraft:behavior.random_look_around",
    BehaviorRandomLookAroundAndSit = "minecraft:behavior.random_look_around_and_sit",
    BehaviorRandomSearchAndDig = "minecraft:behavior.random_search_and_dig",
    BehaviorRandomSitting = "minecraft:behavior.random_sitting",
    BehaviorRandomStroll = "minecraft:behavior.random_stroll",
    BehaviorRandomSwim = "minecraft:behavior.random_swim",
    BehaviorRangedAttack = "minecraft:behavior.ranged_attack",
    BehaviorReceiveLove = "minecraft:behavior.receive_love",
    BehaviorRestrictOpenDoor = "minecraft:behavior.restrict_open_door",
    BehaviorRestrictSun = "minecraft:behavior.restrict_sun",
    BehaviorRiseToLiquidLevel = "minecraft:behavior.rise_to_liquid_level",
    BehaviorRoar = "minecraft:behavior.roar",
    BehaviorRoll = "minecraft:behavior.roll",
    BehaviorRunAroundLikeCrazy = "minecraft:behavior.run_around_like_crazy",
    BehaviorScared = "minecraft:behavior.scared",
    BehaviorSendEvent = "minecraft:behavior.send_event",
    BehaviorShareItems = "minecraft:behavior.share_items",
    BehaviorSilverfishMergeWithStone = "minecraft:behavior.silverfish_merge_with_stone",
    BehaviorSilverfishWakeUpFriends = "minecraft:behavior.silverfish_wake_up_friends",
    BehaviorSkeletonHorseTrap = "minecraft:behavior.skeleton_horse_trap",
    BehaviorSleep = "minecraft:behavior.sleep",
    BehaviorSlimeAttack = "minecraft:behavior.slime_attack",
    BehaviorSlimeFloat = "minecraft:behavior.slime_float",
    BehaviorSlimeKeepOnJumping = "minecraft:behavior.slime_keep_on_jumping",
    BehaviorSlimeRandomDirection = "minecraft:behavior.slime_random_direction",
    BehaviorSnacking = "minecraft:behavior.snacking",
    BehaviorSneeze = "minecraft:behavior.sneeze",
    BehaviorSniff = "minecraft:behavior.sniff",
    BehaviorSonicBoom = "minecraft:behavior.sonic_boom",
    BehaviorSquidDive = "minecraft:behavior.squid_dive",
    BehaviorSquidFlee = "minecraft:behavior.squid_flee",
    BehaviorSquidIdle = "minecraft:behavior.squid_idle",
    BehaviorSquidMoveAwayFromGround = "minecraft:behavior.squid_move_away_from_ground",
    BehaviorSquidOutOfWater = "minecraft:behavior.squid_out_of_water",
    BehaviorStalkAndPounceOnTarget = "minecraft:behavior.stalk_and_pounce_on_target",
    BehaviorStayNearNoteblock = "minecraft:behavior.stay_near_noteblock",
    BehaviorStayWhileSitting = "minecraft:behavior.stay_while_sitting",
    BehaviorStompAttack = "minecraft:behavior.stomp_attack",
    BehaviorStompTurtleEgg = "minecraft:behavior.stomp_turtle_egg",
    BehaviorStrollTowardsVillage = "minecraft:behavior.stroll_towards_village",
    BehaviorSummonEntity = "minecraft:behavior.summon_entity",
    BehaviorSwell = "minecraft:behavior.swell",
    BehaviorSwimIdle = "minecraft:behavior.swim_idle",
    BehaviorSwimUpForBreath = "minecraft:behavior.swim_up_for_breath",
    BehaviorSwimWander = "minecraft:behavior.swim_wander",
    BehaviorSwimWithEntity = "minecraft:behavior.swim_with_entity",
    BehaviorSwoopAttack = "minecraft:behavior.swoop_attack",
    BehaviorTakeBlock = "minecraft:behavior.take_block",
    BehaviorTakeFlower = "minecraft:behavior.take_flower",
    BehaviorTargetWhenPushed = "minecraft:behavior.target_when_pushed",
    BehaviorTeleportToOwner = "minecraft:behavior.teleport_to_owner",
    BehaviorTempt = "minecraft:behavior.tempt",
    BehaviorTimerFlag1 = "minecraft:behavior.timer_flag_1",
    BehaviorTimerFlag2 = "minecraft:behavior.timer_flag_2",
    BehaviorTimerFlag3 = "minecraft:behavior.timer_flag_3",
    BehaviorTradeInterest = "minecraft:behavior.trade_interest",
    BehaviorTradeWithPlayer = "minecraft:behavior.trade_with_player",
    BehaviorTransportItems = "minecraft:behavior.transport_items",
    BehaviorUseKineticWeapon = "minecraft:behavior.use_kinetic_weapon",
    BehaviorVexCopyOwnerTarget = "minecraft:behavior.vex_copy_owner_target",
    BehaviorVexRandomMove = "minecraft:behavior.vex_random_move",
    BehaviorWitherRandomAttackPosGoal = "minecraft:behavior.wither_random_attack_pos_goal",
    BehaviorWitherTargetHighestDamage = "minecraft:behavior.wither_target_highest_damage",
    BehaviorWork = "minecraft:behavior.work",
    BehaviorWorkComposter = "minecraft:behavior.work_composter",
    BlockClimber = "minecraft:block_climber",
    BlockSensor = "minecraft:block_sensor",
    BodyRotationAlwaysFollowsHead = "minecraft:body_rotation_always_follows_head",
    BodyRotationAxisAligned = "minecraft:body_rotation_axis_aligned",
    BodyRotationBlocked = "minecraft:body_rotation_blocked",
    BodyRotationLockedToVehicle = "minecraft:body_rotation_locked_to_vehicle",
    Boostable = "minecraft:boostable",
    Boss = "minecraft:boss",
    Bounciness = "minecraft:bounciness",
    BreakBlocks = "minecraft:break_blocks",
    Breathable = "minecraft:breathable",
    Breedable = "minecraft:breedable",
    Bribeable = "minecraft:bribeable",
    Bucketable = "minecraft:bucketable",
    Buoyant = "minecraft:buoyant",
    BurnsInDaylight = "minecraft:burns_in_daylight",
    CanClimb = "minecraft:can_climb",
    CanFly = "minecraft:can_fly",
    CanJoinRaid = "minecraft:can_join_raid",
    CanPowerJump = "minecraft:can_power_jump",
    CannotBeAttacked = "minecraft:cannot_be_attacked",
    CelebrateHunt = "minecraft:celebrate_hunt",
    CollisionBox = "minecraft:collision_box",
    Color = "minecraft:color",
    Color2 = "minecraft:color2",
    CombatRegeneration = "minecraft:combat_regeneration",
    ConditionalBandwidthOptimization = "minecraft:conditional_bandwidth_optimization",
    CustomHitTest = "minecraft:custom_hit_test",
    DamageOverTime = "minecraft:damage_over_time",
    DamageSensor = "minecraft:damage_sensor",
    Dash = "minecraft:dash",
    DashAction = "minecraft:dash_action",
    DefaultLookAngle = "minecraft:default_look_angle",
    Despawn = "minecraft:despawn",
    DimensionBound = "minecraft:dimension_bound",
    DryingOutTimer = "minecraft:drying_out_timer",
    Dweller = "minecraft:dweller",
    EconomyTradeTable = "minecraft:economy_trade_table",
    EntityArmorEquipmentSlotMapping = "minecraft:entity_armor_equipment_slot_mapping",
    EntitySensor = "minecraft:entity_sensor",
    EnvironmentSensor = "minecraft:environment_sensor",
    EquipItem = "minecraft:equip_item",
    Equipment = "minecraft:equipment",
    Equippable = "minecraft:equippable",
    ExhaustionValues = "minecraft:exhaustion_values",
    ExperienceReward = "minecraft:experience_reward",
    Explode = "minecraft:explode",
    FireImmune = "minecraft:fire_immune",
    FloatsInLiquid = "minecraft:floats_in_liquid",
    Flocking = "minecraft:flocking",
    FlyingSpeed = "minecraft:flying_speed",
    FollowRange = "minecraft:follow_range",
    FreeCameraControlled = "minecraft:free_camera_controlled",
    FrictionModifier = "minecraft:friction_modifier",
    GameEventMovementTracking = "minecraft:game_event_movement_tracking",
    Genetics = "minecraft:genetics",
    Giveable = "minecraft:giveable",
    GroundOffset = "minecraft:ground_offset",
    GroupSize = "minecraft:group_size",
    GrowsCrop = "minecraft:grows_crop",
    Healable = "minecraft:healable",
    Health = "minecraft:health",
    Heartbeat = "minecraft:heartbeat",
    Hide = "minecraft:hide",
    Home = "minecraft:home",
    HorseJumpStrength = "minecraft:horse.jump_strength",
    HurtOnCondition = "minecraft:hurt_on_condition",
    IgnoreCannotBeAttacked = "minecraft:ignore_cannot_be_attacked",
    InputAirControlled = "minecraft:input_air_controlled",
    InputGroundControlled = "minecraft:input_ground_controlled",
    InsideBlockNotifier = "minecraft:inside_block_notifier",
    Insomnia = "minecraft:insomnia",
    InstantDespawn = "minecraft:instant_despawn",
    Interact = "minecraft:interact",
    Inventory = "minecraft:inventory",
    IsBaby = "minecraft:is_baby",
    IsCharged = "minecraft:is_charged",
    IsChested = "minecraft:is_chested",
    IsCollidable = "minecraft:is_collidable",
    IsDyeable = "minecraft:is_dyeable",
    IsHiddenWhenInvisible = "minecraft:is_hidden_when_invisible",
    IsIgnited = "minecraft:is_ignited",
    IsIllagerCaptain = "minecraft:is_illager_captain",
    IsPregnant = "minecraft:is_pregnant",
    IsSaddled = "minecraft:is_saddled",
    IsShaking = "minecraft:is_shaking",
    IsSheared = "minecraft:is_sheared",
    IsStackable = "minecraft:is_stackable",
    IsStunned = "minecraft:is_stunned",
    IsTamed = "minecraft:is_tamed",
    ItemControllable = "minecraft:item_controllable",
    ItemHopper = "minecraft:item_hopper",
    JumpDynamic = "minecraft:jump.dynamic",
    JumpStatic = "minecraft:jump.static",
    KnockbackResistance = "minecraft:knockback_resistance",
    LavaMovement = "minecraft:lava_movement",
    Leashable = "minecraft:leashable",
    LeashableTo = "minecraft:leashable_to",
    LookedAt = "minecraft:looked_at",
    Loot = "minecraft:loot",
    Luck = "minecraft:luck",
    ManagedWanderingTrader = "minecraft:managed_wandering_trader",
    MarkVariant = "minecraft:mark_variant",
    MemoryBehaviorFleeThreat = "minecraft:memory_behavior.flee_threat",
    MemoryBehaviorFollowTarget = "minecraft:memory_behavior.follow_target",
    MemoryBehaviorMoveToPosition = "minecraft:memory_behavior.move_to_position",
    MemorySensorFindNearestEntity = "minecraft:memory_sensor.find_nearest_entity",
    MemorySensorFindNearestEntityFrom = "minecraft:memory_sensor.find_nearest_entity_from",
    MemorySensorFindNearestPoi = "minecraft:memory_sensor.find_nearest_poi",
    MemorySensorInRangeOfBlock = "minecraft:memory_sensor.in_range_of_block",
    MemorySensorInRangeOfEntity = "minecraft:memory_sensor.in_range_of_entity",
    MobEffect = "minecraft:mob_effect",
    MobEffectImmunity = "minecraft:mob_effect_immunity",
    Movement = "minecraft:movement",
    MovementAmphibious = "minecraft:movement.amphibious",
    MovementBasic = "minecraft:movement.basic",
    MovementDolphin = "minecraft:movement.dolphin",
    MovementFly = "minecraft:movement.fly",
    MovementGeneric = "minecraft:movement.generic",
    MovementGlide = "minecraft:movement.glide",
    MovementHover = "minecraft:movement.hover",
    MovementJump = "minecraft:movement.jump",
    MovementSkip = "minecraft:movement.skip",
    MovementSway = "minecraft:movement.sway",
    MovementSoundDistanceOffset = "minecraft:movement.sound_distance_offset",
    MovementSoundDistanceOffsetLegacy = "minecraft:movement_sound_distance_offset",
    Nameable = "minecraft:nameable",
    NavigationClimb = "minecraft:navigation.climb",
    NavigationFloat = "minecraft:navigation.float",
    NavigationFly = "minecraft:navigation.fly",
    NavigationGeneric = "minecraft:navigation.generic",
    NavigationHover = "minecraft:navigation.hover",
    NavigationSwim = "minecraft:navigation.swim",
    NavigationWalk = "minecraft:navigation.walk",
    Npc = "minecraft:npc",
    Offspring = "minecraft:offspring",
    OnDeath = "minecraft:on_death",
    OnEquipmentChanged = "minecraft:on_equipment_changed",
    OnFriendlyAnger = "minecraft:on_friendly_anger",
    OnHurt = "minecraft:on_hurt",
    OnHurtByPlayer = "minecraft:on_hurt_by_player",
    OnIgnite = "minecraft:on_ignite",
    OnStartLanding = "minecraft:on_start_landing",
    OnStartTakeoff = "minecraft:on_start_takeoff",
    OnTargetAcquired = "minecraft:on_target_acquired",
    OnTargetEscape = "minecraft:on_target_escape",
    OnWakeWithOwner = "minecraft:on_wake_with_owner",
    OutOfControl = "minecraft:out_of_control",
    Peek = "minecraft:peek",
    Persistent = "minecraft:persistent",
    Physics = "minecraft:physics",
    PlayerExhaustion = "minecraft:player.exhaustion",
    PlayerExperience = "minecraft:player.experience",
    PlayerHunger = "minecraft:player.hunger",
    PlayerLevel = "minecraft:player.level",
    PlayerSaturation = "minecraft:player.saturation",
    PreferredPath = "minecraft:preferred_path",
    Projectile = "minecraft:projectile",
    PushThrough = "minecraft:push_through",
    Pushable = "minecraft:pushable",
    PushableByBlock = "minecraft:pushable_by_block",
    PushableByEntity = "minecraft:pushable_by_entity",
    RaidTrigger = "minecraft:raid_trigger",
    RailMovement = "minecraft:rail_movement",
    RailSensor = "minecraft:rail_sensor",
    RavagerBlocked = "minecraft:ravager_blocked",
    ReflectProjectiles = "minecraft:reflect_projectiles",
    RemoveInPeaceful = "minecraft:remove_in_peaceful",
    RendersWhenInvisible = "minecraft:renders_when_invisible",
    Rideable = "minecraft:rideable",
    RotationAxisAligned = "minecraft:rotation_axis_aligned",
    RotationLockedToVehicle = "minecraft:rotation_locked_to_vehicle",
    ScaffoldingClimber = "minecraft:scaffolding_climber",
    Scale = "minecraft:scale",
    ScaleByAge = "minecraft:scale_by_age",
    Scheduler = "minecraft:scheduler",
    Shareables = "minecraft:shareables",
    Shooter = "minecraft:shooter",
    Sittable = "minecraft:sittable",
    SkinId = "minecraft:skin_id",
    SoundVolume = "minecraft:sound_volume",
    SpawnEggInteraction = "minecraft:spawn_egg_interaction",
    SpawnEntity = "minecraft:spawn_entity",
    SpawnOnDeath = "minecraft:spawn_on_death",
    SpellEffects = "minecraft:spell_effects",
    Strength = "minecraft:strength",
    SuspectTracking = "minecraft:suspect_tracking",
    Tameable = "minecraft:tameable",
    Tamemount = "minecraft:tamemount",
    TargetNearbySensor = "minecraft:target_nearby_sensor",
    Teleport = "minecraft:teleport",
    TickWorld = "minecraft:tick_world",
    Timer = "minecraft:timer",
    TradeResupply = "minecraft:trade_resupply",
    TradeTable = "minecraft:trade_table",
    Trail = "minecraft:trail",
    Transformation = "minecraft:transformation",
    Transient = "minecraft:transient",
    Trust = "minecraft:trust",
    Trusting = "minecraft:trusting",
    TypeFamily = "minecraft:type_family",
    UnderwaterMountBreathing = "minecraft:underwater_mount_breathing",
    UnderwaterMovement = "minecraft:underwater_movement",
    UsesLegacyFriction = "minecraft:uses_legacy_friction",
    UsesUniformAirDrag = "minecraft:uses_uniform_air_drag",
    VariableMaxAutoStep = "minecraft:variable_max_auto_step",
    Variant = "minecraft:variant",
    VerticalMovementAction = "minecraft:vertical_movement_action",
    VibrationDamper = "minecraft:vibration_damper",
    VibrationListener = "minecraft:vibration_listener",
    WalkAnimationSpeed = "minecraft:walk_animation_speed",
    WantsJockey = "minecraft:wants_jockey",
    WaterMovement = "minecraft:water_movement",
    WitherTargetHighestDamage = "minecraft:wither_target_highest_damage",
}

export type EntityComponentId = `${EntityComponentIds}`;

export type EntityProperty = { client_sync?: boolean } & (
    { type: "bool"; default: boolean } |
    { type: "float"; default: number; range: [number | string, number | string] } |
    { type: "int"; default: number; range: [number, number] } |
    { type: "enum"; default: number; values: string[] }
);

export type EntityFilterSubject =
    | "self"
    | "other"
    | "player"
    | "target"
    | "parent"
    | "baby"
    | "damager"
    | "block";

export type EntityFilterOperator =
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "equals"
    | "not"
    | "is"
    | "is_not";

export interface EntityFilter {
    test: string;
    subject?: EntityFilterSubject | string;
    operator?: EntityFilterOperator | string;
    value?: unknown;
    domain?: string;
}

export type EntityFilterGroup = EntityFilter | {
    all_of?: EntityFilterGroup[];
    any_of?: EntityFilterGroup[];
    none_of?: EntityFilterGroup[];
};

export interface EntityEventTrigger {
    event?: string;
    target?: EntityFilterSubject | string;
    filters?: EntityFilterGroup;
}

export type EntityInventoryContainerType =
    | "none"
    | "horse"
    | "minecart_chest"
    | "chest_boat"
    | "minecart_hopper"
    | "inventory"
    | "container"
    | "hopper"
    | string;

export interface EntityInventoryOptions {
    inventory_size: number;
    additional_slots_per_strength?: number;
    can_be_siphoned_from?: boolean;
    container_type?: EntityInventoryContainerType;
    private?: boolean;
    restrict_to_owner?: boolean;
}

export interface EntityHealthOptions {
    min?: number;
    max?: number;
    value?: number | {
        range_min?: number;
        range_max?: number;
    };
}

export interface EntityCollisionBoxOptions {
    height: number;
    width: number;
}

export interface EntityPhysicsOptions {
    has_collision?: boolean;
    has_gravity?: boolean;
    push_towards_closest_space?: boolean;
}

export interface EntityBreathableOptions {
    breathes_air?: boolean;
    breathes_lava?: boolean;
    breathes_solids?: boolean;
    breathes_water?: boolean;
    generates_bubbles?: boolean;
    inhale_time?: number;
    suffocate_time?: number;
    total_supply?: number;
    breathe_blocks?: string[];
    non_breathe_blocks?: string[];
}

export interface EntityPushableOptions {
    is_pushable?: boolean;
    is_pushable_by_piston?: boolean;
}

export type EntityDamageDealtMode =
    | boolean
    | "yes"
    | "no"
    | "no_but_side_effects_apply"
    | "no_but_entity_effects_apply";

export interface EntityDamageSensorTrigger {
    cause?: string;
    damage_modifier?: number;
    damage_multiplier?: number;
    deals_damage?: EntityDamageDealtMode;
    event?: string;
    filters?: EntityFilterGroup;
    on_damage?: EntityEventTrigger;
    on_damage_sound_event?: string;
}

export interface EntityDamageSensorData {
    triggers?: EntityDamageSensorTrigger | EntityDamageSensorTrigger[];
    deals_damage?: EntityDamageDealtMode;
}
