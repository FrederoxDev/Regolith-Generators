import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";

export class ServerEntityGenerator extends GeneratorFactory<ServerEntityDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/entities");
    }

    makeEntity(id: string): ServerEntityDef {
        const def = new ServerEntityDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export type EntityProperty = { client_sync?: boolean } & (
    { type: "bool", default: boolean } |
    { type: "float", default: string, range: [number | string, number | string] } |
    { type: "int", default: number, range: [number, number] } |
    { type: "enum", default: number, values: string[] }
)

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
        }
    }

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
     * Sets whether or not we can summon this entity using commands such as /summon.
     */
    setSummonable(summonable: boolean): this {
        this.setValueAtPath("minecraft:entity/description/is_summonable", summonable);
        return this;
    }

    addEvent(eventID: string, data: unknown): this {
        this.setValueAtPath(`minecraft:entity/events/${eventID}`, data);
        return this;
    }

    addComponentGroup(groupID: string, components: EntityComponents): this {
        this.setValueAtPath(`minecraft:entity/component_groups/${groupID}`, components.toJson());
        return this;
    }

    addProperty(propertyID: string, data: EntityProperty): this {
        this.setValueAtPath(`minecraft:entity/description/properties/${propertyID}`, data);
        return this;
    }
}

export class EntityComponents extends GeneratorBase<EntityComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    addComponent(id: string, data: Record<string, unknown> | string | number | boolean | Array<unknown>): this  {
        this.setValueAtPath(id, data);
        return this;
    }

    addTag(tag: string): this { 
        this.setValueAtPath(`tag:${tag}`, {});
        return this;
    }

    addInventory(numSlots: number, isPrivate: boolean = false): this  {
        return this.addComponent("minecraft:inventory", {
            "inventory_size": numSlots,
            "private": isPrivate,
            "container_type": "inventory"
        });
    }

    addEqippable(): this {
        return this.addComponent("minecraft:equippable", {});
    }

    addIsCollidable(): this {
        return this.addComponent("minecraft:is_collidable", {});
    }

    addCannotBeAttacked(): this {
        return this.addComponent("minecraft:cannot_be_attacked", {});
    }

    addPhysics(hasCollision: boolean, hasGravity: boolean, pushTowardsClosestSpace: boolean = false): this  {
        return this.addComponent("minecraft:physics", {
            "has_collision": hasCollision,
            "has_gravity": hasGravity,
            "push_towards_closest_space": pushTowardsClosestSpace
        });
    }

    addCollisionBox(width: number, height: number): this  {
        return this.addComponent("minecraft:collision_box", {
            "height": height,
            "width": width
        });
    }

    addTypeFamily(family: string): this {
        const existingFamilies = this.getValueAtPath<string[]>("minecraft:type_family/family", []);
        existingFamilies.push(family);
        this.setValueAtPath("minecraft:type_family/family", existingFamilies);
        return this;
    }

    addBreathable(breathesWater: boolean): this {
        return this.addComponent("minecraft:breathable", {
            "breathes_water": breathesWater
        });
    }

    addPushable(isPushable: boolean, isPushableByPiston: boolean): this {
        return this.addComponent("minecraft:pushable", {
            "is_pushable": isPushable,
            "is_pushable_by_piston": isPushableByPiston
        });
    }

    addPersistent(): this {
        return this.addComponent("minecraft:persistent", {});
    }

    disableDamage(): this {
        return this.addComponent("minecraft:damage_sensor", {
            "triggers": {
                "deals_damage": "no",
            }
        });
    }
}