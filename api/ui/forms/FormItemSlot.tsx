import { createMinecraftElement, FormIndexProvider, FormIndexProviderProps, Image, ImageProps, Label, Panel, Size2D } from "../../mod.ts";
import { FormHoverButton } from "./FormHoverButton.tsx";
import { FormItemRenderer } from "./FormItemRenderer.tsx";

export interface FormItemSlotProps extends ImageProps {
    cellSize: Size2D;
    itemSize: Size2D;
    isClickable?: boolean;

    $cell_size?: Size2D;
    $item_index?: number;
    $count_index?: number;
}

export function FormItemSlot(props: FormItemSlotProps & FormIndexProviderProps) {
    return (
        <Image texture={"$cell_image"} size={props.cellSize} anchor_to="top_left" anchor_from="top_left" defaults={{
            $cell_image: "textures/ui/cell_image",
        }}>
            { (props.isClickable ?? true) ? <FormHoverButton $button_size={props.cellSize} $index={"$item_index"} /> : <Panel /> }
            <FormItemRenderer $index={"$item_index"}></FormItemRenderer>
            <FormIndexProvider $index={"$count_index"}>
                <Panel size={props.cellSize}>
                <Label 
                    text="#form_button_text" 
                    offset={"$element_offset"} 
                    size={[props.cellSize[0], "default"]} 
                    anchor_from="bottom_left" 
                    anchor_to="bottom_left"
                    layer={210}
                    text_alignment="right"
                    shadow={true}
                    bindings={[
                        {
                            binding_name: "#form_button_text",
                            binding_type: "collection",
                            binding_collection_name: "form_buttons",
                        },
                        {
                            binding_type: "collection_details",
                            binding_collection_name: "form_buttons",
                        }
                    ]}
                />
            </Panel>
            </FormIndexProvider>
        </Image>
    )
}