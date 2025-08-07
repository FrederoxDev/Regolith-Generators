import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";

export class RecipeGenerator extends GeneratorFactory<ShapedRecipe> {
    data: Record<string, unknown>;

    constructor(projectNamespace: string) {
        super(projectNamespace, "BP/recipes");
    }

    makeShapedRecipe(id: string, key: Record<string, ItemIngredient>, pattern: string[], result: ItemIngredient, tags = ["crafting_table"]): ShapedRecipe {
        const def = new ShapedRecipe(this.projectNamespace, id, key, pattern, result, tags);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export type ItemIngredient = {
    item: string;
    data?: number;
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