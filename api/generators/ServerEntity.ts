import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import {
    type EntityBreathableOptions,
    type EntityCollisionBoxOptions,
    type EntityComponentData,
    type EntityComponentId,
    type EntityDamageSensorData,
    type EntityDamageSensorTrigger,
    type EntityHealthOptions,
    type EntityInventoryOptions,
    type EntityPhysicsOptions,
    type EntityProperty,
    type EntityPushableOptions,
} from "./EntityComponentTypes.ts";

export * from "./EntityComponentTypes.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ServerEntityGenerator extends GeneratorFactory<ServerEntityDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/entities");
    }

    /**
     * Creates and stores a new behavior-pack entity definition.
     *
     * The final identifier is built as `projectNamespace:id`.
     */
    makeEntity(id: string): ServerEntityDef {
        const def = new ServerEntityDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

/**
 * Behavior-pack server entity definition.
 *
 * Generated files are written under `BP/entities`.
 */
export class ServerEntityDef extends GeneratorBase<ServerEntityDef> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.21.70",
            "minecraft:entity": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "components": {}
            }
        };
    }

    /**
     * Merges a component builder into this entity's root `components` object.
     */
    addComponents(components: EntityComponents): this {
        const existingComponents = this.getValueAtPath<Record<string, unknown>>("minecraft:entity/components", {});
        const newComponents = components.toJson();

        for (const key in newComponents) {
            existingComponents[key] = newComponents[key];
        }

        this.setValueAtPath("minecraft:entity/components", existingComponents);
        return this;
    }

    /**
     * Sets whether or not this entity has a spawn egg in the creative ui.
     */
    setSpawnability(spawnable: boolean): this {
        this.setValueAtPath("minecraft:entity/description/is_spawnable", spawnable);
        return this;
    }

    /**
     * Sets whether or not this entity can be summoned with commands such as `/summon`.
     */
    setSummonable(summonable: boolean): this {
        this.setValueAtPath("minecraft:entity/description/is_summonable", summonable);
        return this;
    }

    /**
     * Adds an event definition under `minecraft:entity.events`.
     */
    addEvent(eventID: string, data: unknown): this {
        this.setValueAtPath(`minecraft:entity/events/${eventID}`, data);
        return this;
    }

    /**
     * Adds a named component group under `minecraft:entity.component_groups`.
     */
    addComponentGroup(groupID: string, components: EntityComponents): this {
        this.setValueAtPath(`minecraft:entity/component_groups/${groupID}`, components.toJson());
        return this;
    }

    /**
     * Adds a custom entity property under `description.properties`.
     *
     * Float properties are serialized with unquoted range values to match the
     * entity property syntax Minecraft expects.
     */
    addProperty(propertyID: string, data: EntityProperty): this {
        if (data.type === "float") {
            const v = data.default;
            this.setValueAtPath(`minecraft:entity/description/properties/${propertyID}`, {
                ...data,
                default: `(${Number.isInteger(v) ? v.toFixed(1) : v})`
            });
        } else {
            this.setValueAtPath(`minecraft:entity/description/properties/${propertyID}`, data);
        }

        return this;
    }

    public override toString(): string {
        const json = JSON.stringify(this.data, function(key, value) {
            const parent = this as Record<string, unknown>;
            if (key === "range" && parent?.type === "float" && Array.isArray(value)) {
                return (value as Array<number | string>).map((v) =>
                    `__FLOAT__${typeof v === "number" && Number.isInteger(v) ? v.toFixed(1) : v}__`
                );
            }

            return value;
        });

        return json.replace(/"__FLOAT__([^"]+)__"/g, "$1");
    }
}

