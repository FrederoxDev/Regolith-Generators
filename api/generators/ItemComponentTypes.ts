/**
 * Equipment slots accepted by `minecraft:wearable`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_wearable
 */
export enum ItemSlot {
    Offhand = "slot.weapon.offhand",
    Mainhand = "slot.weapon.mainhand",
    Head = "slot.armor.head",
    Chest = "slot.armor.chest",
    Legs = "slot.armor.legs",
    Feet = "slot.armor.feet",
    Body = "slot.armor.body"
}

/**
 * Icon texture map accepted by the object form of `minecraft:icon`.
 *
 * `default` is the normal item icon texture. Additional keys can be used for
 * armor trims, palettes, bundle-open textures, and other documented icon
 * variants.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_icon
 */
export type ItemIconTextures = Record<string, string>;

/**
 * Extra wearable settings accepted by `minecraft:wearable`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_wearable
 */
export interface ItemWearableOptions {
    /**
     * Hides the player's location on Locator Maps and the Locator Bar while
     * this wearable item is equipped.
     *
     * @default false
     */
    hidesPlayerLocation?: boolean;

    /**
     * Deprecated by Microsoft docs, but still accepted by the current form
     * schema for `minecraft:wearable`.
     */
    dispensable?: boolean;
}

/**
 * Block state values accepted by item block descriptors.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
 */
export type ItemBlockStateValue = string | number | boolean;

/**
 * Block descriptor using a block name and optional state values.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
 */
export interface ItemBlockNameAndStatesDescriptor {
    /**
     * Block identifier to match or place.
     */
    name: string;

    /**
     * Required block states for the matched block.
     */
    states?: Record<string, ItemBlockStateValue>;
}

/**
 * Block descriptor using a Molang tag query.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
 */
export interface ItemBlockTagsDescriptor {
    /**
     * Molang tag query used to match blocks.
     */
    tags: string;
}

/**
 * Block descriptor accepted by item components such as `minecraft:block_placer`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_block_placer
 */
export type ItemBlockDescriptor = string | ItemBlockNameAndStatesDescriptor | ItemBlockTagsDescriptor;

/**
 * Item id list accepted by storage item allow and ban lists.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_storage_item
 */
export type ItemStorageItemFilter = string[] | Record<string, string>;

/**
 * Three-number RGB color used by item component helpers.
 */
export type ItemRgbColor = [number, number, number];

/**
 * Cooldown action types accepted by `minecraft:cooldown`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_cooldown
 */
export type ItemCooldownType = "use" | "attack";

/**
 * Integer range used by durability and similar item components.
 */
export interface ItemIntRange {
    /**
     * Minimum value in the range.
     */
    min: number;

    /**
     * Maximum value in the range.
     */
    max: number;
}

/**
 * Floating point range used by weapon reach components.
 */
export interface ItemFloatRange {
    /**
     * Minimum value in the range.
     */
    min: number;

    /**
     * Maximum value in the range.
     */
    max: number;
}

/**
 * One block speed entry accepted by `minecraft:digger`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_digger
 */
export interface ItemDiggerDestroySpeed {
    /**
     * Block descriptor this speed applies to.
     */
    block: ItemBlockDescriptor;

    /**
     * Digging speed multiplier for the matched block.
     */
    speed: number;
}

/**
 * One durability threshold emitted by `minecraft:durability_sensor`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_durability_sensor
 */
export interface ItemDurabilitySensorThreshold {
    /**
     * Effects emit when item durability is less than or equal to this value.
     */
    durability?: number;

    /**
     * Particle effect to emit when the threshold is met.
     */
    particleType?: string;

    /**
     * Sound effect to emit when the threshold is met.
     */
    soundEvent?: string;
}

/**
 * Enchantment slots accepted by `minecraft:enchantable`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_enchantable
 */
