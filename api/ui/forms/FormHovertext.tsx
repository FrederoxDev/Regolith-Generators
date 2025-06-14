import { Custom, createMinecraftElement } from "../../mod.ts";

export interface FormHovertextProps {
    $hover_layer?: number;
}

/**
 * A simple hovertext renderer bound to #form_button_text, should be wrapped in a FormIndexProvider.
 */
export function FormHovertext(_props: FormHovertextProps) {
    return <Custom renderer="hover_text_renderer" allow_clipping={false} layer={"$hover_layer"} bindings={[
        {
            "binding_name": "#form_button_text",
            "binding_type": "collection",
            "binding_collection_name": "form_buttons"
        },
        {
            "binding_type": "view",
            "source_property_name": "#form_button_text",
            "target_property_name": "#hover_text"
        },
        {
            "binding_type": "collection_details",
            "binding_collection_name": "form_button"
        }
    ]} key="hover" defaults={{
        "$hover_layer": 200,
    }}/>
}