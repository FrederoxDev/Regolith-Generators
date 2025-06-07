import { CommmonToggleProps, GetRef, PanelProps, Variable } from "../../mod.ts";

export interface LightTextToggleProps extends CommmonToggleProps {}

export class CommonToggles {
    public static LightTextToggle = GetRef<LightTextToggleProps>("common_toggles", "light_text_toggle");
}