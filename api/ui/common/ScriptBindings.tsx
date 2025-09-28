import { GetRef, Panel, createMinecraftElement } from "../../generators/UI.ts";
import { PanelProps } from "../../mod.ts";

interface ScriptVisibilityBindingProps extends PanelProps {
    $update_string: string;
}

export function ScriptVisibilityBinding(props: ScriptVisibilityBindingProps) {
    return (
        <Panel>
            <Panel 
                key="data_control" 
                size={[0, 0]} 
                property_bag={{ "#preserved_text": "" }}
                bindings={[
                    {
                        binding_name: "#hud_title_text_string",
                        binding_condition: "always",
                    },
                    {
                        binding_name: "#hud_title_text_string",
                        binding_name_override: "#preserved_text",
                        binding_condition: "visibility_changed"
                    },
                    {
                        binding_type: "view",
                        source_property_name: "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
                        target_property_name: "#visible",
                        binding_condition: "always"
                    }
                ]}
                >
            </Panel>
            <Panel bindings={[
                {
                    binding_type: "view",
                    source_control_name: "data_control",
                    source_property_name: `#preserved_text`,
                    target_property_name: "#data_control_text",
                    binding_condition: "always",
                    resolve_sibling_scope: true
                },
                {
                    binding_type: "view",
                    source_property_name: `(not (#data_control_text - '${props.$update_string}' = 'hidden'))`,
                    target_property_name: "#visible",
                    binding_condition: "always",
                }
            ]}>
                { props.children }
            </Panel>
        </Panel>
    );
}


interface ScriptBindingContextProps extends PanelProps {
    $update_string: string;
    $output_binding: string;
    key: string
}

const _scriptTextBinding = GetRef<ScriptBindingContextProps>("script_bindings", "text_binding");

export function ScriptTextBinding(props: ScriptBindingContextProps) {
    return <_scriptTextBinding $output_binding={props.$output_binding} $update_string={props.$update_string} key={props.key} />
}