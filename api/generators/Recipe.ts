import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { randomIdFromIdentifier, sanitiseIdentifierForFilename } from "../Utils.ts";
import {
    type CraftingRecipeOptions,
    type ItemIngredient,
    type RecipeFormatVersion,
    type RecipeResult,
    type RecipeTag,
    type RecipeUnlock,
    type ShapedRecipeKey,
    type ShapedRecipeOptions,
    type SmithingTrimIngredient
} from "./RecipeTypes.ts";

export * from "./RecipeTypes.ts";

const DEFAULT_RECIPE_FORMAT_VERSION = "1.20.10";
const LEGACY_ALWAYS_UNLOCKED: RecipeUnlock = { context: "AlwaysUnlocked" };

function toArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

function getIngredientId(ingredient: ItemIngredient | RecipeResult | SmithingTrimIngredient): string {
    if (typeof ingredient === "string") {
        return ingredient;
    }

    if ("item" in ingredient && ingredient.item !== undefined) {
        return ingredient.item;
    }

    if ("tag" in ingredient && ingredient.tag !== undefined) {
        return ingredient.tag;
    }

    return "recipe";
}

function getRecipeId(result: RecipeResult | RecipeResult[] | SmithingTrimIngredient): string {
    const idSource = Array.isArray(result) ? result[0] : result;
    return randomIdFromIdentifier(sanitiseIdentifierForFilename(getIngredientId(idSource)));
}

function getRecipeIdFromParts(...parts: Array<ItemIngredient | RecipeResult | SmithingTrimIngredient>): string {
    const idSource = parts.map(getIngredientId).join("_");
    return randomIdFromIdentifier(sanitiseIdentifierForFilename(idSource));
}

/**
 * Base class for Minecraft recipe JSON definitions.
 *
 * Recipe files live in `BP/recipes` and contain a root `format_version` plus a
 * single recipe definition object such as `minecraft:recipe_shaped`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference
 */
export abstract class RecipeDefinition<TSelf extends RecipeDefinition<TSelf>> extends GeneratorBase<TSelf> {
    data: Record<string, unknown>;
    protected recipeKey: string;

    protected constructor(
        recipeKey: string,
        projectNamespace: string,
        id: string,
        tags: RecipeTag | RecipeTag[],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ) {
        super();
        this.recipeKey = recipeKey;
        this.data = {
            "format_version": formatVersion,
            [recipeKey]: {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "tags": toArray(tags)
            }
        };
    }

    protected recipePath(path: string): string {
        return path.length === 0 ? this.recipeKey : `${this.recipeKey}/${path}`;
    }

    /**
     * Sets the recipe file `format_version`.
     */
    setFormatVersion(version: RecipeFormatVersion): this {
        this.setValueAtPath("format_version", version);
        return this;
    }

    /**
     * Replaces the fully-qualified recipe identifier.
     */
    setIdentifier(identifier: string): this {
        this.setValueAtPath(this.recipePath("description/identifier"), identifier);
        return this;
    }

    /**
     * Replaces the recipe station tags.
     *
     * Tags decide which block or station can use the recipe, such as
     * `crafting_table`, `furnace`, `brewing_stand`, or a custom crafting table
     * tag.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipetaglist
     */
    setTags(tags: RecipeTag | RecipeTag[]): this {
        this.setValueAtPath(this.recipePath("tags"), toArray(tags));
        return this;
    }

    /**
     * Adds one or more recipe station tags.
     */
    addTags(tags: RecipeTag | RecipeTag[]): this {
        const existingTags = this.getValueAtPath<RecipeTag[]>(this.recipePath("tags"), []);
        for (const tag of toArray(tags)) {
            if (!existingTags.includes(tag)) {
                existingTags.push(tag);
            }
        }
        this.setValueAtPath(this.recipePath("tags"), existingTags);
        return this;
    }
}

/**
 * Shared helpers for shaped and shapeless crafting recipes.
 */
export abstract class CraftingRecipe<TSelf extends CraftingRecipe<TSelf>> extends RecipeDefinition<TSelf> {
    /**
     * Sets the recipe book group identifier.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
     */
    setGroup(group: string): this {
        this.setValueAtPath(this.recipePath("group"), group);
        return this;
    }

    /**
     * Sets the recipe priority. Lower values have higher priority.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
     */
    setPriority(priority: number): this {
        this.setValueAtPath(this.recipePath("priority"), priority);
        return this;
    }