export class EntityComponents extends GeneratorBase<EntityComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    /**
     * Raw escape hatch for adding any server entity component shape.
     *
     * Prefer the dedicated `addXyz(...)` helpers when one exists. Use this
     * method for custom data, newly released components, or component data that
     * is clearer to express directly.
     *
     * @example
     * ```ts
     * new EntityComponents().addComponent("minecraft:scale", { value: 2 });
     * ```
     */
    addComponent(id: EntityComponentId | string, data: EntityComponentData = {}): this {
        this.setValueAtPath(id, data);
        return this;
    }

    /**
     * Adds an entity tag as a `tag:<name>` marker component.
     */
    addTag(tag: string): this {
        this.setValueAtPath(`tag:${tag}`, {});
        return this;
    }

    /**
     * Adds several entity tags as `tag:<name>` marker components.
     */
    addTags(tags: string[]): this {
        for (const tag of tags) {
            this.addTag(tag);
        }

        return this;
    }

    /**
     * Defines this entity's inventory properties.
     *
     * Passing a boolean as the second argument keeps the original API behavior
     * and maps to the component's `private` field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_inventory
     */
    addInventory(numSlots: number, isPrivate?: boolean): this;
    addInventory(numSlots: number, options?: Partial<Omit<EntityInventoryOptions, "inventory_size">>): this;
    addInventory(
        numSlots: number,
        optionsOrPrivate: boolean | Partial<Omit<EntityInventoryOptions, "inventory_size">> = false
    ): this {
        const options: Partial<Omit<EntityInventoryOptions, "inventory_size">> = typeof optionsOrPrivate === "boolean"
            ? { private: optionsOrPrivate }
            : optionsOrPrivate;

        return this.addComponent("minecraft:inventory", {
            ...options,
            "inventory_size": numSlots,
            "private": options.private ?? false,
            "container_type": options.container_type ?? "inventory"
        });
    }

    /**
     * Adds the `minecraft:equippable` component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_equippable
     */
    addEquippable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:equippable", data);
    }

    /**
     * Backward-compatible typo alias for `addEquippable(...)`.
     */
    addEqippable(data: EntityComponentData = {}): this {
        return this.addEquippable(data);
    }

    /**
     * Adds the `minecraft:is_collidable` marker component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_collidable
     */
    addIsCollidable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_collidable", data);
    }

    /**
     * Adds the `minecraft:cannot_be_attacked` marker component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_cannot_be_attacked
     */
    addCannotBeAttacked(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:cannot_be_attacked", data);
    }

    /**
     * Defines the health pool for an entity.
     *
     * The numeric overload preserves the original `(min, max, value)` API.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_health
     */
    addHealth(min: number, max: number, value: number): this;
    addHealth(options: EntityHealthOptions): this;
    addHealth(minOrOptions: number | EntityHealthOptions, max?: number, value?: number): this {
        if (typeof minOrOptions === "object") {
            return this.addComponent("minecraft:health", minOrOptions);
        }

        return this.addComponent("minecraft:health", {
            "min": minOrOptions,
            "max": max,
            "value": value
        });
    }

    /**
     * Defines physics properties for gravity, collision, and block push-out.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_physics
     */
    addPhysics(hasCollision?: boolean, hasGravity?: boolean, pushTowardsClosestSpace?: boolean): this;
    addPhysics(options?: EntityPhysicsOptions): this;
    addPhysics(
        hasCollisionOrOptions: boolean | EntityPhysicsOptions = true,
        hasGravity = true,
        pushTowardsClosestSpace = true
    ): this {
        if (typeof hasCollisionOrOptions === "object") {
            return this.addComponent("minecraft:physics", hasCollisionOrOptions);
        }

        return this.addComponent("minecraft:physics", {
            "has_collision": hasCollisionOrOptions,
            "has_gravity": hasGravity,
            "push_towards_closest_space": pushTowardsClosestSpace
        });
    }

    /**
     * Sets the width and height of the entity's collision box.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_collision_box
     */
    addCollisionBox(width: number, height: number): this;
    addCollisionBox(options: EntityCollisionBoxOptions): this;
    addCollisionBox(widthOrOptions: number | EntityCollisionBoxOptions, height?: number): this {
        if (typeof widthOrOptions === "object") {
            return this.addComponent("minecraft:collision_box", widthOrOptions);
        }

        return this.addComponent("minecraft:collision_box", {
            "height": height,
            "width": widthOrOptions
        });
    }

    /**
     * Adds one or more family values to `minecraft:type_family`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_type_family
     */
    addTypeFamily(family: string | string[]): this {
        const existingFamilies = this.getValueAtPath<string[]>("minecraft:type_family/family", []);
        const families = Array.isArray(family) ? family : [family];

        for (const familyName of families) {
            existingFamilies.push(familyName);
        }

        this.setValueAtPath("minecraft:type_family/family", existingFamilies);
        return this;
    }

    /**
     * Defines what this entity can breathe in.
     *
     * Passing a boolean preserves the original API behavior and maps to the
     * component's `breathes_water` field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_breathable
     */
    addBreathable(breathesWater: boolean): this;
    addBreathable(options: EntityBreathableOptions): this;
    addBreathable(breathesWaterOrOptions: boolean | EntityBreathableOptions): this {
        if (typeof breathesWaterOrOptions === "object") {
            return this.addComponent("minecraft:breathable", breathesWaterOrOptions);
        }

        return this.addComponent("minecraft:breathable", {
            "breathes_water": breathesWaterOrOptions
        });
    }

    /**
     * Defines whether the entity can be pushed by entities and pistons.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_pushable
     */
    addPushable(isPushable: boolean, isPushableByPiston: boolean): this;
    addPushable(options: EntityPushableOptions): this;
    addPushable(isPushableOrOptions: boolean | EntityPushableOptions, isPushableByPiston?: boolean): this {
        if (typeof isPushableOrOptions === "object") {
            return this.addComponent("minecraft:pushable", isPushableOrOptions);
        }

        return this.addComponent("minecraft:pushable", {
            "is_pushable": isPushableOrOptions,
            "is_pushable_by_piston": isPushableByPiston
        });
    }

    /**
     * Adds the `minecraft:persistent` marker component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_persistent
     */
    addPersistent(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:persistent", data);
    }

    /**
     * Defines damage sensor triggers for this entity.
     *
     * Passing a trigger or trigger array wraps it in the component's `triggers`
     * field. Passing an object with `triggers` writes the object as-is.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_damage_sensor
     */
    addDamageSensor(data: EntityDamageSensorData | EntityDamageSensorTrigger | EntityDamageSensorTrigger[] = {}): this {
        if (Array.isArray(data)) {
            return this.addComponent("minecraft:damage_sensor", {
                "triggers": data
            });
        }

        if (isRecord(data) && "triggers" in data) {
            return this.addComponent("minecraft:damage_sensor", data);
        }

        if (isRecord(data) && Object.keys(data).length === 0) {
            return this.addComponent("minecraft:damage_sensor", {});
        }

        return this.addComponent("minecraft:damage_sensor", {
            "triggers": data
        });
    }

    /**
     * Adds a damage sensor that prevents incoming damage.
     */
    disableDamage(): this {
        return this.addDamageSensor({
            "triggers": {
                "deals_damage": "no"
            }
        });
    }

    /**
     * Adds the `minecraft:absorption` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addAbsorption(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:absorption", data);
    }

    /**
     * Adds a rider to the entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_addrider
     */
    addAddrider(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:addrider", data);
    }

    /**
     * Allows an entity to ignore attackable targets for a given duration.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_admire_item
     */
    addAdmireItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:admire_item", data);
    }

    /**
     * Adds a timer for the entity to grow up. It can be accelerated by giving the entity the items it likes as defined by feed_items.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_ageable
     */
    addAgeable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:ageable", data);
    }

    /**
     * Adds the `minecraft:air_drag_modifier` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addAirDragModifier(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:air_drag_modifier", data);
    }

    /**
     * Delay for an entity playing its sound.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_ambient_sound_interval
     */
    addAmbientSoundInterval(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:ambient_sound_interval", data);
    }

    /**
     * Compels the entity to track anger towards a set of nuisances.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_anger_level
     */
    addAngerLevel(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:anger_level", data);
    }

    /**
     * Defines an entity's 'angry' state using a timer.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_angry
     */
    addAngry(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:angry", data);
    }

    /**
     * Allows an entity to break doors, assuming that that flags set up for the component to use in navigation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_annotation_break_door
     */
    addAnnotationBreakDoor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:annotation.break_door", data);
    }

    /**
     * Allows the entity to open doors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_annotation_open_door
     */
    addAnnotationOpenDoor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:annotation.open_door", data);
    }

    /**
     * Defines how an entity applies knockback.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_apply_knockback_rules
     */
    addApplyKnockbackRules(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:apply_knockback_rules", data);
    }

    /**
     * Intance of rules definition.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_apply_knockback_rules_instance
     */
    addApplyKnockbackRulesInstance(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:apply_knockback_rules_instance", data);
    }

    /**
     * A component that does damage to entities that get within range.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_area_attack
     */
    addAreaAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:area_attack", data);
    }

    /**
     * Defines an entity's melee attack damage and any additional status effects applied on hit. Typical damage values range from 3 (zombie, creeper) to 7-21 (iron golem).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_attack
     */
    addAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:attack", data);
    }

    /**
     * Adds a cooldown to an entity. The intention of this cooldown is to be used to prevent the entity from attempting to acquire new attack targets.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_attack_cooldown
     */
    addAttackCooldown(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:attack_cooldown", data);
    }

    /**
     * Specifies how much damage is dealt by the entity when it attacks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_attack_damage
     */
    addAttackDamage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:attack_damage", data);
    }

    /**
     * Adds the `minecraft:balloon` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addBalloon(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:balloon", data);
    }

    /**
     * Allows this entity to have a balloon attached and defines the conditions and events for this entity when is ballooned.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_balloonable
     */
    addBalloonable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:balloonable", data);
    }

    /**
     * Enables the component to drop an item as a barter exchange.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_barter
     */
    addBarter(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:barter", data);
    }

    /**
     * Enables the mob to admire items that have been configured as admirable.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_admire_item
     */
    addBehaviorAdmireItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.admire_item", data);
    }

    /**
     * Enables an aquatic mob to dash at its target with knockback; includes overshoot and cooldown settings.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_aquatic_charge_attack
     */
    addBehaviorAquaticChargeAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.aquatic_charge_attack", data);
    }

    /**
     * Allows this entity to avoid certain blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_avoid_block
     */
    addBehaviorAvoidBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.avoid_block", data);
    }

    /**
     * Allows the entity to run away from other entities that meet the criteria specified.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_avoid_mob_type
     */
    addBehaviorAvoidMobType(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.avoid_mob_type", data);
    }

    /**
     * Enables the mob to barter for items that have been configured as barter currency. Must be used in combination with the barter component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_barter
     */
    addBehaviorBarter(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.barter", data);
    }

    /**
     * Allows this mob to look at and follow the player that holds food they like.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_beg
     */
    addBehaviorBeg(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.beg", data);
    }

    /**
     * Allows this mob to break doors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_break_door
     */
    addBehaviorBreakDoor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.break_door", data);
    }

    /**
     * Allows this mob to breed with other mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_breed
     */
    addBehaviorBreed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.breed", data);
    }

    /**
     * Allows this entity to celebrate surviving a raid by making celebration sounds and jumping.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_celebrate
     */
    addBehaviorCelebrate(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.celebrate", data);
    }

    /**
     * Allows the player to trade with this mob. When the goal starts, it will stop the mob's navigation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_celebrate_survive
     */
    addBehaviorCelebrateSurvive(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.celebrate_survive", data);
    }

    /**
     * Allows this entity to damage a target by using a running attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_charge_attack
     */
    addBehaviorChargeAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.charge_attack", data);
    }

    /**
     * Allows an entity to charge and use their held item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_charge_held_item
     */
    addBehaviorChargeHeldItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.charge_held_item", data);
    }

    /**
     * Causes an entity to circle around an anchor point placed near a point or target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_circle_around_anchor
     */
    addBehaviorCircleAroundAnchor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.circle_around_anchor", data);
    }

    /**
     * Allows the entity to be controlled by the player using an item in the item_controllable property (required). On every tick, the entity will attempt to rotate towards where the player is facing with the control item whilst simultaneously moving forward.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_controlled_by_player
     */
    addBehaviorControlledByPlayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.controlled_by_player", data);
    }

    /**
     * Allows the entity to croak at a random time interval with configurable conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_croak
     */
    addBehaviorCroak(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.croak", data);
    }

    /**
     * Allows the mob to target another mob that hurts an entity it trusts.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_defend_trusted_target
     */
    addBehaviorDefendTrustedTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.defend_trusted_target", data);
    }

    /**
     * Allows the entity to stay in a village and defend the village from aggressors. If a player is in bad standing with the village this goal will cause the entity to attack the player regardless of filter conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_defend_village_target
     */
    addBehaviorDefendVillageTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.defend_village_target", data);
    }

    /**
     * Allows an entity to attack, while also delaying the damage-dealt until a specific time in the attack animation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_delayed_attack
     */
    addBehaviorDelayedAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.delayed_attack", data);
    }

    /**
     * Allows this entity to dig into the ground before despawning.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dig
     */
    addBehaviorDig(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dig", data);
    }

    /**
     * Allows the mob to open and close doors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_door_interact
     */
    addBehaviorDoorInteract(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.door_interact", data);
    }

    /**
     * Allows this entity to attack a player by charging at them. The player is chosen by the "minecraft:behavior.dragonscanning".
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonchargeplayer
     */
    addBehaviorDragonchargeplayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonchargeplayer", data);
    }

    /**
     * Allows the dragon to go out with glory. This controls the Ender Dragon's death animation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragondeath
     */
    addBehaviorDragondeath(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragondeath", data);
    }

    /**
     * Allows this entity to use a flame-breath attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonflaming
     */
    addBehaviorDragonflaming(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonflaming", data);
    }

    /**
     * Allows the Dragon to fly around in a circle around the center podium.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonholdingpattern
     */
    addBehaviorDragonholdingpattern(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonholdingpattern", data);
    }

    /**
     * Allows the Dragon to stop flying and transition into perching mode.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonlanding
     */
    addBehaviorDragonlanding(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonlanding", data);
    }

    /**
     * Allows the dragon to look around for a player to attack while in perch mode.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonscanning
     */
    addBehaviorDragonscanning(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonscanning", data);
    }

    /**
     * Allows this entity to fly around looking for a player to shoot fireballs at.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragonstrafeplayer
     */
    addBehaviorDragonstrafeplayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragonstrafeplayer", data);
    }

    /**
     * Allows the dragon to leave perch mode and go back to flying around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_dragontakeoff
     */
    addBehaviorDragontakeoff(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.dragontakeoff", data);
    }

    /**
     * Allows the mob to drink milk based on specified environment conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_drink_milk
     */
    addBehaviorDrinkMilk(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.drink_milk", data);
    }

    /**
     * Allows the mob to drink potions based on specified environment conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_drink_potion
     */
    addBehaviorDrinkPotion(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.drink_potion", data);
    }

    /**
     * Allows the entity to move toward a target, and drop an item near the target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_drop_item_for
     */
    addBehaviorDropItemFor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.drop_item_for", data);
    }

    /**
     * Allows the entity to consume a block, replace the eaten block with another block, and trigger an event as a result.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_eat_block
     */
    addBehaviorEatBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.eat_block", data);
    }

    /**
     * If the mob is carrying a food item, the mob will eat it and the effects will be applied to the mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_eat_carried_item
     */
    addBehaviorEatCarriedItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.eat_carried_item", data);
    }

    /**
     * Allows the entity to eat a specified Mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_eat_mob
     */
    addBehaviorEatMob(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.eat_mob", data);
    }

    /**
     * Allows this entity to emerge from the ground.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_emerge
     */
    addBehaviorEmerge(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.emerge", data);
    }

    /**
     * Allows the enderman to drop a block they are carrying.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_enderman_leave_block
     */
    addBehaviorEndermanLeaveBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.enderman_leave_block", data);
    }

    /**
     * Allows the enderman to take a block and carry it around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_enderman_take_block
     */
    addBehaviorEndermanTakeBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.enderman_take_block", data);
    }

    /**
     * The entity puts on the desired equipment.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_equip_item
     */
    addBehaviorEquipItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.equip_item", data);
    }

    /**
     * Allows the entity to first travel to a random point on the outskirts of the village, and then explore random points within a small distance.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_explore_outskirts
     */
    addBehaviorExploreOutskirts(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.explore_outskirts", data);
    }

    /**
     * Allows the mob to search within an area for a growable crop block. If found, the mob will use any available fertilizer in their inventory on the crop. This goal will not execute if the mob does not have a fertilizer item in its inventory.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_fertilize_farm_block
     */
    addBehaviorFertilizeFarmBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.fertilize_farm_block", data);
    }

    /**
     * Allows the mob to seek shade.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_find_cover
     */
    addBehaviorFindCover(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.find_cover", data);
    }

    /**
     * Allows the mob to look around for another mob to ride atop it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_find_mount
     */
    addBehaviorFindMount(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.find_mount", data);
    }

    /**
     * Allows the mob to move towards the nearest underwater ruin or shipwreck.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_find_underwater_treasure
     */
    addBehaviorFindUnderwaterTreasure(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.find_underwater_treasure", data);
    }

    /**
     * Allows an entity to attack by firing a shot with a delay. Anchor and offset parameters of this component overrides the anchor and offset from projectile component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_fire_at_target
     */
    addBehaviorFireAtTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.fire_at_target", data);
    }

    /**
     * Allows the mob to run away from direct sunlight and seek shade.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_flee_sun
     */
    addBehaviorFleeSun(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.flee_sun", data);
    }

    /**
     * Allows the mob to stay afloat while swimming. Passengers will be kicked out the moment the mob's head goes underwater, which may not happen for tall mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_float
     */
    addBehaviorFloat(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.float", data);
    }

    /**
     * Allows a mob to be tempted by a player holding a specific item. Uses point-to-point movement. Designed for mobs that are floating (e.g. use the "minecraft:navigation.float" component).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_float_tempt
     */
    addBehaviorFloatTempt(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.float_tempt", data);
    }

    /**
     * Allows the mob to float around like the Ghast.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_float_wander
     */
    addBehaviorFloatWander(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.float_wander", data);
    }

    /**
     * Allows the mob to follow mobs that are in a caravan.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_caravan
     */
    addBehaviorFollowCaravan(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_caravan", data);
    }

    /**
     * Allows the mob to follow other mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_mob
     */
    addBehaviorFollowMob(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_mob", data);
    }

    /**
     * Allows a mob to follow the player that owns it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_owner
     */
    addBehaviorFollowOwner(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_owner", data);
    }

    /**
     * Allows the mob to follow their parent around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_parent
     */
    addBehaviorFollowParent(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_parent", data);
    }

    /**
     * Allows mob to move towards its current target captain.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_target_captain
     */
    addBehaviorFollowTargetCaptain(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_target_captain", data);
    }

    /**
     * Allows mob to move towards its target leader.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_follow_target_leader
     */
    addBehaviorFollowTargetLeader(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.follow_target_leader", data);
    }

    /**
     * The entity will attempt to toss the items from its inventory to a nearby recently played noteblock.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_go_and_give_items_to_noteblock
     */
    addBehaviorGoAndGiveItemsToNoteblock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.go_and_give_items_to_noteblock", data);
    }

    /**
     * The entity will attempt to toss the items from its inventory to its owner.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_go_and_give_items_to_owner
     */
    addBehaviorGoAndGiveItemsToOwner(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.go_and_give_items_to_owner", data);
    }

    /**
     * Allows the mob to move back to the position they were spawned.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_go_home
     */
    addBehaviorGoHome(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.go_home", data);
    }

    /**
     * Allows this entity to use a laser beam attack. Can only be used by Guardians and Elder Guardians.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_guardian_attack
     */
    addBehaviorGuardianAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.guardian_attack", data);
    }

    /**
     * Allows the entity to search within an area for farmland with air above it. If found, the entity will replace the air block by planting a seed item from its inventory on the farmland block. This goal will not execute if the entity does not have an item in its inventory.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_harvest_farm_block
     */
    addBehaviorHarvestFarmBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.harvest_farm_block", data);
    }

    /**
     * Allows a mob with the hide component to attempt to move to - and hide at - an owned or nearby POI.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_hide
     */
    addBehaviorHide(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.hide", data);
    }

    /**
     * Compels an entity to stop at their current location, turn to face a mob they are targeting, and react with an event.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_hold_ground
     */
    addBehaviorHoldGround(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.hold_ground", data);
    }

    /**
     * Allows the mob to hover in place.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_hover
     */
    addBehaviorHover(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.hover", data);
    }

    /**
     * Allows the mob to target another mob that hurts them.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_hurt_by_target
     */
    addBehaviorHurtByTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.hurt_by_target", data);
    }

    /**
     * Allows the mob to inspect bookshelves.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_inspect_bookshelf
     */
    addBehaviorInspectBookshelf(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.inspect_bookshelf", data);
    }

    /**
     * Allows this entity to move towards a "suspicious" position based on data gathered in `minecraft:suspect_tracking`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_investigate_suspicious_location
     */
    addBehaviorInvestigateSuspiciousLocation(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.investigate_suspicious_location", data);
    }

    /**
     * Allows an entity to jump around a target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_jump.around_target
     */
    addBehaviorJumpAroundTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.jump_around_target", data);
    }

    /**
     * Allows an entity to jump to another random block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_jump.to_block
     */
    addBehaviorJumpToBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.jump_to_block", data);
    }

    /**
     * Allows the mob to perform a damaging knockback that affects all nearby entities.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_knockback_roar
     */
    addBehaviorKnockbackRoar(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.knockback_roar", data);
    }

    /**
     * Allows mobs to lay down at times.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_lay_down
     */
    addBehaviorLayDown(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.lay_down", data);
    }

    /**
     * Allows the mob to lay an egg block on certain types of blocks if the mob is pregnant.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_lay_egg
     */
    addBehaviorLayEgg(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.lay_egg", data);
    }

    /**
     * Allows monsters to jump at and attack their target. Can only be used by hostile mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_leap_at_target
     */
    addBehaviorLeapAtTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.leap_at_target", data);
    }

    /**
     * Compels an entity to look at a specific entity by rotating the `head` bone pose within a set limit.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_look_at_entity
     */
    addBehaviorLookAtEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.look_at_entity", data);
    }

    /**
     * Compels an entity to look at the player by rotating the `head` bone pose within a set limit.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_look_at_player
     */
    addBehaviorLookAtPlayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.look_at_player", data);
    }

    /**
     * Compels an entity to look at the target by rotating the head bone pose within a set limit.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_look_at_target
     */
    addBehaviorLookAtTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.look_at_target", data);
    }

    /**
     * Compels an entity to look at the player that is currently trading with the entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_look_at_trading_player
     */
    addBehaviorLookAtTradingPlayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.look_at_trading_player", data);
    }

    /**
     * Allows the villager to look for a mate to spawn other villagers with.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_make_love
     */
    addBehaviorMakeLove(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.make_love", data);
    }

    /**
     * Allows an entity to deal damage through a melee attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_melee_attack
     */
    addBehaviorMeleeAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.melee_attack", data);
    }

    /**
     * Allows an entity to deal damage through a melee attack with reach calculations based on bounding boxes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_melee_box_attack
     */
    addBehaviorMeleeBoxAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.melee_box_attack", data);
    }

    /**
     * Allows an entity to go to the village bell and mingle with other entities.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_mingle
     */
    addBehaviorMingle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.mingle", data);
    }

    /**
     * Allows the mob to move around on its own while mounted seeking a target to attack. Also will allow an entity to target another entity for an attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_mount_pathing
     */
    addBehaviorMountPathing(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.mount_pathing", data);
    }

    /**
     * Allows an entity to move around a target.If the entity is too close(i.e.closer than destination range min and height difference limit) it will try to move away from its target.If the entity is too far away from its target it will try to move closer to a random position within the destination range.A randomized amount of those positions will be behind the target, and the spread can be tweaked with 'destination_pos_spread_degrees'.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_around_target
     */
    addBehaviorMoveAroundTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_around_target", data);
    }

    /**
     * Allows this entity to move indoors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_indoors
     */
    addBehaviorMoveIndoors(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_indoors", data);
    }

    /**
     * Allows this entity to move outdoors.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_outdoors
     */
    addBehaviorMoveOutdoors(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_outdoors", data);
    }

    /**
     * Can only be used by Villagers. Allows the villagers to create paths around the village.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_through_village
     */
    addBehaviorMoveThroughVillage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_through_village", data);
    }

    /**
     * Allows mob to move towards a block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_block
     */
    addBehaviorMoveToBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_block", data);
    }

    /**
     * Allows the mob to move back onto land when in water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_land
     */
    addBehaviorMoveToLand(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_land", data);
    }

    /**
     * Allows the mob to move back into lava when on land. This behavior has been replaced by minecraft:behavior.move_to_liquid.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_lava
     */
    addBehaviorMoveToLava(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_lava", data);
    }

    /**
     * Allows the mob to move into a liquid when on land.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_liquid
     */
    addBehaviorMoveToLiquid(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_liquid", data);
    }

    /**
     * Allows the mob to move to a POI if able to.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_poi
     */
    addBehaviorMoveToPoi(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_poi", data);
    }

    /**
     * Allows mob to move towards a random block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_random_block
     */
    addBehaviorMoveToRandomBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_random_block", data);
    }

    /**
     * Allows the mob to move into a random location within a village.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_village
     */
    addBehaviorMoveToVillage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_village", data);
    }

    /**
     * Allows the mob to move back into water when on land.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_to_water
     */
    addBehaviorMoveToWater(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_to_water", data);
    }

    /**
     * Allows entities with the "minecraft:dweller" component to move toward their village area that the entity should be restricted to.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_towards_dwelling_restriction
     */
    addBehaviorMoveTowardsDwellingRestriction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_towards_dwelling_restriction", data);
    }

    /**
     * Allows entities with a `minecraft:home` component to move towards their home position. If `restriction_radius` is set, entities will be able to run this behavior only if outside of it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_towards_home_restriction
     */
    addBehaviorMoveTowardsHomeRestriction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_towards_home_restriction", data);
    }

    /**
     * AI goal that drives entities back toward their designated home area when they've wandered too far. Works with components like minecraft:home to define the restriction zone. Used for village-bound mobs, territorial creatures, or any entity that should patrol or return to a specific location.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_towards_restriction
     */
    addBehaviorMoveTowardsRestriction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_towards_restriction", data);
    }

    /**
     * Allows mob to move towards its current target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_move_towards_target
     */
    addBehaviorMoveTowardsTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.move_towards_target", data);
    }

    /**
     * Allows mobs to occassionally stop and take a nap under certain conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_nap
     */
    addBehaviorNap(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.nap", data);
    }

    /**
     * Allows an entity to attack the closest target within a given subset of specific target types.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_nearest_attackable_target
     */
    addBehaviorNearestAttackableTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.nearest_attackable_target", data);
    }

    /**
     * Allows the mob to check for and pursue the nearest valid target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_nearest_prioritized_attackable_target
     */
    addBehaviorNearestPrioritizedAttackableTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.nearest_prioritized_attackable_target", data);
    }

    /**
     * Allows to mob to be able to sit in place like the ocelot.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_ocelot_sit_on_block
     */
    addBehaviorOcelotSitOnBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.ocelot_sit_on_block", data);
    }

    /**
     * Controls specific attack behavior for Ocelots.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_ocelotattack
     */
    addBehaviorOcelotattack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.ocelotattack", data);
    }

    /**
     * Allows the mob to offer a flower to another mob with the minecraft:take_flower behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_offer_flower
     */
    addBehaviorOfferFlower(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.offer_flower", data);
    }

    /**
     * Allows the mob to open doors. Requires the mob to be able to path through doors, otherwise the mob won't even want to try opening them.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_open_door
     */
    addBehaviorOpenDoor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.open_door", data);
    }

    /**
     * Allows the mob to target another mob that hurts their owner.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_owner_hurt_by_target
     */
    addBehaviorOwnerHurtByTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.owner_hurt_by_target", data);
    }

    /**
     * Allows the mob to target a mob that is hurt by their owner.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_owner_hurt_target
     */
    addBehaviorOwnerHurtTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.owner_hurt_target", data);
    }

    /**
     * Allows the mob to enter the panic state, which makes it run around and away from the damage source that made it enter this state.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_panic
     */
    addBehaviorPanic(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.panic", data);
    }

    /**
     * Allows the pet mob to move onto a bed with its owner while sleeping.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_pet_sleep_with_owner
     */
    addBehaviorPetSleepWithOwner(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.pet_sleep_with_owner", data);
    }

    /**
     * Allows the mob to pick up items on the ground.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_pickup_items
     */
    addBehaviorPickupItems(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.pickup_items", data);
    }

    /**
     * AI goal that makes entities place blocks into the world, like Endermen placing their carried block or snow golems leaving snow trails. Configure which blocks can be placed, where they can be placed, and how often the entity attempts placement. Creates mobs that modify the environment.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_place_block
     */
    addBehaviorPlaceBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.place_block", data);
    }

    /**
     * Allows the mob to offer a flower to another mob with the minecraft:take_flower behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_play
     */
    addBehaviorPlay(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.play", data);
    }

    /**
     * Allows this entity to pretend to be dead to avoid being targeted by attackers.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_play_dead
     */
    addBehaviorPlayDead(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.play_dead", data);
    }

    /**
     * Allows the mob to be ridden by the player after being tamed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_player.ride_tamed
     */
    addBehaviorPlayerRideTamed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.player_ride_tamed", data);
    }

    /**
     * Allows the mob to eat/raid crops out of farms until they are full.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_raid_garden
     */
    addBehaviorRaidGarden(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.raid_garden", data);
    }

    /**
     * Allows this entity to damage a target by using a running attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_ram_attack
     */
    addBehaviorRamAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.ram_attack", data);
    }

    /**
     * Allows the mob to randomly break surface of the water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_breach
     */
    addBehaviorRandomBreach(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_breach", data);
    }

    /**
     * Allows a mob to randomly fly around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_fly
     */
    addBehaviorRandomFly(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_fly", data);
    }

    /**
     * Allows the mob to hover around randomly, close to the surface.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_hover
     */
    addBehaviorRandomHover(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_hover", data);
    }

    /**
     * Allows the mob to randomly look around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_look_around
     */
    addBehaviorRandomLookAround(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_look_around", data);
    }

    /**
     * Allows the mob to randomly sit and look around for a duration. Note: Must have a sitting animation set up to use this.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_look_around_and_sit
     */
    addBehaviorRandomLookAroundAndSit(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_look_around_and_sit", data);
    }

    /**
     * Allows this entity to locate a random target block that it can path find to. Once found, the entity will move towards it and dig up an item. [Default target block types: Dirt, Grass, Podzol, DirtWithRoots, MossBlock, Mud, MuddyMangroveRoots].
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_search_and_dig
     */
    addBehaviorRandomSearchAndDig(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_search_and_dig", data);
    }

    /**
     * Allows the mob to randomly sit for a duration.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_sitting
     */
    addBehaviorRandomSitting(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_sitting", data);
    }

    /**
     * Allows a mob to randomly stroll around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_stroll
     */
    addBehaviorRandomStroll(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_stroll", data);
    }

    /**
     * Allows an entity to randomly move through water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_random_swim
     */
    addBehaviorRandomSwim(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.random_swim", data);
    }

    /**
     * Allows an entity to attack by using ranged shots. "charge_shoot_trigger" must be greater than 0 to enable charged up burst-shot attacks. Requires minecraft:shooter to define projectile behaviour.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_ranged_attack
     */
    addBehaviorRangedAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.ranged_attack", data);
    }

    /**
     * Allows the villager to stop so another villager can breed with it. Can only be used by a Villager.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_receive_love
     */
    addBehaviorReceiveLove(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.receive_love", data);
    }

    /**
     * Allows the mob to stay indoors during night time.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_restrict_open_door
     */
    addBehaviorRestrictOpenDoor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.restrict_open_door", data);
    }

    /**
     * Allows the mob to automatically start avoiding the sun when its a clear day out.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_restrict_sun
     */
    addBehaviorRestrictSun(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.restrict_sun", data);
    }

    /**
     * Allows the mob to stay at a certain level when in liquid.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_rise_to_liquid_level
     */
    addBehaviorRiseToLiquidLevel(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.rise_to_liquid_level", data);
    }

    /**
     * Allows this entity to roar at another entity based on data in `minecraft:anger_level`. Once the anger threshold specified in `minecraft:anger_level` has been reached, this entity will roar for the specified amount of time, look at the other entity, apply anger boost towards it, and finally target it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_roar
     */
    addBehaviorRoar(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.roar", data);
    }

    /**
     * This allows the mob to roll forward.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_roll
     */
    addBehaviorRoll(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.roll", data);
    }

    /**
     * Allows the mob to run around aimlessly.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_run_around_like_crazy
     */
    addBehaviorRunAroundLikeCrazy(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.run_around_like_crazy", data);
    }

    /**
     * Allows the mob to become scared when the weather outside is thundering.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_scared
     */
    addBehaviorScared(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.scared", data);
    }

    /**
     * Allows the mob to send an event to another mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_send_event
     */
    addBehaviorSendEvent(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.send_event", data);
    }

    /**
     * Allows the mob to give items it has to others.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_share_items
     */
    addBehaviorShareItems(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.share_items", data);
    }

    /**
     * Allows the mob to go into stone blocks like Silverfish do.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_silverfish_merge_with_stone
     */
    addBehaviorSilverfishMergeWithStone(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.silverfish_merge_with_stone", data);
    }

    /**
     * Allows the mob to alert mobs in nearby blocks to come out.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_silverfish_wake_up_friends
     */
    addBehaviorSilverfishWakeUpFriends(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.silverfish_wake_up_friends", data);
    }

    /**
     * Allows Equine mobs to be Horse Traps and be triggered like them, spawning a lightning bolt and a bunch of horses when a player is nearby. Can only be used by Horses, Mules, Donkeys and Skeleton Horses.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_skeleton_horse.trap
     */
    addBehaviorSkeletonHorseTrap(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.skeleton_horse_trap", data);
    }

    /**
     * Allows mobs that own a bed to in a village to move to and sleep in it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_sleep
     */
    addBehaviorSleep(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.sleep", data);
    }

    /**
     * Causes the entity to grow tired every once in a while, while attacking.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_slime_attack
     */
    addBehaviorSlimeAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.slime_attack", data);
    }

    /**
     * Allow slimes to float in water / lava.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_slime_float
     */
    addBehaviorSlimeFloat(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.slime_float", data);
    }

    /**
     * Allows the entity to continuously jump around like a slime.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_slime_keep_on_jumping
     */
    addBehaviorSlimeKeepOnJumping(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.slime_keep_on_jumping", data);
    }

    /**
     * Allows the entity to move in random directions like a slime.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_slime_random_direction
     */
    addBehaviorSlimeRandomDirection(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.slime_random_direction", data);
    }

    /**
     * Allows the mob to take a load off and snack on food that it found nearby.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_snacking
     */
    addBehaviorSnacking(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.snacking", data);
    }

    /**
     * Allows the mob to sneeze, causing it to drop items and affect nearby mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_sneeze
     */
    addBehaviorSneeze(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.sneeze", data);
    }

    /**
     * Allows this entity to detect the nearest player within "sniffing_radius" and update its "minecraft:suspect_tracking" component state.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_sniff
     */
    addBehaviorSniff(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.sniff", data);
    }

    /**
     * Allows this entity to perform a 'sonic boom' ranged attack.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_sonic_boom
     */
    addBehaviorSonicBoom(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.sonic_boom", data);
    }

    /**
     * Allows the squid to dive down in water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_squid_dive
     */
    addBehaviorSquidDive(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.squid_dive", data);
    }

    /**
     * Allows the squid to swim away.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_squid_flee
     */
    addBehaviorSquidFlee(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.squid_flee", data);
    }

    /**
     * Allows the squid to swim in place idly.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_squid_idle
     */
    addBehaviorSquidIdle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.squid_idle", data);
    }

    /**
     * Allows the squid to move away from ground blocks and back to water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_squid_move_away_from_ground
     */
    addBehaviorSquidMoveAwayFromGround(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.squid_move_away_from_ground", data);
    }

    /**
     * Allows the squid to stick to the ground when outside water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_squid_out_of_water
     */
    addBehaviorSquidOutOfWater(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.squid_out_of_water", data);
    }

    /**
     * Allows a mob to stalk a target, then once within range pounce onto a target, on success the target will be attacked dealing damage defined by the attack component. On failure, the mob will risk getting stuck.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stalk_and_pounce_on_target
     */
    addBehaviorStalkAndPounceOnTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stalk_and_pounce_on_target", data);
    }

    /**
     * The entity will attempt to toss the items from its inventory to a nearby recently played noteblock.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stay_near_noteblock
     */
    addBehaviorStayNearNoteblock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stay_near_noteblock", data);
    }

    /**
     * Allows the mob to stay put while it is in a sitting state instead of doing something else.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stay_while_sitting
     */
    addBehaviorStayWhileSitting(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stay_while_sitting", data);
    }

    /**
     * Allows an entity to attack using stomp AoE damage behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stomp_attack
     */
    addBehaviorStompAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stomp_attack", data);
    }

    /**
     * Allows this mob to stomp turtle eggs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stomp_turtle_egg
     */
    addBehaviorStompTurtleEgg(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stomp_turtle_egg", data);
    }

    /**
     * Allows the mob to move into a random location within a village within the search range.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_stroll_towards_village
     */
    addBehaviorStrollTowardsVillage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.stroll_towards_village", data);
    }

    /**
     * Allows the mob to attack the player by summoning other entities.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_summon_entity
     */
    addBehaviorSummonEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.summon_entity", data);
    }

    /**
     * Allows the creeper to swell up when a player is nearby. It can only be used by Creepers.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swell
     */
    addBehaviorSwell(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swell", data);
    }

    /**
     * Allows the entity go idle, if swimming. Entity must be in water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swim_idle
     */
    addBehaviorSwimIdle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swim_idle", data);
    }

    /**
     * Allows the mob to try to move to air once it is close to running out of its total breathable supply. Requires "minecraft:breathable".
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swim_up_for_breath
     */
    addBehaviorSwimUpForBreath(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swim_up_for_breath", data);
    }

    /**
     * Allows the entity to wander around while swimming, when not path-finding.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swim_wander
     */
    addBehaviorSwimWander(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swim_wander", data);
    }

    /**
     * Allows the entity follow another entity. Both entities must be swimming [ie, in water].
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swim_with_entity
     */
    addBehaviorSwimWithEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swim_with_entity", data);
    }

    /**
     * Allows an entity to attack using swoop attack behavior; Ideal for use with flying mobs. The behavior ends if the entity has a horizontal collision or gets hit.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_swoop_attack
     */
    addBehaviorSwoopAttack(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.swoop_attack", data);
    }

    /**
     * AI goal that makes entities pick up blocks from the world, like Endermen grabbing blocks to carry. Configure which blocks the entity can take and the search radius. Works with place_block behavior to create entities that relocate blocks or harvest materials from the environment.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_take_block
     */
    addBehaviorTakeBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.take_block", data);
    }

    /**
     * Allows the mob to accept flowers from another mob with the minecraft:offer_flower behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_take_flower
     */
    addBehaviorTakeFlower(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.take_flower", data);
    }

    /**
     * Allows the mob to target another mob when it is pushed by that mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_target_when_pushed
     */
    addBehaviorTargetWhenPushed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.target_when_pushed", data);
    }

    /**
     * Allows an entity to teleport to its owner.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_teleport_to_owner
     */
    addBehaviorTeleportToOwner(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.teleport_to_owner", data);
    }

    /**
     * Allows a mob to be tempted by a player holding a specific item. Uses pathfinding for movement.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_tempt
     */
    addBehaviorTempt(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.tempt", data);
    }

    /**
     * Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_1 will return 1.0 on both the client and server when this behavior is running, and 0.0 otherwise.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_timer_flag_1
     */
    addBehaviorTimerFlag1(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.timer_flag_1", data);
    }

    /**
     * Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_2 will return 1.0 on both the client and server when this behavior is running, and 0.0 otherwise.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_timer_flag_2
     */
    addBehaviorTimerFlag2(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.timer_flag_2", data);
    }

    /**
     * Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_3 will return 1.0 on both the client and server when this behavior is running, and 0.0 otherwise.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_timer_flag_3
     */
    addBehaviorTimerFlag3(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.timer_flag_3", data);
    }

    /**
     * Allows the mob to look at a player that is holding a tradable item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_trade_interest
     */
    addBehaviorTradeInterest(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.trade_interest", data);
    }

    /**
     * Allows the player to trade with this mob. When the goal starts, it will stop the mob's navigation.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_trade_with_player
     */
    addBehaviorTradeWithPlayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.trade_with_player", data);
    }

    /**
     * A behavior that enables a mob to transport items from and to containers.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_transport_items
     */
    addBehaviorTransportItems(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.transport_items", data);
    }

    /**
     * Enables a mob to use kinetic weaponry by intermittently charging at its target and repositioning afterward.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_use_kinetic_weapon
     */
    addBehaviorUseKineticWeapon(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.use_kinetic_weapon", data);
    }

    /**
     * Allows the mob to target the same entity its owner is targeting.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_vex_copy_owner_target
     */
    addBehaviorVexCopyOwnerTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.vex_copy_owner_target", data);
    }

    /**
     * Allows the mob to move around randomly like the Vex.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_vex_random_move
     */
    addBehaviorVexRandomMove(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.vex_random_move", data);
    }

    /**
     * Allows the wither to launch random attacks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_wither_random_attack_pos_goal
     */
    addBehaviorWitherRandomAttackPosGoal(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.wither_random_attack_pos_goal", data);
    }

    /**
     * Allows the wither to focus its attacks on whichever mob has dealt the most damage to it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_wither_target_highest_damage
     */
    addBehaviorWitherTargetHighestDamage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.wither_target_highest_damage", data);
    }

    /**
     * Allows the NPC to use the POI.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_work
     */
    addBehaviorWork(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.work", data);
    }

    /**
     * Allows the NPC to use the composter POI to convert excess seeds into bone meal.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitygoals/minecraftbehavior_work_composter
     */
    addBehaviorWorkComposter(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:behavior.work_composter", data);
    }

    /**
     * Allows the player to detect and manuever on the scaffolding block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_block_climber
     */
    addBlockClimber(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:block_climber", data);
    }

    /**
     * Fires off a specified event when a block in the block list is broken within the sensor range.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_block_sensor
     */
    addBlockSensor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:block_sensor", data);
    }

    /**
     * Causes the entity's body rotation to match the one of their head. Does not override the "minecraft:body_rotation_blocked" component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_body_rotation_always_follows_head
     */
    addBodyRotationAlwaysFollowsHead(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:body_rotation_always_follows_head", data);
    }

    /**
     * Causes the entity's body to automatically rotate to align with the nearest cardinal direction based on its current facing direction. Combining this with the "minecraft:body_rotation_blocked" component will cause the entity to align to the nearest cardinal direction and remain fixed in that orientation, regardless of future changes in its facing direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_body_rotation_axis_aligned
     */
    addBodyRotationAxisAligned(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:body_rotation_axis_aligned", data);
    }

    /**
     * When set, the entity will no longer visually rotate their body to match their facing direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_body_rotation_blocked
     */
    addBodyRotationBlocked(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:body_rotation_blocked", data);
    }

    /**
     * Causes the entity's body rotation to match their vehicle's facing direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_body_rotation_locked_to_vehicle
     */
    addBodyRotationLockedToVehicle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:body_rotation_locked_to_vehicle", data);
    }

    /**
     * Defines the conditions and behavior of a rideable entity's boost.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_boostable
     */
    addBoostable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:boostable", data);
    }

    /**
     * Defines the current state of the boss for updating the boss HUD.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_boss
     */
    addBoss(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:boss", data);
    }

    /**
     * Adds the `minecraft:bounciness` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addBounciness(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:bounciness", data);
    }

    /**
     * Specifies the blocks that the entity can break as it moves around.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_break_blocks
     */
    addBreakBlocks(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:break_blocks", data);
    }

    /**
     * Allows an entity to establish a way to get into the love state used for breeding.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_breedable
     */
    addBreedable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:breedable", data);
    }

    /**
     * Defines the way an entity can get into the 'bribed' state.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_bribeable
     */
    addBribeable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:bribeable", data);
    }

    /**
     * Adds the `minecraft:bucketable` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addBucketable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:bucketable", data);
    }

    /**
     * Enables an entity to float on the specified liquid blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_buoyant
     */
    addBuoyant(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:buoyant", data);
    }

    /**
     * Specifies that this entity takes fire damage when exposed to direct sunlight. This component is used by undead mobs like zombies, skeletons, and phantoms. The entity will catch fire when in sunlight unless it is wearing armor in the protection slot, standing in water, or in a shaded area.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_burns_in_daylight
     */
    addBurnsInDaylight(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:burns_in_daylight", data);
    }

    /**
     * Allows an entity to climb ladders.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_can_climb
     */
    addCanClimb(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:can_climb", data);
    }

    /**
     * Marks the entity as being able to fly, the pathfinder won't be restricted to paths where a solid block is required underneath it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_can_fly
     */
    addCanFly(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:can_fly", data);
    }

    /**
     * Specifies if an entity can join a raid.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_can_join_raid
     */
    addCanJoinRaid(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:can_join_raid", data);
    }

    /**
     * Allows the entity to power jump like the Horse does in Vanilla.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_can_power_jump
     */
    addCanPowerJump(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:can_power_jump", data);
    }

    /**
     * Specifies hunt celebration behaviour.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_celebrate_hunt
     */
    addCelebrateHunt(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:celebrate_hunt", data);
    }

    /**
     * Defines the entity's main color.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_color
     */
    addColor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:color", data);
    }

    /**
     * Defines the entity's second texture color.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_color2
     */
    addColor2(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:color2", data);
    }

    /**
     * Gives `Regeneration I` and removes `Mining Fatigue` from the mob that kills the entity's attack target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_combat_regeneration
     */
    addCombatRegeneration(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:combat_regeneration", data);
    }

    /**
     * Defines the Conditional Spatial Update Bandwidth Optimizations of this entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_conditional_bandwidth_optimization
     */
    addConditionalBandwidthOptimization(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:conditional_bandwidth_optimization", data);
    }

    /**
     * List of hitboxes for melee and ranged hits against the entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_custom_hit_test
     */
    addCustomHitTest(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:custom_hit_test", data);
    }

    /**
     * Applies defined amount of damage to the entity at specified intervals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_damage_over_time
     */
    addDamageOverTime(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:damage_over_time", data);
    }

    /**
     * Ability for a rideable entity to dash.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_dash
     */
    addDash(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:dash", data);
    }

    /**
     * Ability for a rideable entity to dash.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_dash_action
     */
    addDashAction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:dash_action", data);
    }

    /**
     * Sets this entity's default head rotation angle.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_default_look_angle
     */
    addDefaultLookAngle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:default_look_angle", data);
    }

    /**
     * Despawns the Actor when the despawn rules or optional filters evaluate to true.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_despawn
     */
    addDespawn(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:despawn", data);
    }

    /**
     * Prevents the entity from changing dimension through portals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_dimension_bound
     */
    addDimensionBound(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:dimension_bound", data);
    }

    /**
     * Adds a timer for drying out that will count down and fire 'dried_out_event' or will stop as soon as the entity will get under rain or water and fire 'stopped_drying_out_event'.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_drying_out_timer
     */
    addDryingOutTimer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:drying_out_timer", data);
    }

    /**
     * Compels an entity to join and migrate between villages and other dwellings.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_dweller
     */
    addDweller(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:dweller", data);
    }

    /**
     * Defines this entity's ability to trade with players.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_economy_trade_table
     */
    addEconomyTradeTable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:economy_trade_table", data);
    }

    /**
     * Defines this entity's current villager-style economy trade table path.
     *
     * The table path is relative to the pack root, for example
     * `trading/economy_trades/butcher_trades.json`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/createtradetable
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_economy_trade_table
     */
    addEconomyTradeTablePath(table: string, data: Record<string, unknown> = {}): this {
        return this.addEconomyTradeTable({ ...data, table });
    }

    /**
     * It defines to which armor slot an item equipped to 'minecraft:equippable''s second slot should be equipped to. It is automatically applied to all entities for worlds with a version greater than or equal to 1.21.10. For older worlds, 'slot.armor.torso' will be used. It is strongly advised not to explicitly use this component, as no backwards compatibility for it will be provided.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_entity_armor_equipment_slot_mapping
     */
    addEntityArmorEquipmentSlotMapping(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:entity_armor_equipment_slot_mapping", data);
    }

    /**
     * A component that owns multiple subsensors, each one firing an event when a set of conditions are met by other entities within the defined range.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_entity_sensor
     */
    addEntitySensor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:entity_sensor", data);
    }

    /**
     * Creates a trigger based on environment conditions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_environment_sensor
     */
    addEnvironmentSensor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:environment_sensor", data);
    }

    /**
     * The entity puts on the desired equipment.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_equip_item
     */
    addEquipItem(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:equip_item", data);
    }

    /**
     * Sets the Equipment table to use for this Entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_equipment
     */
    addEquipment(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:equipment", data);
    }

    /**
     * Defines how much exhaustion each player action should take.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_exhaustion_values
     */
    addExhaustionValues(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:exhaustion_values", data);
    }

    /**
     * .
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_experience_reward
     */
    addExperienceReward(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:experience_reward", data);
    }

    /**
     * Defines how the entity explodes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_explode
     */
    addExplode(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:explode", data);
    }

    /**
     * Sets that this entity doesn't take damage from fire.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_fire_immune
     */
    addFireImmune(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:fire_immune", data);
    }

    /**
     * Sets that this entity can float in liquid blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_floats_in_liquid
     */
    addFloatsInLiquid(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:floats_in_liquid", data);
    }

    /**
     * Allows entities to flock in groups in water or not.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_flocking
     */
    addFlocking(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:flocking", data);
    }

    /**
     * Speed in Blocks that this entity flies at.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_flying_speed
     */
    addFlyingSpeed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:flying_speed", data);
    }

    /**
     * Defines the maximum range, in blocks, that a mob will pursue a target. This affects AI behaviors like chasing players or attacking.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_follow_range
     */
    addFollowRange(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:follow_range", data);
    }

    /**
     * When configured as a rideable entity, the entity will be controlled using WASD controls and mouse to move in three dimensions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_free_camera_controlled
     */
    addFreeCameraControlled(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:free_camera_controlled", data);
    }

    /**
     * Defines how much friction affects this entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_friction_modifier
     */
    addFrictionModifier(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:friction_modifier", data);
    }

    /**
     * Allows an entity to emit `entityMove`, `swim` and `flap` game events, depending on the block the entity is moving through. It is added by default to every mob. Add it again to override its behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_game_event_movement_tracking
     */
    addGameEventMovementTracking(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:game_event_movement_tracking", data);
    }

    /**
     * Defines the way a mob's genes and alleles are passed on to its offspring, and how those traits manifest in the child. Compatible parent genes are crossed together, the alleles are handed down from the parents to the child, and any matching genetic variants fire off JSON events to modify the child and express the traits.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_genetics
     */
    addGenetics(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:genetics", data);
    }

    /**
     * Defines sets of items that can be used to trigger events when used on this entity. The item will also be taken and placed in the entity's inventory.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_giveable
     */
    addGiveable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:giveable", data);
    }

    /**
     * Sets the offset from the ground that the entity is actually at.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_ground_offset
     */
    addGroundOffset(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:ground_offset", data);
    }

    /**
     * Keeps track of entity group size in the given radius.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_group_size
     */
    addGroupSize(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:group_size", data);
    }

    /**
     * Could increase crop growth when entity walks over crop.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_grows_crop
     */
    addGrowsCrop(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:grows_crop", data);
    }

    /**
     * How entities heal.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_healable
     */
    addHealable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:healable", data);
    }

    /**
     * Defines the entity's heartbeat.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_heartbeat
     */
    addHeartbeat(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:heartbeat", data);
    }

    /**
     * Moves to and hides at their owned POI or the closest nearby.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_hide
     */
    addHide(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:hide", data);
    }

    /**
     * Saves a home position for when the entity is spawned. This component allows entities like bees to remember and return to a specific location such as a hive or nest.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_home
     */
    addHome(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:home", data);
    }

    /**
     * Determines the jump height for a horse or similar entity, like a donkey.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_horse.jump_strength
     */
    addHorseJumpStrength(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:horse.jump_strength", data);
    }

    /**
     * Defines a set of conditions under which an entity should take damage.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_hurt_on_condition
     */
    addHurtOnCondition(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:hurt_on_condition", data);
    }

    /**
     * When set, blocks entities from attacking the owner entity unless they have the "minecraft:ignore_cannot_be_attacked" component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_ignore_cannot_be_attacked
     */
    addIgnoreCannotBeAttacked(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:ignore_cannot_be_attacked", data);
    }

    /**
     * When configured as a rideable entity, the entity will be controlled using WASD controls and mouse to move in three dimensions.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_input_air_controlled
     */
    addInputAirControlled(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:input_air_controlled", data);
    }

    /**
     * When configured as a rideable entity, the entity will be controlled using WASD controls. Beginning with 1.19.50 the default auto step height for rideable entities is half a block. Consider adding the "minecraft:variable_max_auto_step" component to increase it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_input_ground_controlled
     */
    addInputGroundControlled(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:input_ground_controlled", data);
    }

    /**
     * Verifies whether the entity is inside any of the listed blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_inside_block_notifier
     */
    addInsideBlockNotifier(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:inside_block_notifier", data);
    }

    /**
     * Adds a timer since last rested to see if phantoms should spawn.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_insomnia
     */
    addInsomnia(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:insomnia", data);
    }

    /**
     * Despawns the Actor immediately.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_instant_despawn
     */
    addInstantDespawn(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:instant_despawn", data);
    }

    /**
     * Defines interactions with this entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_interact
     */
    addInteract(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:interact", data);
    }

    /**
     * Sets that this entity is a baby. This is used to set the is_baby value for use in query functions like Molang and Filters.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_baby
     */
    addIsBaby(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_baby", data);
    }

    /**
     * Sets that this entity is charged. This is used to set the is_charged value for use in query functions like Molang and Filters.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_charged
     */
    addIsCharged(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_charged", data);
    }

    /**
     * Sets that this entity is currently carrying a chest.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_chested
     */
    addIsChested(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_chested", data);
    }

    /**
     * Allows dyes to be used on this entity to change its color.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_dyeable
     */
    addIsDyeable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_dyeable", data);
    }

    /**
     * The entity can hide from hostile mobs while invisible.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_hidden_when_invisible
     */
    addIsHiddenWhenInvisible(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_hidden_when_invisible", data);
    }

    /**
     * Sets that this entity is currently on fire.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_ignited
     */
    addIsIgnited(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_ignited", data);
    }

    /**
     * Sets that this entity is an Illager Captain.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_illager_captain
     */
    addIsIllagerCaptain(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_illager_captain", data);
    }

    /**
     * Sets that this entity is currently pregnant.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_pregnant
     */
    addIsPregnant(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_pregnant", data);
    }

    /**
     * Sets that this entity is currently saddled.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_saddled
     */
    addIsSaddled(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_saddled", data);
    }

    /**
     * Sets that this entity is currently shaking.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_shaking
     */
    addIsShaking(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_shaking", data);
    }

    /**
     * Sets that this entity is currently sheared.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_sheared
     */
    addIsSheared(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_sheared", data);
    }

    /**
     * Allows instances of this entity to have vertical and horizontal collisions with each other. For a collision to occur, both instances must have a "minecraft:collision_box" component. Stackable behavior is closely related to collidable behavior. While the "minecraft:is_stackable" component describes how an entity interacts with others of its own kind, the "minecraft:is_collidable" component governs how other mobs interact with the component's owner.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_stackable
     */
    addIsStackable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_stackable", data);
    }

    /**
     * Sets that this entity is currently stunned.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_stunned
     */
    addIsStunned(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_stunned", data);
    }

    /**
     * Sets that this entity is currently tamed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_is_tamed
     */
    addIsTamed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:is_tamed", data);
    }

    /**
     * Defines what items can be used to control this entity while ridden.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_item_controllable
     */
    addItemControllable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:item_controllable", data);
    }

    /**
     * Determines that this entity is an item hopper.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_item_hopper
     */
    addItemHopper(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:item_hopper", data);
    }

    /**
     * Defines a dynamic type jump control that will change jump properties based on the speed modifier of the mob. Requires `minecraft:movement.skip` to be used.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_jump.dynamic
     */
    addJumpDynamic(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:jump.dynamic", data);
    }

    /**
     * Gives the entity the ability to jump.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_jump.static
     */
    addJumpStatic(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:jump.static", data);
    }

    /**
     * Determines an entity's resistance to knockback from melee attacks. A value of 0.0 means no resistance, while 1.0 provides full immunity to knockback (like iron golems).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_knockback_resistance
     */
    addKnockbackResistance(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:knockback_resistance", data);
    }

    /**
     * Allows a custom movement speed across lava blocks.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_lava_movement
     */
    addLavaMovement(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:lava_movement", data);
    }

    /**
     * Describes how this mob can be leashed to other items.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_leashable
     */
    addLeashable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:leashable", data);
    }

    /**
     * Allows players to leash entities to this entity, retrieve entities already leashed to it, or free them using shears. For the last interaction to work, the leashed entities must have "can_be_cut" set to true in their "minecraft:leashable" component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_leashable_to
     */
    addLeashableTo(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:leashable_to", data);
    }

    /**
     * Defines the behavior when another entity looks at the owner entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_looked_at
     */
    addLookedAt(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:looked_at", data);
    }

    /**
     * Specifies the loot table that determines what items this entity drops upon death. The table path is relative to the behavior pack's root folder.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_loot
     */
    addLoot(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:loot", data);
    }

    /**
     * Adds the `minecraft:luck` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addLuck(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:luck", data);
    }

    /**
     * Manages the entity's ability to trade.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_managed_wandering_trader
     */
    addManagedWanderingTrader(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:managed_wandering_trader", data);
    }

    /**
     * Mark Variant is typically used as an additional per-type way (besides `variant`) to express a different visual form of the same mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_mark_variant
     */
    addMarkVariant(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:mark_variant", data);
    }

    /**
     * Adds the `minecraft:memory_behavior.flee_threat` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemoryBehaviorFleeThreat(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_behavior.flee_threat", data);
    }

    /**
     * Adds the `minecraft:memory_behavior.follow_target` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemoryBehaviorFollowTarget(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_behavior.follow_target", data);
    }

    /**
     * Allows the mob to move to a target position. Using memories, the mob will try to stick to the original target position it chose until that position is removed. Requires a FindBlockSensor.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemoryBehaviorMoveToPosition(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_behavior.move_to_position", data);
    }

    /**
     * Adds the `minecraft:memory_sensor.find_nearest_entity` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemorySensorFindNearestEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_sensor.find_nearest_entity", data);
    }

    /**
     * Adds the `minecraft:memory_sensor.find_nearest_entity_from` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemorySensorFindNearestEntityFrom(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_sensor.find_nearest_entity_from", data);
    }

    /**
     * Adds the `minecraft:memory_sensor.find_nearest_poi` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemorySensorFindNearestPoi(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_sensor.find_nearest_poi", data);
    }

    /**
     * Adds the `minecraft:memory_sensor.in_range_of_block` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemorySensorInRangeOfBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_sensor.in_range_of_block", data);
    }

    /**
     * Adds the `minecraft:memory_sensor.in_range_of_entity` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMemorySensorInRangeOfEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:memory_sensor.in_range_of_entity", data);
    }

    /**
     * A component that applies a mob effect to entities that get within range.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_mob_effect
     */
    addMobEffect(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:mob_effect", data);
    }

    /**
     * Entities with this component will have an immunity to the provided mob effects.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_mob_effect_immunity
     */
    addMobEffectImmunity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:mob_effect_immunity", data);
    }

    /**
     * Defines the base movement speed of an entity. Typical values: creeper (0.2), cow (0.25), zombie baby (0.35).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement
     */
    addMovement(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement", data);
    }

    /**
     * This move control allows the mob to swim in water and walk on land.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.amphibious
     */
    addMovementAmphibious(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.amphibious", data);
    }

    /**
     * This component accents the movement of an entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.basic
     */
    addMovementBasic(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.basic", data);
    }

    /**
     * This component can control how dolphins move, in a dolphin-esque style.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.dolphin
     */
    addMovementDolphin(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.dolphin", data);
    }

    /**
     * This move control causes the mob to fly.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.fly
     */
    addMovementFly(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.fly", data);
    }

    /**
     * This move control allows a mob to fly, swim, climb, etc.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.generic
     */
    addMovementGeneric(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.generic", data);
    }

    /**
     * This move control causes the mob to glide.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.glide
     */
    addMovementGlide(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.glide", data);
    }

    /**
     * This move control causes the mob to hover.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.hover
     */
    addMovementHover(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.hover", data);
    }

    /**
     * Move control that causes the mob to jump as it moves with a specified delay between jumps.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.jump
     */
    addMovementJump(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.jump", data);
    }

    /**
     * This move control causes the mob to hop as it moves.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.skip
     */
    addMovementSkip(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.skip", data);
    }

    /**
     * This move control causes the mob to sway side to side giving the impression it is swimming.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.sway
     */
    addMovementSway(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.sway", data);
    }

    /**
     * Sets the offset used to determine the next step distance for playing a movement sound.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_movement.sound_distance_offset
     */
    addMovementSoundDistanceOffset(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement.sound_distance_offset", data);
    }

    /**
     * Sets the offset used to determine the next step distance for playing a movement sound.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addMovementSoundDistanceOffsetLegacy(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:movement_sound_distance_offset", data);
    }

    /**
     * Allows this entity to be named (e.g. using a name tag).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_nameable
     */
    addNameable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:nameable", data);
    }

    /**
     * Allows this entity to generate paths that include vertical walls like the vanilla Spiders do.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.climb
     */
    addNavigationClimb(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.climb", data);
    }

    /**
     * Allows this entity to generate paths by flying around the air like the regular Ghast.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.float
     */
    addNavigationFloat(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.float", data);
    }

    /**
     * Allows this entity to generate paths in the air like the vanilla Parrots do.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.fly
     */
    addNavigationFly(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.fly", data);
    }

    /**
     * Allows this entity to generate paths by walking, swimming, flying and/or climbing around and jumping up and down a block.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.generic
     */
    addNavigationGeneric(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.generic", data);
    }

    /**
     * Allows this entity to generate paths in the air like the vanilla Bees do. Keeps them from falling out of the skies and doing predictive movement.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.hover
     */
    addNavigationHover(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.hover", data);
    }

    /**
     * Allows this entity to generate paths that include water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.swim
     */
    addNavigationSwim(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.swim", data);
    }

    /**
     * Walking style of the mob.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_navigation.walk
     */
    addNavigationWalk(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:navigation.walk", data);
    }

    /**
     * Adds the `minecraft:npc` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addNpc(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:npc", data);
    }

    /**
     * Defines the way an entity can create a born offspring.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_offspring
     */
    addOffspring(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:offspring", data);
    }

    /**
     * Adds a trigger to call on this entity's death.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_death
     */
    addOnDeath(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_death", data);
    }

    /**
     * Allows to specify events to execute when equipment is set in the entity's default equipment slots. Doesn't apply to "minecraft:inventory", use "minecraft:equippable" instead.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_equipment_changed
     */
    addOnEquipmentChanged(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_equipment_changed", data);
    }

    /**
     * Adds a trigger that will run when a nearby entity of the same type as this entity becomes Angry.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_friendly_anger
     */
    addOnFriendlyAnger(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_friendly_anger", data);
    }

    /**
     * Adds a trigger to call when this entity takes damage.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_hurt
     */
    addOnHurt(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_hurt", data);
    }

    /**
     * Adds a trigger to call when this entity is attacked by the player.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_hurt_by_player
     */
    addOnHurtByPlayer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_hurt_by_player", data);
    }

    /**
     * Adds a trigger to call when this entity is set on fire.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_ignite
     */
    addOnIgnite(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_ignite", data);
    }

    /**
     * Only usable by the Ender Dragon. Adds a trigger to call when this entity lands.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_start_landing
     */
    addOnStartLanding(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_start_landing", data);
    }

    /**
     * Only usable by the Ender Dragon. Adds a trigger to call when this entity starts flying.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_start_takeoff
     */
    addOnStartTakeoff(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_start_takeoff", data);
    }

    /**
     * Adds a trigger to call when this entity finds a target.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_target_acquired
     */
    addOnTargetAcquired(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_target_acquired", data);
    }

    /**
     * Adds a trigger to call when this entity loses the target it currently has.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_target_escape
     */
    addOnTargetEscape(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_target_escape", data);
    }

    /**
     * A trigger when a mob's tamed onwer wakes up.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitytriggers/minecrafttrigger_on_wake_with_owner
     */
    addOnWakeWithOwner(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:on_wake_with_owner", data);
    }

    /**
     * Defines the entity's 'out of control' state.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_out_of_control
     */
    addOutOfControl(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:out_of_control", data);
    }

    /**
     * Defines the entity's 'peek' behavior, defining the events that should be called during it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_peek
     */
    addPeek(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:peek", data);
    }

    /**
     * Defines the player's exhaustion level.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_player.exhaustion
     */
    addPlayerExhaustion(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:player.exhaustion", data);
    }

    /**
     * Defines how much experience each player action should take.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_player.experience
     */
    addPlayerExperience(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:player.experience", data);
    }

    /**
     * Adds the `minecraft:player.hunger` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addPlayerHunger(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:player.hunger", data);
    }

    /**
     * Defines the player's level.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_player.level
     */
    addPlayerLevel(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:player.level", data);
    }

    /**
     * Defines the player's need for food.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_player.saturation
     */
    addPlayerSaturation(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:player.saturation", data);
    }

    /**
     * Specifies costing information for mobs that prefer to walk on preferred paths.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_preferred_path
     */
    addPreferredPath(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:preferred_path", data);
    }

    /**
     * Allows the entity to be a thrown entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_projectile
     */
    addProjectile(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:projectile", data);
    }

    /**
     * Sets the distance through which the entity can push through.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_push_through
     */
    addPushThrough(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:push_through", data);
    }

    /**
     * Allows the entity to be pushed by certain blocks, like Shulker Boxes and Pistons.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_pushable_by_block
     */
    addPushableByBlock(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:pushable_by_block", data);
    }

    /**
     * Allows an entity to be pushed by other entities.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_pushable_by_entity
     */
    addPushableByEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:pushable_by_entity", data);
    }

    /**
     * Attempts to trigger a raid at the entity's location.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_raid_trigger
     */
    addRaidTrigger(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:raid_trigger", data);
    }

    /**
     * Defines the entity's movement on the rails. An entity with this component is only allowed to move on the rail.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_rail_movement
     */
    addRailMovement(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:rail_movement", data);
    }

    /**
     * Enables minecart-type entities to detect powered rails and respond to activation state changes. Triggers events when the entity passes over activated or deactivated rails, enabling custom minecart behaviors like launching at boosted speed, stopping at braking rails, or triggering special effects at detector rails.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_rail_sensor
     */
    addRailSensor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:rail_sensor", data);
    }

    /**
     * Defines the ravager's response to their melee attack being blocked.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_ravager_blocked
     */
    addRavagerBlocked(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:ravager_blocked", data);
    }

    /**
     * [EXPERIMENTAL] Allows an entity to reflect projectiles.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_reflect_projectiles
     */
    addReflectProjectiles(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:reflect_projectiles", data);
    }

    /**
     * Denotes entities that are not allowed to exist in "Peaceful" difficulty.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_remove_in_peaceful
     */
    addRemoveInPeaceful(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:remove_in_peaceful", data);
    }

    /**
     * When set, the entity will render even when invisible. Appropriate rendering behavior can then be specified in the corresponding "minecraft:client_entity".
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_renders_when_invisible
     */
    addRendersWhenInvisible(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:renders_when_invisible", data);
    }

    /**
     * This entity can be ridden.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_rideable
     */
    addRideable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:rideable", data);
    }

    /**
     * Causes the entity to automatically rotate to align with the nearest cardinal direction based on its current facing direction. Combining this with the "minecraft:body_rotation_blocked" component will cause the entity's body to align with the nearest cardinal direction and remain fixed in that orientation, regardless of changes in its facing direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_rotation_axis_aligned
     */
    addRotationAxisAligned(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:rotation_axis_aligned", data);
    }

    /**
     * Causes the entity's rotation to match their vehicle's facing direction.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_rotation_locked_to_vehicle
     */
    addRotationLockedToVehicle(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:rotation_locked_to_vehicle", data);
    }

    /**
     * Adds the `minecraft:scaffolding_climber` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_scaffolding_climber
     */
    addScaffoldingClimber(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:scaffolding_climber", data);
    }

    /**
     * Sets the entity's visual size multiplier. A value of 1.0 means normal size, 0.5 is half size (commonly used for baby mobs), and values above 1.0 make the entity larger.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_scale
     */
    addScale(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:scale", data);
    }

    /**
     * Defines the entity's size interpolation based on the entity's age.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_scale_by_age
     */
    addScaleByAge(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:scale_by_age", data);
    }

    /**
     * Fires off scheduled mob events at time of day events.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_scheduler
     */
    addScheduler(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:scheduler", data);
    }

    /**
     * Defines a list of items the mob wants to share or pick up. Items can be configured with optional parameters to control pickup, sharing, and inventory behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_shareables
     */
    addShareables(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:shareables", data);
    }

    /**
     * Defines the entity's ranged attack behavior. The "minecraft:behavior.ranged_attack" goal uses this component to determine which projectiles to shoot.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_shooter
     */
    addShooter(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:shooter", data);
    }

    /**
     * Defines the entity's 'sit' state.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_sittable
     */
    addSittable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:sittable", data);
    }

    /**
     * Skin ID value. Can be used to differentiate skins, such as base skins for villagers.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_skin_id
     */
    addSkinId(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:skin_id", data);
    }

    /**
     * Sets the entity's base volume for sound effects.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_sound_volume
     */
    addSoundVolume(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:sound_volume", data);
    }

    /**
     * Enables interacting with this entity using its own spawn egg to spawn a born child. Runs the "minecraft:entity_born" event on the created entity as well as the defined "on_spawn" event.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_spawn_egg_interaction
     */
    addSpawnEggInteraction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:spawn_egg_interaction", data);
    }

    /**
     * Adds a timer after which this entity will spawn another entity or item (similar to vanilla's chicken's egg-laying behavior).
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_spawn_entity
     */
    addSpawnEntity(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:spawn_entity", data);
    }

    /**
     * Component for spawning entities when an entity perishes.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_spawn_on_death
     */
    addSpawnOnDeath(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:spawn_on_death", data);
    }

    /**
     * Allows an entity to add or remove status effects from itself. Similarly to `addrider`, this component performs a one-time operation on the entity when added. Removing the component will not change the entity's current effects. Adding different versions of the component multiple times will perform each one in turn. Once the component has been added, it will not provide any further functionality. There is one exception to this behavior: if this component is present on a player, its effects will be re-applied every time the player enters the world. To avoid this, remove the component shortly after adding it, or add an empty component to replace it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_spell_effects
     */
    addSpellEffects(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:spell_effects", data);
    }

    /**
     * Defines the entity's strength to carry items.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_strength
     */
    addStrength(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:strength", data);
    }

    /**
     * Allows this entity to remember suspicious locations.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_suspect_tracking
     */
    addSuspectTracking(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:suspect_tracking", data);
    }

    /**
     * This entity can be tamed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_tameable
     */
    addTameable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:tameable", data);
    }

    /**
     * Allows the Entity to be tamed by mounting it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_tamemount
     */
    addTamemount(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:tamemount", data);
    }

    /**
     * Defines the entity's range within which it can see or sense other entities to target them.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_target_nearby_sensor
     */
    addTargetNearbySensor(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:target_nearby_sensor", data);
    }

    /**
     * Defines an entity's teleporting behavior.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_teleport
     */
    addTeleport(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:teleport", data);
    }

    /**
     * Defines if the entity ticks the world and the radius around it to tick.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_tick_world
     */
    addTickWorld(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:tick_world", data);
    }

    /**
     * Adds a timer after which an event will fire.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_timer
     */
    addTimer(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:timer", data);
    }

    /**
     * Resupplies an entity's trade.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trade_resupply
     */
    addTradeResupply(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:trade_resupply", data);
    }

    /**
     * Defines this entity's ability to trade with players.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trade_table
     */
    addTradeTable(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:trade_table", data);
    }

    /**
     * Defines this entity's legacy trade table path.
     *
     * Prefer `addEconomyTradeTablePath` for new villager-style trading content.
     * The table path is relative to the pack root, for example
     * `trading/farmer_trades.json`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/createtradetable
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trade_table
     */
    addTradeTablePath(table: string, data: Record<string, unknown> = {}): this {
        return this.addTradeTable({ ...data, table });
    }

    /**
     * Causes an entity to leave a trail of blocks as it moves about the world.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trail
     */
    addTrail(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:trail", data);
    }

    /**
     * Defines an entity's transformation from the current definition into another.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_transformation
     */
    addTransformation(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:transformation", data);
    }

    /**
     * An entity with this component will NEVER persist, and forever disappear when unloaded.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_transient
     */
    addTransient(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:transient", data);
    }

    /**
     * Allows this entity to trust multiple players.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trust
     */
    addTrust(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:trust", data);
    }

    /**
     * Defines the rules for a mob to trust players.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_trusting
     */
    addTrusting(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:trusting", data);
    }

    /**
     * Pauses this entity's breathing under water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_underwater_mount_breathing
     */
    addUnderwaterMountBreathing(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:underwater_mount_breathing", data);
    }

    /**
     * Defines the speed with which an entity can move through water.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_underwater_movement
     */
    addUnderwaterMovement(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:underwater_movement", data);
    }

    /**
     * When set, legacy calculations are used when applying "minecraft:friction_modifier". This component is automatically added to legacy content to preserve existing behavior. The legacy calculations are incorrect and should not be used for new content.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_uses_legacy_friction
     */
    addUsesLegacyFriction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:uses_legacy_friction", data);
    }

    /**
     * Adds the `minecraft:uses_uniform_air_drag` entity component.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/componentlist
     */
    addUsesUniformAirDrag(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:uses_uniform_air_drag", data);
    }

    /**
     * Entities with this component will have a maximum auto step height that is different depending on whether they are on a block that prevents jumping. Incompatible with "runtime_identifier": "minecraft:horse".
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_variable_max_auto_step
     */
    addVariableMaxAutoStep(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:variable_max_auto_step", data);
    }

    /**
     * Variant is typically used as a per-type way to express a different visual form of the same mob. For example, for cats, variant is a number that defines the breed of cat.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_variant
     */
    addVariant(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:variant", data);
    }

    /**
     * When configured as a rideable entity, the entity will move upwards or downwards when the player uses the jump action.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_vertical_movement.action
     */
    addVerticalMovementAction(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:vertical_movement_action", data);
    }

    /**
     * Vibrations emitted by an entity with this component will be ignored.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_vibration_damper
     */
    addVibrationDamper(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:vibration_damper", data);
    }

    /**
     * Allows the entity to listen to vibration events. This is a largely-internal component, that is only supported on the Warden and Allay mobs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_vibration_listener
     */
    addVibrationListener(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:vibration_listener", data);
    }

    /**
     * Sets the speed multiplier for this entity's walk animation speed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_walk_animation_speed
     */
    addWalkAnimationSpeed(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:walk_animation_speed", data);
    }

    /**
     * Sets that this entity wants to become a jockey.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_wants_jockey
     */
    addWantsJockey(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:wants_jockey", data);
    }

    /**
     * Customizes how the entity moves through water by adjusting drag coefficient. Lower values let entities glide through water easily like fish, while higher values create resistance for entities that struggle in water. Essential for aquatic mobs, boats, and any entity needing custom underwater physics.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_water_movement
     */
    addWaterMovement(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:water_movement", data);
    }

    /**
     * Allows the wither to focus its attacks on whichever mob has dealt the most damage to it.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_wither_target_highest_damage
     */
    addWitherTargetHighestDamage(data: EntityComponentData = {}): this {
        return this.addComponent("minecraft:wither_target_highest_damage", data);
    }

}
