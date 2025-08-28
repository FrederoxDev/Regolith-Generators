import { ButtonProps, GetRef, ImageProps, InputPanelProps, PanelProps, Size2D, ToggleProps, Variable } from "../../mod.ts";

export interface CommonButtonProps {
    $pressed_button_name?: string;
    $button_text_binding_type?: string;
    $button_text_grid_collection_name?: string;
    $button_text_max_size?: Size2D;
    $button_text?: string;
}

export interface CommonPanelProps {
    $dialog_background?: string;
    $show_close_button?: boolean;
}

export interface CommonScrollingPanelProps {
    $scrolling_content?: string;
    $show_background?: boolean;
}

export interface CommmonToggleProps extends ToggleProps {
    $toggle_text?: string,
    $toggle_name?: string,
    $radio_toggle_group?: boolean,
    $toggle_view_binding_name?: string,
    $toggle_state_binding_name?: string,
    $toggle_group_default_selected?: Variable<number>,
    $toggle_group_forced_index?: Variable<number>,
    $checked_control?: string,
    $unchecked_control?: string,
    $checked_hover_control?: string,
    $unchecked_hover_control?: string,
    $unchecked_locked_control?: string,
    $checked_locked_control?: string,
    $checked_locked_hover_control?: string,
    $unchecked_locked_hover_control?: string,
    $toggle_binding_type?: "none" | "global",
    $toggle_off_button?: string,
    $toggle_on_button?: string,
    $radio_toggle_enabled?: boolean,
    $toggle_default_state?: boolean,
}

/**
 * The `common` namespace in vanilla Minecraft UI.
 */
export class Common {
    public static Button = GetRef<CommonButtonProps & ButtonProps>("common", "button");
    public static CommonPanel = GetRef<CommonPanelProps & PanelProps>("common", "common_panel");
    public static ScrollingPanel = GetRef<CommonScrollingPanelProps & PanelProps>("common", "scrolling_panel");
    public static Toggle = GetRef<CommmonToggleProps>("common", "toggle");
    public static EmptyPanel = GetRef<PanelProps>("common", "empty_panel");
    public static RootPanel = GetRef<PanelProps>("common", "root_panel");
    public static InventoryPanelBottomHalf = GetRef<PanelProps>("common", "inventory_panel_bottom_half");
    public static HotbarGridTemplate = GetRef<PanelProps>("common", "hotbar_grid_template");
    public static FlyingItemRenderer = GetRef<PanelProps>("common", "flying_item_renderer");
    public static GamepadCursorButton = GetRef<ButtonProps>("common", "gamepad_cursor_button");
    public static SelectedItemDetailsFactory = GetRef<PanelProps>("common", "selected_item_details_factory");
    public static ContainerGamepadHelpers = GetRef<PanelProps>("common", "container_gamepad_helpers");
    public static InventorySelectedIconButton = GetRef<ButtonProps>("common", "inventory_selected_icon_button");
    public static CellImagePanel = GetRef<PanelProps>("common", "cell_image_panel");
    public static CellImage = GetRef<ImageProps>("common", "cell_image");
}   