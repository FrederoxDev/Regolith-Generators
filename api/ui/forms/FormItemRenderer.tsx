import { createMinecraftElement, FormIndexProvider, FormIndexProviderProps, Image, Size2D } from "../../mod.ts";
import { Beacon } from "../minecraft/Beacon.tsx";

export interface FormItemRendererProps {
    $element_offset?: Size2D;
    $icon_size?: Size2D;
}

export function FormItemRenderer(_props: FormItemRendererProps & FormIndexProviderProps) {
    return <FormIndexProvider defaults={{
        $icon_size: [16, 16],
    }}>
        {/* Textures via strings */}
        <Image offset={"$element_offset"} size={"$icon_size"} layer={200} bindings={[
            {
                binding_name: "#form_button_texture",
                binding_type: "collection",
                binding_name_override: "#texture",
                binding_collection_name: "form_buttons"
            },
            {
                binding_name: "#form_button_texture_file_system",
                binding_name_override: "#texture_file_system",
                binding_type: "global",
                binding_collection_name: "form_buttons"
            },
            {
                binding_type: "view",
                source_property_name: "((#texture - 'aux:' = #texture))",
                target_property_name: "#visible"
            }
        ]} />

        {/* Texture via aux ID */}
        <Beacon.ItemRenderer offset={"$element_offset"} size={"$icon_size"} layer={200} anchor_to="center" anchor_from="center" bindings={[
            {
                binding_name: "#form_button_texture",
                binding_name_override: "#texture",
                binding_type: "collection",
                binding_collection_name: "form_buttons"
            },
            {
                binding_type: "view",
                source_property_name: "('%.4s' * #texture = 'aux:')",
				target_property_name: "#visible"
            },
            {
                binding_type: "view",
                source_property_name: "((#texture - 'aux:') * 1)",
                target_property_name: "#item_id_aux"
            }
        ]}/>
    </FormIndexProvider>
}