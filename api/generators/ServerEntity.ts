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
    { type: "float", default: string, range: [number, number] } |
    { type: "int", default: number, range: [number, number] } |
    { type: "enum", default: number, values: string[] }
)

export class ServerEntityDef extends GeneratorBase<ServerEntityDef> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.20.80",
            "minecraft:entity": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "components": {}
            }
        }
    }

    addComponents(components: EntityComponents) {
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
    setSpawnability(spawnable: boolean) {
        this.setValueAtPath("minecraft:entity/description/is_spawnable", spawnable);
        return this;
    }

    /**
     * Sets whether or not we can summon this entity using commands such as /summon.
     */
    setSummonable(summonable: boolean) {
        this.setValueAtPath("minecraft:entity/description/is_summonable", summonable);
        return this;
    }

    addEvent(eventID: string, data: unknown) {
        this.setValueAtPath(`minecraft:entity/events/${eventID}`, data);
        return this;
    }

    addComponentGroup(groupID: string, components: EntityComponents) {
        this.setValueAtPath(`minecraft:entity/component_groups/${groupID}`, components.toJson());
        return this;
    }

    addProperty(propertyID: string, data: EntityProperty) {
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

    addComponent(id: string, data: Record<string, unknown> | string | number | boolean | Array<unknown>) {
        this.setValueAtPath(id, data);
        return this;
    }

    addInventory(numSlots: number, isPrivate: boolean = false) {
        return this.addComponent("minecraft:inventory", {
            "inventory_size": numSlots,
            "private": isPrivate,
            "container_type": "inventory"
        });
    }

    addPhysics(hasCollision: boolean, hasGravity: boolean, pushTowardsClosestSpace: boolean = false) {
        return this.addComponent("minecraft:physics", {
            "has_collision": hasCollision,
            "has_gravity": hasGravity,
            "push_towards_closest_space": pushTowardsClosestSpace
        });
    }

    addCollisionBox(width: number, height: number) {
        return this.addComponent("minecraft:collision_box", {
            "height": height,
            "width": width
        });
    }

    addTypeFamily(family: string) {
        const existingFamilies = this.getValueAtPath<string[]>("minecraft:type_family/family", []);
        existingFamilies.push(family);
        this.setValueAtPath("minecraft:type_family/family", existingFamilies);
        return this;
    }
}