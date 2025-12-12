import { createMinecraftElement, Common, FormHovertext, FormIndexProvider, Size2D, FormHovertextProps, IndexProviderProps } from "../../mod.ts";

export interface FormHoverButtonProps extends IndexProviderProps, FormHovertextProps {
    $button_size?: Size2D;
    $consume_hover_events?: boolean;
}

export function FormHoverButton(_props: FormHoverButtonProps) {
    return <FormIndexProvider>
        <Common.Button 
            defaults={{
                $hover_control: "",
                $consume_hover_events: false,
            }}
            $pressed_button_name="button.form_button_click" 
            $button_text_binding_type="collection"
            $button_text_grid_collection_name="form_buttons"
            $button_text_max_size={["100%", 20]}
            $button_text="#null" 
            anchor_from="top_left" anchor_to="top_left" 
            size="$button_size"
            bindings={[
                {
                    binding_type: "collection_details",
                    binding_collection_name: "form_buttons",
                }
            ]}
            consume_hover_events="$consume_hover_events"
            hover_control="hover"
        >
            <FormHovertext key="hover" />
        </Common.Button>
    </FormIndexProvider>
}