export type ItemEnchantableSlot =
    | "none"
    | "all"
    | "g_armor"
    | "armor_head"
    | "armor_torso"
    | "armor_feet"
    | "armor_legs"
    | "sword"
    | "bow"
    | "spear"
    | "crossbow"
    | "melee_spear"
    | "g_tool"
    | "hoe"
    | "shears"
    | "flintsteel"
    | "shield"
    | "g_digging"
    | "axe"
    | "pickaxe"
    | "shovel"
    | "fishing_rod"
    | "carrot_stick"
    | "elytra"
    | "cosmetic_head"
    | (string & {});

/**
 * Entity descriptor accepted by item placer and projectile components.
 */
export type ItemEntityDescriptor = string | Record<string, unknown>;

/**
 * Item produced by a food item after it is used.
 */
export type ItemFoodConversion = string | Record<string, string>;

/**
 * Optional settings accepted by `minecraft:food`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_food
 */
export interface ItemFoodOptions {
    /**
     * Whether the item can be eaten even when the player is not hungry.
     *
     * @default false
     */
    canAlwaysEat?: boolean;

    /**
     * Item to convert into after use, such as `minecraft:bowl`.
     */
    usingConvertsTo?: ItemFoodConversion;
}

/**
 * Conditions used by `minecraft:kinetic_weapon` effects.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_kinetic_weapon
 */
export interface ItemKineticEffectConditions {
    /**
     * Maximum duration, in ticks, that the effect can apply.
     */
    maxDuration?: number;

    /**
     * Minimum relative speed required between user and target.
     */
    minRelativeSpeed?: number;

    /**
     * Minimum speed required for the effect.
     */
    minSpeed?: number;
}

/**
 * Settings accepted by `minecraft:kinetic_weapon`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_kinetic_weapon
 */
export interface ItemKineticWeaponOptions {
    /**
     * Reach used while the user is in Creative mode.
     */
    creativeReach?: ItemFloatRange;

    /**
     * Conditions required before kinetic damage is applied.
     */
    damageConditions?: ItemKineticEffectConditions;

    /**
     * Value added after the kinetic damage multiplier.
     *
     * @default 0
     */
    damageModifier?: number;

    /**
     * Multiplier applied to the computed kinetic damage.
     *
     * @default 1
     */
    damageMultiplier?: number;

    /**
     * Time in ticks before kinetic effects start.
     *
     * @default 0
     */
    delay?: number;

    /**
     * Conditions required before riders are dismounted.
     */
    dismountConditions?: ItemKineticEffectConditions;

    /**
     * Extra tolerance for the view-vector raycast.
     *
     * @default 0
     */
    hitboxMargin?: number;

    /**
     * Conditions required before knockback is applied.
     */
    knockbackConditions?: ItemKineticEffectConditions;

    /**
     * Range, in blocks, along the user's view vector.
     *
     * @default { min: 0, max: 3 }
     */
    reach?: ItemFloatRange;
}

/**
 * Settings accepted by `minecraft:piercing_weapon`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_piercing_weapon
 */
export interface ItemPiercingWeaponOptions {
    /**
     * Reach used while the user is in Creative mode.
     */
    creativeReach?: ItemFloatRange;

    /**
     * Extra tolerance for the view-vector raycast.
     *
     * @default 0
     */
    hitboxMargin?: number;

    /**
     * Range, in blocks, along the user's view vector.
     *
     * @default { min: 0, max: 3 }
     */
    reach?: ItemFloatRange;
}

/**
 * Base rarities accepted by `minecraft:rarity`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_rarity
 */
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | (string & {});

/**
 * Molang repair expression accepted by `minecraft:repairable`.
 */
export interface ItemRepairAmountExpression {
    /**
     * Molang expression that calculates the repair amount.
     */
    expression: string;

    /**
     * Expression version.
     */
    version: number;
}

/**
 * Repair amount accepted by `minecraft:repairable`.
 */
export type ItemRepairAmount = number | string | ItemRepairAmountExpression | Record<string, string>;

