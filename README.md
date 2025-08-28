# Regolith Generators

Regolith-Generators is a toolkit meant to improve the developer experience of making Minecraft Bedrock Addons and save you time.

## Methodology

### 1. Reducing code repition

When writing JS/TS for scripts in a minecraft addon, it is largely considered a bad practice to copy and paste the exact same peice of code again and again, but for some reason this does not extend to writing `.json` definition files.

Regolith generators introduces ways to re-use specific parts of json. For example, if you wanted to apply a set of specific components to 10 blocks in your pack, with this toolkit you could define the components **once** and apply them to your blocks. 

```tsx
// define your comonent once
export const EXAMPLE_COMPONENT = new BlockComponents()
    .addCustomComponent("example:some_custom_component")
    .addTag("example:some_important_tag_1")
    .addTag("example:some_important_tag_2");

// apply to your blocks 
blocks.makeBlock("example_block")
    .addComponents(EXAMPLE_COMPONENT)
    // ...rest omitted
```

The main advantage of doing it like this means that if you ever need to edit the components that are applied to all of your blocks, you only need to edit it in **one** place, and avoid the potential of forgetting to update specific blocks.

Secondly, since regolith-generators allows you to make multiple blocks in one file, you no longer need to maintain hundreds of individual `.json` files, instead you can organise and structure your pack into neat files.

### 2. Building abstractions

Since regolith-generators runs on TS you can use all the logic of TS to aid the creation of `.json` files. Take the example you are trying to create 16 near identical items to use as a UI element in a container, you could individually create 16 `.json` files and manually edit each one OR you could just generate them programatically.

```tsx
for (let i = 1; i < 16; i++) {
    items.makeItem(`example_item_${i}`)
        .addComponents(
            new ItemComponents()
                .addIcon(`example:example_item_${i}`)
                .setMaxStackSize(1)
        )
}
```

This once again has the advantage of if you need to edit the components on these items, you only have to edit it in one place saving you time as a developer.

Say you have a very common use case in your pack, like creating dummy entities with inventories, you can even build your own abstractions ontop of regolith-generators to make this incredibly easy. 

```ts
interface MachineEntityProps {
    isInventoryPrivate?: boolean;
    numSlots?: number;
    isPersistent?: boolean;
    collisionSize?: number;
    canInteractWithCopperWire?: boolean;
}

export function makeMachineEntity(
    serverEntities: ServerEntityGenerator,
    entityID: string,
    props: MachineEntityProps = {}
): ServerEntityDef {
    const entity = serverEntities.makeEntity(entityID)
        .addComponents(
            new EntityComponents()
                .if(props.numSlots !== 0 && props.numSlots !== undefined, (c) => c.addInventory(props.numSlots!, props.isInventoryPrivate))
                .addTypeFamily("fluffyalien_energisticscore:machine_entity")
                .addCollisionBox(props.collisionSize ?? 1, props.collisionSize ?? 1)
                .disableDamage()
                .if(props.isPersistent ?? false, (c) => c.addTypeFamily("example:persistent_machine_entity"))
        )
        .setSummonable(true)
        .setSpawnability(false)

    return entity;
}

// this can then be used to generate entities incredibly easily
makeMachineEntity(serverEntities, "example_1", {
    numSlots: 3,
    isInventoryPrivate: true,
})

makeMachineEntity(serverEntities, "example_2", {
    numSlots: 12,
    collisionSize: 0.2,
})
```

### 3. Automate the boring things

Regolith-generators at the end of the day is also just a deno `.ts` file runner, and therefore you can also access all of the packages too. One example use case is completely automating things like `terrain_texture.json`.

```ts
import { createFile } from "Regolith-Generators"
import { join, extname, basename } from "jsr:@std/path";
import { walkSync } from "jsr:@std/fs";

const projectNamespace = "example";
const studioBase = `example_studio/example`;
const texturesFolder = join(Deno.cwd(), "RP", "textures", studioBase, "blocks");

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
    "num_mip_levels": 4,
    "padding": 8,
    "resource_pack_name": "pack.name",
    "texture_name": "atlas.terrain",
    texture_data: textureData,
});
```

