import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import {
    ItemSlot,
    type ItemBlockDescriptor,
    type ItemCooldownType,
    type ItemDiggerDestroySpeed,
    type ItemDurabilitySensorThreshold,
    type ItemEnchantableSlot,
    type ItemEntityDescriptor,
    type ItemFoodOptions,
    type ItemIconTextures,
    type ItemIntRange,
    type ItemKineticEffectConditions,
    type ItemKineticWeaponOptions,
    type ItemPiercingWeaponOptions,
    type ItemRarity,
    type ItemRepairEntry,
    type ItemRgbColor,
    type ItemShooterAmmunition,
    type ItemShooterOptions,
    type ItemStorageItemFilter,
    type ItemSwingSounds,
    type ItemThrowableOptions,
    type ItemUseAnimation,
    type ItemUseModifiersOptions,
    type ItemWearableOptions,
} from "./ItemComponentTypes.ts";
import { LangGenerator, ToTitleCase } from "./Lang.ts";

export * from "./ItemComponentTypes.ts";

/**
 * Factory for behavior-pack item definition files.
 *
 * Generated files are written under `BP/items`. If a `LangGenerator` is
 * provided, item definitions can add localization entries through
 * `addDefaultLocalization()` or `addLocalization(...)`.
 */
export class ItemGenerator extends GeneratorFactory<ItemDef> {
    langFile: LangGenerator | undefined;

    /**
     * Creates an item generator for a project namespace.
     */
    constructor(projectNamespace: string, langFile: LangGenerator | undefined = undefined) {
        super(projectNamespace, "BP/items");
        this.langFile = langFile;
    }

    /**
     * Creates and stores a new item definition.
     *
     * The final identifier is built as `projectNamespace:id`.
     */
    makeItem(id: string): ItemDef {
        const def = new ItemDef(this.projectNamespace, id, this.langFile);
        this.filesToGenerate.set(id, def);
        return def;
    }

    /**
     * Gets an item definition that was already created with `makeItem(...)`.
     *
     * Throws if the id has not been registered on this generator.
     */
    getItem(id: string): ItemDef {
        const item = this.filesToGenerate.get(id);
        if (!item) {
            throw new Error(`Item with id ${id} not found`);
        }

        return item;
    }
}

// export type ItemCategory = "construction" | "equipment" | "items" | "nature" | "none";

/**
 * Creative inventory and recipe-book categories accepted by item
 * `description.menu_category.category`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_item
 */
export enum ItemCategory {
    Construction = "construction",
    Equipment = "equipment",
    Items = "items",
    Nature = "nature",
    None = "none"
}

/**
 * Behavior-pack item definition.
 *
 * The root shape is `format_version` plus a `minecraft:item` object containing
 * `description` and `components`. The constructor gives items an identifier
 * and places them in the `items` creative category by default.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_item
 */
export class ItemDef extends GeneratorBase<ItemDef> {
    data: Record<string, unknown>;
    langFile: LangGenerator | undefined;

