import { BlockGenerator, ItemComponents, ItemGenerator } from "../mod.ts";

/**
 * Creates an entire set for an ore.
 * Includes: 
 *  - materialName_block
 *  - raw_materialName_block
 *  - materialName_ore
 *  - deepslate_materialName_ore
 *  - materialName_ingot
 *  - raw_materialName
 */
export function MakeOreSet(blocks: BlockGenerator, items: ItemGenerator, projectNamespace: string, materialName: string) {
    blocks.makeBlock(`${materialName}_block`);
    blocks.makeBlock(`raw_${materialName}_block`);
    blocks.makeBlock(`${materialName}_ore`);
    blocks.makeBlock(`deepslate_${materialName}_ore`);

    items.makeItem(`${materialName}_ingot`)
        .addComponents(
            new ItemComponents()
                .addIcon(`${projectNamespace}:${materialName}_ingot`)
        )

    items.makeItem(`raw_${materialName}`)
        .addComponents(
            new ItemComponents()
                .addIcon(`${projectNamespace}:raw_${materialName}`)
        )
}