This allows you to spend more time on the things that matter, increasing iteration speed.

### 4. Build as you go

Regolith-generators is **not** feature complete, far from it infact. This project is mainly being built along my own process to exactly fit my current needs, and therefore I haven't spent the time adding every component or making generator types for everything yet. **However** it is designed to be as simple as possible to add new generator types.

Before this library, whenever I wanted to automate generating files from JS/TS I had to write the basic stuff over-and-over again and had to handle the boring bits like matching the exact json structure of item files for example. The goal of this is to be the **only** toolkit you need and allow you to expand it to fit your own needs, and avoid writing one-off tools.

## Features

Currently Regolith-Generators is mainly built for creating: Blocks, Items, ServerEntities, ClientEntities, Recipes and UI, however this is very likely to expand across pretty much everything avaliable whenever I need it.

### UI Toolkit

One of the biggest features of Regolith-Generators is its UI toolkit.

At its core, its essentially just a wrapper around json-ui built using TSX. Here is a basic StackPanel with some text

```tsx
<StackPanel orientation="vertical">
    <Label text="Hello world" />
</StackPanel>
```
But I think the actual value of this is the ability to componentise and mostly strictly type the uses of them:

```tsx
interface TestComponentProps extends StackPanelProps {
    // Variables without $ get figured out at compile time
    text: string;
    $other_text?: string;
}

function TestComponent(props: TestComponentProps) {
    return <StackPanel orientation="vertical">
        <Label text={props.text} />

        {/* defaults can provide default values to vars */}
        <Label text={"$other_text"} defaults={{
            $other_text: "Default Text"
        }}  />

        {/* Props.children can be used to get all the content used between the <TestComponent> tags */}
        {props.children}
    </StackPanel>
}

<TestComponent
    text="Hello, World!"
    $other_text="Overriden text"
>
    {/* Content in here is placed under props.children */}
    <Image texture="textures/misc/black" size={[16, 16]} />
</TestComponent>
```

This is another example, where I've created components for creating basic inventory slots, and ontop of it I've built a way to create entire inventories via forms.

```tsx
const ScriptItemSlot = serverForm.addControl<FormItemSlotProps & GeneratorProps>("inventory_slot", 
    <FormItemSlot cellSize={[18, 18]} itemSize={[16, 16]} defaults={{ $index: 0 }} />
);

function FormInventory(props: { width: number; height: number; cellSize?: number; startIndex?: number} & PanelProps) {
    const cellSize = props.cellSize === undefined ? 18 : props.cellSize;
    const startIndex = props.startIndex === undefined ? 0 : props.startIndex;

    return <Panel anchor_to="top_left" anchor_from="top_left">
        {
            Array.from({ length: props.width * props.height }, (_, i) => {
                const x = i % props.width;
                const y = Math.floor(i / props.width);
                return (
                    <ScriptItemSlot
                        offset={[x * cellSize, y * cellSize]}
                        $item_index={startIndex + i * 2}
                        $count_index={startIndex + i * 2 + 1}
                    />
                );
            })
        }
    </Panel>
}
```

This for example re-creates inventory_bottom_half from chest_screen as a form-ui.

```tsx
const FormPlayerInventory = serverForm.addControl<PanelProps>("inventory_bottom_half", 
    <Panel size={[176, 105]} layer={1} anchor_to="center" anchor_from="center">
        <Common.CommonPanel layer={1} $show_close_button={false} />

        {/* Inventory slots + Hotbar */}
        <Label text="Inventory" layer={6} anchor_to="top_left" anchor_from="top_left" offset={[7, 10]} color="$title_text_color" />
        <FormInventory width={9} height={3} layer={5} offset={[7, 15 + 7]} startIndex={18}/>
        <FormInventory width={9} height={1} layer={5} offset={[7, 54 + 15 + 4 + 7]} startIndex={0} />
    </Panel>
)
```