import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { randomId, randomIdFromIdentifier, sanitiseIdentifierForFilename } from "../mod.js";

export type ItemIngredient = {
    item: string;
    data?: number;
    count?: number;
} | string;

function getIngredientId(ingredient: ItemIngredient): string {
    if (typeof ingredient === "string") {
        return ingredient;
    } else {
        return ingredient.item;
    }
}

function getRecipeId(result: ItemIngredient): string {
    return randomIdFromIdentifier(sanitiseIdentifierForFilename(getIngredientId(result)));
}   

export class RecipeGenerator extends GeneratorFactory<ShapedRecipe> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/recipes");
    }

    makeShapedRecipe(key: Record<string, ItemIngredient>, pattern: string[], result: ItemIngredient, tags = ["crafting_table"]): ShapedRecipe {
        const id = getRecipeId(result);
        const def = new ShapedRecipe(this.projectNamespace, id, key, pattern, result, tags);
        this.filesToGenerate.set(id, def);
        return def;
    }

    makeShapelessRecipe(ingredients: ItemIngredient[], result: ItemIngredient, tags = ["crafting_table"]): ShapelessRecipe {
        const id = getRecipeId(result);
        const def = new ShapelessRecipe(this.projectNamespace, id, ingredients, result, tags);
        this.filesToGenerate.set(id, def);
        return def;
    }

    makeFurnaceRecipe(input: ItemIngredient, result: ItemIngredient, tags = ["furnace"]): FurnaceRecipe {
        const id = getRecipeId(result);
        const def = new FurnaceRecipe(this.projectNamespace, id, input, result, tags);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export class ShapedRecipe extends GeneratorBase<ShapedRecipe> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string, key: Record<string, ItemIngredient>, pattern: string[], result: ItemIngredient, tags = ["crafting_table"]) {
        super();
        this.data = {
            "format_version": "1.17",
            "minecraft:recipe_shaped": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "tags": tags,
                "pattern": pattern,
                "key": key,
                "result": result
            }
        };
    }
}

export class ShapelessRecipe extends GeneratorBase<ShapelessRecipe> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string, ingredients: ItemIngredient[], result: ItemIngredient, tags = ["crafting_table"]) {
        super();
        this.data = {
            "format_version": "1.17",
            "minecraft:recipe_shapeless": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "tags": tags,
                "ingredients": ingredients,
                "result": result
            }
        };
    }
}

export class FurnaceRecipe extends GeneratorBase<FurnaceRecipe> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string, id: string, input: ItemIngredient, result: ItemIngredient, tags = ["furnace"]) {
        super();
        this.data = {
            "format_version": "1.17",
            "minecraft:recipe_furnace": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                },
                "tags": tags,
                "input": input,
                "output": result
            }
        };
    }
}