    /**
     * Replaces recipe book unlock rules using the current array form.
     *
     * The constructor preserves the previous Regolith Generators default
     * `AlwaysUnlocked` object for existing code. Calling this method writes the
     * current documented array shape.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
     */
    setUnlock(unlock: RecipeUnlock | RecipeUnlock[]): this {
        this.setValueAtPath(this.recipePath("unlock"), toArray(unlock));
        return this;
    }

    /**
     * Adds a recipe book unlock rule.
     */
    addUnlock(unlock: RecipeUnlock): this {
        const existingUnlocks = this.getValueAtPath<RecipeUnlock | RecipeUnlock[]>(this.recipePath("unlock"), []);
        const unlocks = Array.isArray(existingUnlocks) ? existingUnlocks : [existingUnlocks];
        unlocks.push(unlock);
        this.setValueAtPath(this.recipePath("unlock"), unlocks);
        return this;
    }

    /**
     * Marks the recipe as always unlocked in the recipe book.
     */
    setAlwaysUnlocked(): this {
        return this.setUnlock({ context: "AlwaysUnlocked" });
    }

    protected applyCraftingOptions(options: CraftingRecipeOptions | undefined): void {
        if (options?.group !== undefined) {
            this.setGroup(options.group);
        }

        if (options?.priority !== undefined) {
            this.setPriority(options.priority);
        }

        if (options?.unlock !== undefined) {
            this.setUnlock(options.unlock);
        }
    }
}

/**
 * Factory for behavior-pack recipe definition files.
 *
 * Generated files are written under `BP/recipes`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference
 */