    /**
     * Creates an item definition with identifier `projectNamespace:id`.
     */
    constructor(projectNamespace: string, id: string, langFile: LangGenerator | undefined) {
        super();

        this.langFile = langFile;

        this.data = {
            "format_version": "1.26.0",
            "minecraft:item": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`,
                    "menu_category": {
                        "category": "items"
                    }
                },
                "components": {}
            }
        }
    }

    /**
     * Adds an entire set of item components at once.
     *
     * Component data is deep-merged into `minecraft:item/components`, so this
     * can be used to compose reusable `ItemComponents` bundles.
     */
    addComponents(components: ItemComponents): this {
        const newComponents = components.toJson();
        this.deepMerge("minecraft:item/components", newComponents);
        return this;
    }

    /**
     * Hides this item from command suggestions and command usage.
     *
     * Microsoft docs place this under
     * `minecraft:item.description.menu_category.is_hidden_in_commands`.
     * Commands can use items by default unless this is set.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_item
     */
    setHiddenInCommands(): this {
        this.setValueAtPath("minecraft:item/description/menu_category/is_hidden_in_commands", true);
        return this;
    }

    /**
     * Sets the creative inventory and recipe-book category for this item.
     *
     * The current docs list `construction`, `equipment`, `items`, `nature`,
     * and `none`. `none` keeps the item out of creative inventory categories.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_item
     */
    setCategory(category: ItemCategory): this {
        this.setValueAtPath("minecraft:item/description/menu_category/category", category);
        return this;
    }

    /**
     * Adds a generated localization entry for this item.
     *
     * The localization key is `item.<namespace:id>` and the value is built from
     * the item id in title case. Requires this item generator to have been
     * constructed with a `LangGenerator`.
     */
    addDefaultLocalization(): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to ItemGenerator, cannot add localization.");
        }

        const id = this.getValueAtPath<string>("minecraft:item/description/identifier", "");
        if (id === "") {
            throw new Error("ItemDef has no identifier, cannot add localization.");
        }

        const name = id.split(":")[1];
        const titleCaseName = ToTitleCase(name);

        this.langFile.addLine(`item.${id}`, titleCaseName);
        return this;
    }

    /**
     * Adds a localization entry for this item.
     *
     * The localization key is `item.<namespace:id>`. Requires this item
     * generator to have been constructed with a `LangGenerator`.
     */
    addLocalization(value: string): this {
        if (this.langFile === undefined) {
            throw new Error("No LangGenerator provided to ItemGenerator, cannot add localization.");
        }
        const id = this.getValueAtPath<string>("minecraft:item/description/identifier", "");
        if (id === "") {
            throw new Error("ItemDef has no identifier, cannot add localization.");
        }

        this.langFile.addLine(`item.${id}`, value);
        return this;
    }
}

/**
 * Builder for an item's `minecraft:item.components` object.
 */
export class ItemComponents extends GeneratorBase<ItemComponents> {
    data: Record<string, unknown>;

    constructor() {
        super();
        this.data = {};
    }

    private arrayFrom<T>(value: T | T[]): T[] {
        return Array.isArray(value) ? value : [value];
    }

    private setIfDefined(data: Record<string, unknown>, key: string, value: unknown): void {
        if (value !== undefined) {
            data[key] = value;
        }
    }

    private toDurabilitySensorThreshold(threshold: ItemDurabilitySensorThreshold): Record<string, unknown> {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "durability", threshold.durability);
        this.setIfDefined(data, "particle_type", threshold.particleType);
        this.setIfDefined(data, "sound_event", threshold.soundEvent);
        return data;
    }

    private toKineticEffectConditions(conditions: ItemKineticEffectConditions): Record<string, unknown> {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "max_duration", conditions.maxDuration);
        this.setIfDefined(data, "min_relative_speed", conditions.minRelativeSpeed);
        this.setIfDefined(data, "min_speed", conditions.minSpeed);
        return data;
    }

    private toRepairEntry(entry: ItemRepairEntry): Record<string, unknown> {
        const data: Record<string, unknown> = {
            "items": entry.items
        };
        this.setIfDefined(data, "repair_amount", entry.repairAmount);
        return data;
    }

    private toShooterAmmunition(ammunition: ItemShooterAmmunition): Record<string, unknown> {
        const data: Record<string, unknown> = {
            "item": ammunition.item
        };
        this.setIfDefined(data, "search_inventory", ammunition.searchInventory);
        this.setIfDefined(data, "use_in_creative", ammunition.useInCreative);
        this.setIfDefined(data, "use_offhand", ammunition.useOffhand);
        return data;
    }

    /**
     * Raw escape hatch for adding any item component shape.
     *
     * Prefer dedicated helpers such as `addIcon`, `setMaxStackSize`, or
     * `setBlockPlacer` when they fit. Use this method for custom JSON,
     * experimental components, or one-off component composition.
     *
     * The component id is written relative to the item's `components` object.
     *
     * @example
     * ```ts
     * new ItemComponents().addComponent("minecraft:hover_text_color", "aqua");
     * ```
     */
    addComponent(id: string, data: Record<string, unknown> | string | number | boolean | unknown[]): this {
        this.setValueAtPath(id, data);
        return this;
    }

    /**
     * Adds a namespaced custom item component and optional JSON parameters.
     *
     * The component id must be registered from script before Minecraft can use
     * it. The data value becomes the custom component parameters passed to the
     * script callback.
     *
     * @see https://learn.microsoft.com/minecraft/creator/documents/scripting/custom-components
     * @see https://learn.microsoft.com/minecraft/creator/scriptapi/minecraft/server/itemcomponentregistry
     */
    addCustomComponent(id: string, data: Record<string, unknown> | string | number | boolean = {}): this {
        this.setValueAtPath(id, data);
        return this;
    }

    /**
     * Adds `minecraft:allow_off_hand`.
     *
     * This determines whether the item can be placed in the offhand slot.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_allow_off_hand
     */
    addAllowOffHand(value = true): this {
        return this.addComponent("minecraft:allow_off_hand", value);
    }

    /**
     * Adds `minecraft:bundle_interaction`.
     *
     * This adds bundle-specific interactions and tooltip behavior. Microsoft
     * docs require a `minecraft:storage_item` component as well.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_bundle_interaction
     */
    addBundleInteraction(numViewableSlots: number | undefined = undefined): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "num_viewable_slots", numViewableSlots);
        return this.addComponent("minecraft:bundle_interaction", data);
    }

    /**
     * Adds `minecraft:can_destroy_in_creative`.
     *
     * This determines whether the item can break blocks while the player is in
     * Creative mode.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_can_destroy_in_creative
     */
    addCanDestroyInCreative(value = true): this {
        return this.addComponent("minecraft:can_destroy_in_creative", value);
    }

    /**
     * Adds `minecraft:compostable`.
     *
     * `compostingChance` is the percentage chance, from 1 through 100, that
     * this item creates a composter layer.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_compostable
     */
    addCompostable(compostingChance: number): this {
        return this.addComponent("minecraft:compostable", {
            "composting_chance": compostingChance
        });
    }

    /**
     * Adds `minecraft:cooldown`.
     *
     * Items sharing the same `category` enter cooldown together after the
     * matching action type is performed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_cooldown
     */
    addCooldown(category: string, duration: number, type: ItemCooldownType = "use"): this {
        return this.addComponent("minecraft:cooldown", {
            "category": category,
            "duration": duration,
            "type": type
        });
    }

    /**
     * Adds deprecated `minecraft:custom_components`.
     *
     * Current custom components should be added directly with
     * `addCustomComponent(...)`. This helper exists for packs still targeting
     * the older ordered custom component array.
     *
     * @deprecated Microsoft docs mark `minecraft:custom_components` as no longer used in the latest versions.
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_custom_components
     */
    addLegacyCustomComponents(ids: string | string[]): this {
        return this.addComponent("minecraft:custom_components", this.arrayFrom(ids));
    }

    /**
     * Adds `minecraft:damage`.
     *
     * This controls how much extra attack damage the item deals.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_damage
     */
    addDamage(value: number): this {
        return this.addComponent("minecraft:damage", value);
    }

    /**
     * Adds `minecraft:damage_absorption`.
     *
     * A wearable item with durability can absorb the listed damage causes for
     * its wearer. The absorbed damage reduces item durability.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_damage_absorption
     */
    addDamageAbsorption(absorbableCauses: string | string[]): this {
        return this.addComponent("minecraft:damage_absorption", {
            "absorbable_causes": this.arrayFrom(absorbableCauses)
        });
    }

    /**
     * Adds `minecraft:digger`.
     *
     * Each destroy speed entry maps a block descriptor to a digging speed.
     * `useEfficiency` controls whether the Efficiency enchantment affects this
     * item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_digger
     */
    addDigger(destroySpeeds: ItemDiggerDestroySpeed | ItemDiggerDestroySpeed[], useEfficiency: boolean | undefined = undefined): this {
        const data: Record<string, unknown> = {
            "destroy_speeds": this.arrayFrom(destroySpeeds)
        };
        this.setIfDefined(data, "use_efficiency", useEfficiency);
        return this.addComponent("minecraft:digger", data);
    }

    /**
     * Adds `minecraft:display_name`.
     *
     * The value is the text or localization key shown for this item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_display_name
     */
    addDisplayName(value: string): this {
        return this.addComponent("minecraft:display_name", {
            "value": value
        });
    }

    /**
     * Adds `minecraft:durability`.
     *
     * `maxDurability` is the amount of damage the item can take before
     * breaking. `damageChance` controls the percentage chance that a use costs
     * durability.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_durability
     */
    addDurability(maxDurability: number, damageChance: ItemIntRange | undefined = undefined): this {
        const data: Record<string, unknown> = {
            "max_durability": maxDurability
        };
        this.setIfDefined(data, "damage_chance", damageChance);
        return this.addComponent("minecraft:durability", data);
    }

    /**
     * Adds `minecraft:durability_sensor`.
     *
     * Thresholds emit the configured sound or particle when item durability is
     * less than or equal to the threshold value. Requires `minecraft:durability`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_durability_sensor
     */
    addDurabilitySensor(thresholds: ItemDurabilitySensorThreshold | ItemDurabilitySensorThreshold[]): this {
        return this.addComponent("minecraft:durability_sensor", {
            "durability_thresholds": this.arrayFrom(thresholds).map((threshold) => this.toDurabilitySensorThreshold(threshold))
        });
    }

    /**
     * Adds `minecraft:dyeable`.
     *
     * `defaultColor` can be a hex color string or an RGB array.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_dyeable
     */
    addDyeable(defaultColor: string | ItemRgbColor | undefined = undefined): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "default_color", defaultColor);
        return this.addComponent("minecraft:dyeable", data);
    }

    /**
     * Adds `minecraft:enchantable`.
     *
     * `slot` controls which enchantment category applies, and `value` is the
     * enchantability value.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_enchantable
     */
    addEnchantable(slot: ItemEnchantableSlot, value: number): this {
        return this.addComponent("minecraft:enchantable", {
            "slot": slot,
            "value": value
        });
    }

    /**
     * Adds `minecraft:entity_placer`.
     *
     * This lets an item place an entity in the world. `useOn` and `dispenseOn`
     * restrict the blocks where the item can be used or dispensed.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_entity_placer
     */
    addEntityPlacer(
        entity: ItemEntityDescriptor,
        useOn: ItemBlockDescriptor | ItemBlockDescriptor[] | undefined = undefined,
        dispenseOn: ItemBlockDescriptor | ItemBlockDescriptor[] | undefined = undefined,
    ): this {
        const data: Record<string, unknown> = {
            "entity": entity
        };

        if (useOn !== undefined) {
            data["use_on"] = this.arrayFrom(useOn);
        }

        if (dispenseOn !== undefined) {
            data["dispense_on"] = this.arrayFrom(dispenseOn);
        }

        return this.addComponent("minecraft:entity_placer", data);
    }

    /**
     * Adds `minecraft:fire_resistant`.
     *
     * This controls whether the item is immune to burning when dropped in fire
     * or lava.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_fire_resistant
     */
    addFireResistant(value = true): this {
        return this.addComponent("minecraft:fire_resistant", {
            "value": value
        });
    }

    /**
     * Adds `minecraft:food`.
     *
     * Food items also need `minecraft:use_modifiers` to define use duration.
     * `saturationModifier` is used in Minecraft's saturation formula.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_food
     */
    addFood(nutrition: number, saturationModifier = 0.6, options: ItemFoodOptions = {}): this {
        const data: Record<string, unknown> = {
            "nutrition": nutrition,
            "saturation_modifier": saturationModifier
        };
        this.setIfDefined(data, "can_always_eat", options.canAlwaysEat);
        this.setIfDefined(data, "using_converts_to", options.usingConvertsTo);
        return this.addComponent("minecraft:food", data);
    }

    /**
     * Adds `minecraft:fuel`.
     *
     * `duration` is the number of seconds this item can cook items in a
     * furnace.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_fuel
     */
    addFuel(duration: number): this {
        return this.addComponent("minecraft:fuel", duration);
    }

    /**
     * Adds `minecraft:hand_equipped`.
     *
     * This controls whether the item is rendered like a tool in the player's
     * hand.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_hand_equipped
     */
    addHandEquipped(value = true): this {
        return this.addComponent("minecraft:hand_equipped", value);
    }

    /**
     * Adds `minecraft:hover_text_color`.
     *
     * The color controls the item name shown when hovering the item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_hover_text_color
     */
    addHoverTextColor(color: string): this {
        return this.addComponent("minecraft:hover_text_color", color);
    }

    /**
     * Adds `minecraft:interact_button`.
     *
     * Pass `true` to show the default touch interact button, `false` to hide
     * it, or a string to show custom text.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_interact_button
     */
    addInteractButton(value: boolean | string = true): this {
        return this.addComponent("minecraft:interact_button", value);
    }

    /**
     * Adds `minecraft:liquid_clipped`.
     *
     * This controls whether the item interacts with liquid blocks on use.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_liquid_clipped
     */
    addLiquidClipped(value = true): this {
        return this.addComponent("minecraft:liquid_clipped", value);
    }

    /**
     * Adds `minecraft:kinetic_weapon`.
     *
     * Kinetic weapons deal damage and effects based on movement projected onto
     * the user's view vector.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_kinetic_weapon
     */
    addKineticWeapon(options: ItemKineticWeaponOptions = {}): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "creative_reach", options.creativeReach);
        this.setIfDefined(
            data,
            "damage_conditions",
            options.damageConditions === undefined ? undefined : this.toKineticEffectConditions(options.damageConditions),
        );
        this.setIfDefined(data, "damage_modifier", options.damageModifier);
        this.setIfDefined(data, "damage_multiplier", options.damageMultiplier);
        this.setIfDefined(data, "delay", options.delay);
        this.setIfDefined(
            data,
            "dismount_conditions",
            options.dismountConditions === undefined ? undefined : this.toKineticEffectConditions(options.dismountConditions),
        );
        this.setIfDefined(data, "hitbox_margin", options.hitboxMargin);
        this.setIfDefined(
            data,
            "knockback_conditions",
            options.knockbackConditions === undefined ? undefined : this.toKineticEffectConditions(options.knockbackConditions),
        );
        this.setIfDefined(data, "reach", options.reach);
        return this.addComponent("minecraft:kinetic_weapon", data);
    }

    /**
     * Adds `minecraft:piercing_weapon`.
     *
     * Piercing weapons damage all entities detected in a line along the user's
     * view vector.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_piercing_weapon
     */
    addPiercingWeapon(options: ItemPiercingWeaponOptions = {}): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "creative_reach", options.creativeReach);
        this.setIfDefined(data, "hitbox_margin", options.hitboxMargin);
        this.setIfDefined(data, "reach", options.reach);
        return this.addComponent("minecraft:piercing_weapon", data);
    }

    /**
     * Adds `minecraft:projectile`.
     *
     * This defines the entity spawned when the item is fired or thrown.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_projectile
     */
    addProjectile(projectileEntity: ItemEntityDescriptor, minimumCriticalPower: number | undefined = undefined): this {
        const data: Record<string, unknown> = {
            "projectile_entity": projectileEntity
        };
        this.setIfDefined(data, "minimum_critical_power", minimumCriticalPower);
        return this.addComponent("minecraft:projectile", data);
    }

    /**
     * Adds `minecraft:rarity`.
     *
     * Rarity controls the base hover color of the item name. Enchantments can
     * increase the displayed rarity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_rarity
     */
    addRarity(rarity: ItemRarity): this {
        return this.addComponent("minecraft:rarity", rarity);
    }

    /**
     * Adds `minecraft:record`.
     *
     * Record items can play music in jukeboxes. `comparatorSignal` controls
     * the redstone signal strength emitted by a comparator.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_record
     */
    addRecord(soundEvent: string, duration: number | undefined = undefined, comparatorSignal: number | undefined = undefined): this {
        const data: Record<string, unknown> = {
            "sound_event": soundEvent
        };
        this.setIfDefined(data, "duration", duration);
        this.setIfDefined(data, "comparator_signal", comparatorSignal);
        return this.addComponent("minecraft:record", data);
    }

    /**
     * Adds `minecraft:repairable`.
     *
     * Repair entries define which items repair this item and how much
     * durability each repair restores.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_repairable
     */
    addRepairable(repairItems: string | ItemRepairEntry | (string | ItemRepairEntry)[], onRepaired: string | undefined = undefined): this {
        const entries = this.arrayFrom(repairItems).map((entry) => {
            if (typeof entry === "string") {
                return entry;
            }

            return this.toRepairEntry(entry);
        });

        const data: Record<string, unknown> = {
            "repair_items": entries
        };
        this.setIfDefined(data, "on_repaired", onRepaired);
        return this.addComponent("minecraft:repairable", data);
    }

    /**
     * Adds `minecraft:shooter`.
     *
     * Shooter items fire projectile ammunition. Microsoft docs require the
     * item to also define `minecraft:projectile`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_shooter
     */
    addShooter(ammunition: ItemShooterAmmunition | ItemShooterAmmunition[], options: ItemShooterOptions = {}): this {
        const data: Record<string, unknown> = {
            "ammunition": this.arrayFrom(ammunition).map((entry) => this.toShooterAmmunition(entry))
        };
        this.setIfDefined(data, "charge_on_draw", options.chargeOnDraw);
        this.setIfDefined(data, "max_draw_duration", options.maxDrawDuration);
        this.setIfDefined(data, "scale_power_by_draw_duration", options.scalePowerByDrawDuration);
        return this.addComponent("minecraft:shooter", data);
    }

    /**
     * Adds `minecraft:should_despawn`.
     *
     * This controls whether item entities eventually despawn while floating in
     * the world.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_should_despawn
     */
    addShouldDespawn(value = true): this {
        return this.addComponent("minecraft:should_despawn", value);
    }

    /**
     * Adds `minecraft:stacked_by_data`.
     *
     * This controls whether matching items with different aux values can stack
     * and whether their item entities merge while floating in the world.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_stacked_by_data
     */
    addStackedByData(value = true): this {
        return this.addComponent("minecraft:stacked_by_data", value);
    }

    /**
     * Adds `minecraft:storage_weight_limit`.
     *
     * This controls the maximum weight a storage item can hold.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_storage_weight_limit
     */
    addStorageWeightLimit(maxWeightLimit: number): this {
        return this.addComponent("minecraft:storage_weight_limit", {
            "max_weight_limit": maxWeightLimit
        });
    }

    /**
     * Adds `minecraft:storage_weight_modifier`.
     *
     * This controls how much weight this item contributes when placed inside a
     * storage item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_storage_weight_modifier
     */
    addStorageWeightModifier(weightInStorageItem: number): this {
        return this.addComponent("minecraft:storage_weight_modifier", {
            "weight_in_storage_item": weightInStorageItem
        });
    }

    /**
     * Adds `minecraft:swing_duration`.
     *
     * This controls the duration, in seconds, of the attack swing.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_swing_duration
     */
    addSwingDuration(value: number): this {
        return this.addComponent("minecraft:swing_duration", {
            "value": value
        });
    }

    /**
     * Adds `minecraft:swing_sounds`.
     *
     * This overrides sounds emitted by attacks with this item.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_swing_sounds
     */
    addSwingSounds(sounds: ItemSwingSounds): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "attack_critical_hit", sounds.attackCriticalHit);
        this.setIfDefined(data, "attack_hit", sounds.attackHit);
        this.setIfDefined(data, "attack_miss", sounds.attackMiss);
        return this.addComponent("minecraft:swing_sounds", data);
    }

    /**
     * Adds `minecraft:throwable`.
     *
     * Throwable items can be thrown by players. Use with `minecraft:projectile`
     * to choose the spawned projectile entity.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_throwable
     */
    addThrowable(options: ItemThrowableOptions = {}): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "do_swing_animation", options.doSwingAnimation);
        this.setIfDefined(data, "launch_power_scale", options.launchPowerScale);
        this.setIfDefined(data, "max_draw_duration", options.maxDrawDuration);
        this.setIfDefined(data, "max_launch_power", options.maxLaunchPower);
        this.setIfDefined(data, "min_draw_duration", options.minDrawDuration);
        this.setIfDefined(data, "scale_power_by_draw_duration", options.scalePowerByDrawDuration);
        return this.addComponent("minecraft:throwable", data);
    }

    /**
     * Adds `minecraft:use_animation`.
     *
     * This controls the animation played when the item is used.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_animation
     */
    addUseAnimation(animation: ItemUseAnimation): this {
        return this.addComponent("minecraft:use_animation", animation);
    }

    /**
     * Adds `minecraft:use_modifiers`.
     *
     * This controls how long an item takes to use and movement behavior while
     * it is being used.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers
     */
    addUseModifiers(options: ItemUseModifiersOptions): this {
        const data: Record<string, unknown> = {};
        this.setIfDefined(data, "emit_vibrations", options.emitVibrations);
        this.setIfDefined(data, "movement_modifier", options.movementModifier);
        this.setIfDefined(data, "start_sound", options.startSound);
        this.setIfDefined(data, "start_using", options.startUsing);
        this.setIfDefined(data, "use_duration", options.useDuration);
        return this.addComponent("minecraft:use_modifiers", data);
    }

    /**
     * Adds `minecraft:icon`.
     *
     * Pass a string to write the compact icon form. Pass a texture map to write
     * the object form with a `textures` field, where `default` is the normal
     * item icon and additional keys can define armor trim, palette, or
     * bundle-open textures.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_icon
     */
    addIcon(iconIdentifier: string): this;
    addIcon(textures: ItemIconTextures): this;
    addIcon(icon: string | ItemIconTextures): this {
        if (typeof icon === "string") {
            return this.addComponent("minecraft:icon", icon);
        }

        return this.addComponent("minecraft:icon", {
            "textures": icon
        });
    }

    /**
     * Adds `minecraft:max_stack_size`.
     *
     * This controls how many of this item can be stacked together. Current docs
     * allow values from 1 through 64. This helper writes the object form with a
     * `value` field.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_max_stack_size
     */
    addMaxStackSize(maxStackSize: number): this {
        return this.addComponent("minecraft:max_stack_size", {
            "value": maxStackSize
        });
    }

    /**
     * Adds `minecraft:max_stack_size`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_max_stack_size
     */
    setMaxStackSize(maxStackSize: number): this {
        return this.addMaxStackSize(maxStackSize);
    }

    /**
     * Adds `minecraft:wearable`.
     *
     * Wearable items can be equipped in an armor or hand slot. `protection`
     * controls the armor value provided by the item. When a non-hand armor slot
     * is used, Minecraft automatically limits the item stack size to 1.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_wearable
     */
    addWearable(protection: number, slot: ItemSlot, options: ItemWearableOptions = {}): this {
        const wearableComponent: Record<string, unknown> = {
            "protection": protection,
            "slot": slot
        };

        if (options.hidesPlayerLocation !== undefined) {
            wearableComponent["hides_player_location"] = options.hidesPlayerLocation;
        }

        if (options.dispensable !== undefined) {
            wearableComponent["dispensable"] = options.dispensable;
        }

        return this.addComponent("minecraft:wearable", wearableComponent);
    }

    /**
     * Adds `minecraft:wearable`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_wearable
     */
    setWearable(protection: number, slot: ItemSlot, options: ItemWearableOptions = {}): this {
        return this.addWearable(protection, slot, options);
    }

    /**
     * Adds an item tag to `minecraft:tags`.
     *
     * Tags are strings such as `minecraft:is_food` or a custom namespaced tag.
     * Repeated calls append to the same `tags` array.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_tags
     */
    addTag(tag: string): this {
        const existingTags = this.getValueAtPath<string[]>("minecraft:tags/tags", []);
        if (!existingTags.includes(tag)) {
            existingTags.push(tag);
        }
        this.setValueAtPath("minecraft:tags/tags", existingTags);
        return this;
    }

    /**
     * Adds one or more item tags to `minecraft:tags`.
     *
     * Repeated calls append to the same `tags` array and ignore duplicates.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_tags
     */
    addTags(tags: string | string[]): this {
        for (const tag of this.arrayFrom(tags)) {
            this.addTag(tag);
        }

        return this;
    }

    /**
     * Adds `minecraft:glint` using the compact boolean form.
     *
     * This gives the item the enchanted glint render effect.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_glint
     */
    addGlint(value = true): this {
        this.setValueAtPath("minecraft:glint", value);
        return this;
    }

    /**
     * Adds `minecraft:block_placer`.
     *
     * Items with this component place a block when used. The component can also
     * be used instead of `minecraft:icon` so the item renders the placed block
     * as its icon.
     *
     * `replaceBlockItem` registers this item as the default item for the block;
     * for that field to be valid, Microsoft docs require the item identifier to
     * match the block identifier. `useOn` limits which block descriptors this
     * item can be used on. If omitted, all blocks are allowed.
     * `alignedPlacement` keeps repeated placement aligned while the
     * interaction button is held.
     *
     * Requires format version 1.21.50 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
     */
    addBlockPlacer(
        block: ItemBlockDescriptor,
        replaceBlockItem: boolean = false,
        useOn?: ItemBlockDescriptor | ItemBlockDescriptor[],
        alignedPlacement: boolean | undefined = undefined,
    ): this {
        const blockPlacerComponent: Record<string, unknown> = {
            "block": block,
            "replace_block_item": replaceBlockItem
        };

        if (useOn !== undefined) {
            blockPlacerComponent["use_on"] = Array.isArray(useOn) ? useOn : [useOn];
        }

        if (alignedPlacement !== undefined) {
            blockPlacerComponent["aligned_placement"] = alignedPlacement;
        }

        return this.addComponent("minecraft:block_placer", blockPlacerComponent);
    }

    /**
     * Adds `minecraft:block_placer`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
     */
    setBlockPlacer(
        block: ItemBlockDescriptor,
        replaceBlockItem: boolean = false,
        useOn?: ItemBlockDescriptor | ItemBlockDescriptor[],
        alignedPlacement: boolean | undefined = undefined,
    ): this {
        return this.addBlockPlacer(block, replaceBlockItem, useOn, alignedPlacement);
    }

    /**
     * Adds `minecraft:storage_item`.
     *
     * Storage items can hold a dynamic item container. `maxSlots` is the
     * maximum allowed weight of the contained items and is capped at 64 by the
     * current docs. `bannedItems` prevents specific item identifiers from being
     * stored, `allowedItems` restricts storage to a specific allow-list, and
     * `allowNestedStorageItems` controls whether other storage items can be
     * placed inside this item.
     *
     * To let players interact with the stored contents, Microsoft docs require
     * a `minecraft:bundle_interaction` component as well. Requires format
     * version 1.21.40 or later.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_storage_item
     */
    addStorageItem(
        maxSlots: number,
        bannedItems?: ItemStorageItemFilter,
        allowNestedStorageItems?: boolean,
        allowedItems?: ItemStorageItemFilter,
    ): this {
        const storageItemComponent: Record<string, unknown> = {
            "max_slots": maxSlots
        };

        if (bannedItems !== undefined) {
            storageItemComponent["banned_items"] = bannedItems;
        }

        if (allowNestedStorageItems !== undefined) {
            storageItemComponent["allow_nested_storage_items"] = allowNestedStorageItems;
        }

        if (allowedItems !== undefined) {
            storageItemComponent["allowed_items"] = allowedItems;
        }

        this.setValueAtPath("minecraft:storage_item", storageItemComponent);
        return this;
    }

    /**
     * Adds `minecraft:storage_item`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_storage_item
     */
    setStorageItem(
        maxSlots: number,
        bannedItems?: ItemStorageItemFilter,
        allowNestedStorageItems?: boolean,
        allowedItems?: ItemStorageItemFilter,
    ): this {
        return this.addStorageItem(maxSlots, bannedItems, allowNestedStorageItems, allowedItems);
    }
}
