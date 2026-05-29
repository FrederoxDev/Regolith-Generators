/**
 * Version string used by recipe JSON files.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
 */
export type RecipeFormatVersion = string;

/**
 * Crafting or processing station tags used by recipe definitions.
 *
 * Custom crafting table tags are also accepted by recipe JSON, so helpers use
 * this union while still allowing arbitrary strings.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipetaglist
 */
export type RecipeTag =
    | "crafting_table"
    | "stonecutter"
    | "cartography_table"
    | "furnace"
    | "smoker"
    | "blast_furnace"
    | "campfire"
    | "soul_campfire"
    | "brewing_stand"
    | "smithing_table"
    | string;

/**
 * Context values accepted by recipe book unlock rules.
 *
 * The docs list common contexts, but Minecraft may accept additional values in
 * future versions, so arbitrary strings are allowed too.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
 */
export type RecipeUnlockContext =
    | "AlwaysUnlocked"
    | "None"
    | "PlayerInWater"
    | "PlayerHasManyItems"
    | string;

/**
 * Recipe book unlock rule.
 *
 * Use `item` when the player must obtain an item first. Use `context` for
 * context-driven unlocks such as always unlocked recipes.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
 */
export interface RecipeUnlock {
    /**
     * Item identifier that unlocks the recipe when obtained.
     */
    item?: string;

    /**
     * Unlock context used by the recipe book.
     */
    context?: RecipeUnlockContext;
}

/**
 * Item descriptor used by recipe ingredients and crafting results.
 *
 * The `data` field is deprecated by Microsoft for format versions 1.20.0 and
 * later; prefer flattened item identifiers for new content.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shapeless
 */
export interface RecipeItem {
    /**
     * Item identifier.
     */
    item: string;

    /**
     * Deprecated item data value.
     *
     * @deprecated Use flattened item identifiers instead.
     */
    data?: number;

    /**
     * Item count for ingredients or results.
     */
    count?: number;
}

/**
 * Tag descriptor used by shaped and shapeless recipe inputs.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/tagsrecipeinput
 */
export interface RecipeTagInput {
    /**
     * Item tag that can match multiple item identifiers.
     */
    tag: string;

    /**
     * Deprecated item data value.
     *
     * @deprecated Use flattened item identifiers instead.
     */
    data?: number;

    /**
     * Number of matching items required.
     */
    count?: number;
}

/**
 * Ingredient accepted by shaped, shapeless, and existing recipe helpers.
 *
 * Strings are treated as item identifiers. Objects can reference either a
 * concrete item or an item tag.
 */
export type ItemIngredient = string | RecipeItem | RecipeTagInput;

/**
 * Crafting result accepted by shaped and shapeless recipes.
 *
 * Result tag descriptors are not valid here; use an item string or item object.
 */
export type RecipeResult = string | RecipeItem;

/**
 * Pattern key map for shaped recipes.
 *
 * The current docs allow one-character keys matching `[A-Za-z#]`; this type is
 * intentionally broad enough to preserve existing recipe code.
 */
export type ShapedRecipeKey = Record<string, ItemIngredient>;

/**
 * Shared options for crafting recipes.
 */
export interface CraftingRecipeOptions {
    /**
     * Root recipe format version.
     */
    formatVersion?: RecipeFormatVersion;

    /**
     * Recipe book group identifier.
     */
    group?: string;

    /**
     * Recipe priority. Lower values have higher priority.
     */
    priority?: number;

    /**
     * Recipe book unlock rules.
     */
    unlock?: RecipeUnlock | RecipeUnlock[];
}

/**
 * Options specific to shaped recipes.
 */
export interface ShapedRecipeOptions extends CraftingRecipeOptions {
    /**
     * If true, the pattern may be mirrored horizontally.
     */
    assumeSymmetry?: boolean;
}

/**
 * Simple item-or-tag descriptor used by smithing trim recipes.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_smithing_trim
 */
export type SmithingTrimIngredient = string | {
    /**
     * Specific item identifier.
     */
    item?: string;

    /**
     * Item tag identifier.
     */
    tag?: string;
};