export class RecipeGenerator extends GeneratorFactory<RecipeDefinition<any>> {
    data: Record<string, unknown> = {};

    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/recipes");
    }

    private storeRecipe<TRecipe extends RecipeDefinition<any>>(id: string, def: TRecipe): TRecipe {
        this.filesToGenerate.set(id, def);
        return def;
    }

    /**
     * Creates a shaped crafting recipe using a generated id based on `result`.
     *
     * Preserves the original `makeShapedRecipe(key, pattern, result, tags)`
     * calling convention.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
     */
    makeShapedRecipe(
        key: ShapedRecipeKey,
        pattern: string[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"]
    ): ShapedRecipe {
        const id = getRecipeId(result);
        return this.makeShapedRecipeWithId(id, key, pattern, result, tags);
    }

    /**
     * Creates a shaped crafting recipe with an explicit file and recipe id.
     */
    makeShapedRecipeWithId(
        id: string,
        key: ShapedRecipeKey,
        pattern: string[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"],
        options: ShapedRecipeOptions | undefined = undefined
    ): ShapedRecipe {
        const def = new ShapedRecipe(this.projectNamespace, id, key, pattern, result, tags, options);
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a shapeless crafting recipe using a generated id based on
     * `result`.
     *
     * Preserves the original
     * `makeShapelessRecipe(ingredients, result, tags)` calling convention.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shapeless
     */
    makeShapelessRecipe(
        ingredients: ItemIngredient[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"]
    ): ShapelessRecipe {
        const id = getRecipeId(result);
        return this.makeShapelessRecipeWithId(id, ingredients, result, tags);
    }

    /**
     * Creates a shapeless crafting recipe with an explicit file and recipe id.
     */
    makeShapelessRecipeWithId(
        id: string,
        ingredients: ItemIngredient[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"],
        options: CraftingRecipeOptions | undefined = undefined
    ): ShapelessRecipe {
        const def = new ShapelessRecipe(this.projectNamespace, id, ingredients, result, tags, options);
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a furnace recipe using a generated id based on `result`.
     *
     * Preserves the original `makeFurnaceRecipe(input, result, tags)` calling
     * convention.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_furnace
     */
    makeFurnaceRecipe(
        input: ItemIngredient,
        result: RecipeResult,
        tags: RecipeTag[] = ["furnace"]
    ): FurnaceRecipe {
        const id = getRecipeId(result);
        return this.makeFurnaceRecipeWithId(id, input, result, tags);
    }

    /**
     * Creates a furnace recipe with an explicit file and recipe id.
     */
    makeFurnaceRecipeWithId(
        id: string,
        input: ItemIngredient,
        result: RecipeResult,
        tags: RecipeTag[] = ["furnace"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ): FurnaceRecipe {
        const def = new FurnaceRecipe(this.projectNamespace, id, input, result, tags, formatVersion);
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a brewing mix recipe using a generated id based on `output`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_brewing_mix
     */
    makeBrewingMixRecipe(
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"]
    ): BrewingMixRecipe {
        const id = getRecipeId(output);
        return this.makeBrewingMixRecipeWithId(id, input, reagent, output, tags);
    }

    /**
     * Creates a brewing mix recipe with an explicit file and recipe id.
     */
    makeBrewingMixRecipeWithId(
        id: string,
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ): BrewingMixRecipe {
        const def = new BrewingMixRecipe(this.projectNamespace, id, input, reagent, output, tags, formatVersion);
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a legacy brewing container recipe using a generated id based on
     * `output`.
     *
     * Microsoft's current generated recipe list focuses on brewing mix, but the
     * older potion brewing container page is still available.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/minecraftrecipe_potionbrewing
     */
    makeBrewingContainerRecipe(
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"]
    ): BrewingContainerRecipe {
        const id = getRecipeId(output);
        return this.makeBrewingContainerRecipeWithId(id, input, reagent, output, tags);
    }

    /**
     * Creates a legacy brewing container recipe with an explicit file and
     * recipe id.
     */
    makeBrewingContainerRecipeWithId(
        id: string,
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ): BrewingContainerRecipe {
        const def = new BrewingContainerRecipe(this.projectNamespace, id, input, reagent, output, tags, formatVersion);
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a smithing transform recipe using a generated id based on
     * `result`.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_smithing_transform
     */
    makeSmithingTransformRecipe(
        template: string,
        base: string,
        addition: string,
        result: string,
        tags: RecipeTag[] = ["smithing_table"]
    ): SmithingTransformRecipe {
        const id = getRecipeId(result);
        return this.makeSmithingTransformRecipeWithId(id, template, base, addition, result, tags);
    }

    /**
     * Creates a smithing transform recipe with an explicit file and recipe id.
     */
    makeSmithingTransformRecipeWithId(
        id: string,
        template: string,
        base: string,
        addition: string,
        result: string,
        tags: RecipeTag[] = ["smithing_table"],
        formatVersion: RecipeFormatVersion = "1.20.0"
    ): SmithingTransformRecipe {
        const def = new SmithingTransformRecipe(
            this.projectNamespace,
            id,
            template,
            base,
            addition,
            result,
            tags,
            formatVersion
        );
        return this.storeRecipe(id, def);
    }

    /**
     * Creates a smithing trim recipe using a generated id based on its inputs.
     *
     * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_smithing_trim
     */
    makeSmithingTrimRecipe(
        template: SmithingTrimIngredient,
        base: SmithingTrimIngredient,
        addition: SmithingTrimIngredient,
        tags: RecipeTag[] = ["smithing_table"]
    ): SmithingTrimRecipe {
        const id = getRecipeIdFromParts(template, base, addition);
        return this.makeSmithingTrimRecipeWithId(id, template, base, addition, tags);
    }

    /**
     * Creates a smithing trim recipe with an explicit file and recipe id.
     */
    makeSmithingTrimRecipeWithId(
        id: string,
        template: SmithingTrimIngredient,
        base: SmithingTrimIngredient,
        addition: SmithingTrimIngredient,
        tags: RecipeTag[] = ["smithing_table"],
        formatVersion: RecipeFormatVersion = "1.20.0"
    ): SmithingTrimRecipe {
        const def = new SmithingTrimRecipe(this.projectNamespace, id, template, base, addition, tags, formatVersion);
        return this.storeRecipe(id, def);
    }
}

/**
 * Shaped crafting recipe.
 *
 * Shaped recipes require ingredients to match a pattern. Pattern keys map
 * single characters to item or tag inputs; spaces in the pattern are empty
 * slots.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shaped
 */
export class ShapedRecipe extends CraftingRecipe<ShapedRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        key: ShapedRecipeKey,
        pattern: string[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"],
        options: ShapedRecipeOptions | undefined = undefined
    ) {
        super("minecraft:recipe_shaped", projectNamespace, id, tags, options?.formatVersion);
        this.setPattern(pattern);
        this.setKey(key);
        this.setResult(result);
        this.setValueAtPath(this.recipePath("unlock"), LEGACY_ALWAYS_UNLOCKED);
        this.applyCraftingOptions(options);

        if (options?.assumeSymmetry !== undefined) {
            this.setAssumeSymmetry(options.assumeSymmetry);
        }
    }

    /**
     * Replaces the pattern rows for this shaped recipe.
     */
    setPattern(pattern: string[]): this {
        this.setValueAtPath(this.recipePath("pattern"), pattern);
        return this;
    }

    /**
     * Replaces the pattern key map.
     */
    setKey(key: ShapedRecipeKey): this {
        this.setValueAtPath(this.recipePath("key"), key);
        return this;
    }

    /**
     * Adds or replaces a single pattern key entry.
     */
    addKey(patternCharacter: string, ingredient: ItemIngredient): this {
        this.setValueAtPath(this.recipePath(`key/${patternCharacter}`), ingredient);
        return this;
    }

    /**
     * Replaces the crafting result. Current docs accept either one result
     * object or an array of result objects.
     */
    setResult(result: RecipeResult | RecipeResult[]): this {
        this.setValueAtPath(this.recipePath("result"), result);
        return this;
    }

    /**
     * Sets whether Minecraft may mirror the pattern horizontally.
     */
    setAssumeSymmetry(assumeSymmetry: boolean): this {
        this.setValueAtPath(this.recipePath("assume_symmetry"), assumeSymmetry);
        return this;
    }
}

/**
 * Shapeless crafting recipe.
 *
 * Shapeless recipes require ingredients but do not care about their positions
 * in the crafting grid.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_shapeless
 */
export class ShapelessRecipe extends CraftingRecipe<ShapelessRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        ingredients: ItemIngredient[],
        result: RecipeResult | RecipeResult[],
        tags: RecipeTag[] = ["crafting_table"],
        options: CraftingRecipeOptions | undefined = undefined
    ) {
        super("minecraft:recipe_shapeless", projectNamespace, id, tags, options?.formatVersion);
        this.setIngredients(ingredients);
        this.setResult(result);
        this.setValueAtPath(this.recipePath("unlock"), LEGACY_ALWAYS_UNLOCKED);
        this.applyCraftingOptions(options);
    }

    /**
     * Replaces the shapeless ingredient list.
     */
    setIngredients(ingredients: ItemIngredient[]): this {
        this.setValueAtPath(this.recipePath("ingredients"), ingredients);
        return this;
    }

    /**
     * Adds one ingredient to the shapeless ingredient list.
     */
    addIngredient(ingredient: ItemIngredient): this {
        const ingredients = this.getValueAtPath<ItemIngredient[]>(this.recipePath("ingredients"), []);
        ingredients.push(ingredient);
        this.setValueAtPath(this.recipePath("ingredients"), ingredients);
        return this;
    }

    /**
     * Replaces the crafting result. Current docs accept either one result
     * object or an array of result objects.
     */
    setResult(result: RecipeResult | RecipeResult[]): this {
        this.setValueAtPath(this.recipePath("result"), result);
        return this;
    }
}

/**
 * Furnace, smoker, blast furnace, and campfire recipe.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_furnace
 */
export class FurnaceRecipe extends RecipeDefinition<FurnaceRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        input: ItemIngredient,
        result: RecipeResult,
        tags: RecipeTag[] = ["furnace"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ) {
        super("minecraft:recipe_furnace", projectNamespace, id, tags, formatVersion);
        this.setInput(input);
        this.setOutput(result);
    }

    /**
     * Replaces the furnace input.
     */
    setInput(input: ItemIngredient): this {
        this.setValueAtPath(this.recipePath("input"), input);
        return this;
    }

    /**
     * Replaces the furnace output.
     */
    setOutput(output: RecipeResult): this {
        this.setValueAtPath(this.recipePath("output"), output);
        return this;
    }
}

/**
 * Brewing mix recipe.
 *
 * Brewing mix recipes combine a base potion type and reagent in a brewing
 * stand to create a new potion type.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_brewing_mix
 */
export class BrewingMixRecipe extends RecipeDefinition<BrewingMixRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ) {
        super("minecraft:recipe_brewing_mix", projectNamespace, id, tags, formatVersion);
        this.setInput(input);
        this.setReagent(reagent);
        this.setOutput(output);
    }

    /**
     * Replaces the input potion type.
     */
    setInput(input: string): this {
        this.setValueAtPath(this.recipePath("input"), input);
        return this;
    }

    /**
     * Replaces the reagent item.
     */
    setReagent(reagent: string): this {
        this.setValueAtPath(this.recipePath("reagent"), reagent);
        return this;
    }

    /**
     * Replaces the output potion type.
     */
    setOutput(output: string): this {
        this.setValueAtPath(this.recipePath("output"), output);
        return this;
    }
}

/**
 * Legacy brewing container recipe.
 *
 * This recipe changes a potion container, such as potion to splash potion, by
 * combining it with a reagent in a brewing stand.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/minecraftrecipe_potionbrewing
 */
export class BrewingContainerRecipe extends RecipeDefinition<BrewingContainerRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        input: string,
        reagent: string,
        output: string,
        tags: RecipeTag[] = ["brewing_stand"],
        formatVersion: RecipeFormatVersion = DEFAULT_RECIPE_FORMAT_VERSION
    ) {
        super("minecraft:recipe_brewing_container", projectNamespace, id, tags, formatVersion);
        this.setInput(input);
        this.setReagent(reagent);
        this.setOutput(output);
    }

    /**
     * Replaces the input potion container.
     */
    setInput(input: string): this {
        this.setValueAtPath(this.recipePath("input"), input);
        return this;
    }

    /**
     * Replaces the reagent item.
     */
    setReagent(reagent: string): this {
        this.setValueAtPath(this.recipePath("reagent"), reagent);
        return this;
    }

    /**
     * Replaces the output potion container.
     */
    setOutput(output: string): this {
        this.setValueAtPath(this.recipePath("output"), output);
        return this;
    }
}

/**
 * Smithing table transformation recipe.
 *
 * Smithing transform recipes upgrade a base item using a smithing template and
 * an addition material.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_smithing_transform
 */
export class SmithingTransformRecipe extends RecipeDefinition<SmithingTransformRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        template: string,
        base: string,
        addition: string,
        result: string,
        tags: RecipeTag[] = ["smithing_table"],
        formatVersion: RecipeFormatVersion = "1.20.0"
    ) {
        super("minecraft:recipe_smithing_transform", projectNamespace, id, tags, formatVersion);
        this.setTemplate(template);
        this.setBase(base);
        this.setAddition(addition);
        this.setResult(result);
    }

    /**
     * Replaces the smithing template item.
     */
    setTemplate(template: string): this {
        this.setValueAtPath(this.recipePath("template"), template);
        return this;
    }

    /**
     * Replaces the base item.
     */
    setBase(base: string): this {
        this.setValueAtPath(this.recipePath("base"), base);
        return this;
    }

    /**
     * Replaces the addition material.
     */
    setAddition(addition: string): this {
        this.setValueAtPath(this.recipePath("addition"), addition);
        return this;
    }

    /**
     * Replaces the transformed result item.
     */
    setResult(result: string): this {
        this.setValueAtPath(this.recipePath("result"), result);
        return this;
    }
}