/**
 * One repair item entry accepted by `minecraft:repairable`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_repairable
 */
export interface ItemRepairEntry {
    /**
     * Items that can repair this item.
     */
    items: string | string[] | Record<string, string>;

    /**
     * How much durability is restored.
     */
    repairAmount?: ItemRepairAmount;
}

/**
 * Ammunition entry accepted by `minecraft:shooter`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_shooter
 */
export interface ItemShooterAmmunition {
    /**
     * Ammunition item identifier or keyed item collection.
     */
    item: string | Record<string, string>;

    /**
     * Whether to search the player's inventory.
     *
     * @default false
     */
    searchInventory?: boolean;

    /**
     * Whether this ammunition can be used in Creative mode.
     *
     * @default false
     */
    useInCreative?: boolean;

    /**
     * Whether the shooter can use ammunition from the offhand.
     *
     * @default false
     */
    useOffhand?: boolean;
}

/**
 * Optional settings accepted by `minecraft:shooter`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_shooter
 */
export interface ItemShooterOptions {
    /**
     * Whether the item begins charging when the player starts drawing.
     *
     * @default false
     */
    chargeOnDraw?: boolean;

    /**
     * Maximum draw duration in seconds.
     *
     * @default 0
     */
    maxDrawDuration?: number;

    /**
     * Whether launch power scales with draw duration.
     *
     * @default false
     */
    scalePowerByDrawDuration?: boolean;
}

/**
 * Optional settings accepted by `minecraft:throwable`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_throwable
 */
export interface ItemThrowableOptions {
    /**
     * Whether to play the swing animation when thrown.
     *
     * @default false
     */
    doSwingAnimation?: boolean;

    /**
     * Scale applied to throw power.
     *
     * @default 1
     */
    launchPowerScale?: number;

    /**
     * Maximum draw duration in seconds.
     *
     * @default 0
     */
    maxDrawDuration?: number;

    /**
     * Maximum launch power.
     *
     * @default 1
     */
    maxLaunchPower?: number;

    /**
     * Minimum draw duration in seconds.
     *
     * @default 0
     */
    minDrawDuration?: number;

    /**
     * Whether launch power scales with draw duration.
     *
     * @default false
     */
    scalePowerByDrawDuration?: boolean;
}

/**
 * Use animations accepted by `minecraft:use_animation`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_animation
 */
export type ItemUseAnimation =
    | "block"
    | "bow"
    | "brush"
    | "camera"
    | "crossbow"
    | "drink"
    | "eat"
    | "none"
    | "spear"
    | "spyglass"
    | (string & {});

/**
 * Start-using behavior accepted by `minecraft:use_modifiers`.
 */
export type ItemStartUsing = "if_first" | "always" | (string & {});

/**
 * Optional settings accepted by `minecraft:use_modifiers`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_use_modifiers
 */
export interface ItemUseModifiersOptions {
    /**
     * Whether vibrations emit when item use starts or stops.
     *
     * @default true
     */
    emitVibrations?: boolean;

    /**
     * Multiplier applied to player movement speed while using the item.
     */
    movementModifier?: number;

    /**
     * Sound played when item use starts.
     */
    startSound?: string;

    /**
     * Whether using starts only if no other component has started using yet,
     * or always restarts using.
     *
     * @default "if_first"
     */
    startUsing?: ItemStartUsing;

    /**
     * Time in seconds that the item takes to use.
     *
     * @default 0
     */
    useDuration?: number;
}

/**
 * Swing sounds accepted by `minecraft:swing_sounds`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_swing_sounds
 */
export interface ItemSwingSounds {
    /**
     * Sound played when an attack hits and deals critical damage.
     */
    attackCriticalHit?: string;

    /**
     * Sound played when an attack hits.
     */
    attackHit?: string;

    /**
     * Sound played when an attack misses.
     */
    attackMiss?: string;
}
