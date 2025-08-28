import { createMinecraftElement, Panel, Label, Image, Size2D, ImageProps, Variable } from "../../mod.ts";
import { FormItemSlotProps, FormIndexProviderProps, FormHoverButton, FormItemRenderer, FormIndexProvider, FormHovertext, Hovertext } from "../mod.ts";

export interface StaticItemSlotProps extends ImageProps {
    cellSize?: Size2D;
    itemSize?: Size2D;

    $cell_image?: string;
    $item_image: string;
    $hover_text?: string;
    $hover_layer?: Variable<number>;
}

export function StaticItemSlot(props: StaticItemSlotProps & FormIndexProviderProps) {
    return (
        <Image texture={"$cell_image"} size={props.cellSize ?? [20, 20]} anchor_to="top_left" anchor_from="top_left" defaults={{
            $cell_image: "textures/ui/cell_image",
        }}>
            <Image texture="$item_image" size={props.itemSize ?? [20, 20]} anchor_to="top_left" anchor_from="top_left" />
            <Hovertext $hover_text="$hover_text" $hover_layer={props.$hover_layer ? props.$hover_layer : 200} />
        </Image>
    )
}