/**
 * Smithing table armor trim recipe.
 *
 * Smithing trim recipes apply a decorative trim pattern using a template,
 * trimmable base item, and trim material. Inputs can be concrete items or item
 * tags.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/recipereference/examples/recipedefinitions/recipe_smithing_trim
 */
export class SmithingTrimRecipe extends RecipeDefinition<SmithingTrimRecipe> {
    constructor(
        projectNamespace: string,
        id: string,
        template: SmithingTrimIngredient,
        base: SmithingTrimIngredient,
        addition: SmithingTrimIngredient,
        tags: RecipeTag[] = ["smithing_table"],
        formatVersion: RecipeFormatVersion = "1.20.0"
    ) {
        super("minecraft:recipe_smithing_trim", projectNamespace, id, tags, formatVersion);
        this.setTemplate(template);
        this.setBase(base);
        this.setAddition(addition);
    }

    /**
     * Replaces the trim template item or tag.
     */
    setTemplate(template: SmithingTrimIngredient): this {
        this.setValueAtPath(this.recipePath("template"), template);
        return this;
    }

    /**
     * Replaces the base armor item or tag.
     */
    setBase(base: SmithingTrimIngredient): this {
        this.setValueAtPath(this.recipePath("base"), base);
        return this;
    }

    /**
     * Replaces the trim material item or tag.
     */
    setAddition(addition: SmithingTrimIngredient): this {
        this.setValueAtPath(this.recipePath("addition"), addition);
        return this;
    }
}
