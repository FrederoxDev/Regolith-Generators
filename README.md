# Regolith Generators

Intended to be the regolith alternative to the [bridge. generator scripts](https://bridge-core.app/guide/advanced/generator-scripts/index.html)

## Use-cases

Place `.ts` files directly into your BP/RP and this filter will run each one with Deno. More convenient than making filters for one off scripts.

### Bulk file generation

```ts
// BP/blocks/ExampleBlockGenerator.ts
import { createFile } from "file:///C:/Users/blake/Documents/Regolith-Generators/api/mod.ts"

const blockNames = ["foo", "bar"];

blockNames.forEach(id => {
    createFile({
        "format_version": "1.21.0",
        "minecraft:block": {
            "description": {
                "identifier": `studio_name:${id}`,
            },
            "components": {
                // do whatever ...
            }
        }
    }, `BP/blocks/${id}.json`)
    // ^ Must pass in a file name here since generating multiple
});
```

### One off file generation

```ts
// RP/textures/item_texture.ts
import { createFile } from "file:///C:/Users/blake/Documents/Regolith-Generators/api/mod.ts"
import { join, extname, basename } from "jsr:@std/path";
import { walkSync } from "jsr:@std/fs";

const projectNamespace = "foo";
const studioBase = `bar/baz`;
const texturesFolder = join(Deno.cwd(), "RP", "textures", studioBase, "items");

const textureData: Record<string, unknown> = {};

for (const entry of walkSync(texturesFolder, { exts: [".png"], includeFiles: true })) {
    const textureName = basename(entry.path, extname(entry.path));
    const relativePath = entry.path.replaceAll("\\", "/").split("/RP/")[1];
    const noExtensionPath = relativePath.replace(extname(relativePath), "");

    textureData[`${projectNamespace}:${textureName}`] = {
        "textures": noExtensionPath
    }
}

createFile({
    resource_pack_name: "pack.name",
    texture_name: 'atlas.items',
    texture_data: textureData,
});
// ^ No file path has to be provided for one off files
```