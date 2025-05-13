import { GeneratorBase } from "../GeneratorBase.ts";

// type EmptyObject = Record<string | number | symbol, never>;

type Constructor<T = {}> = new (...args: any[]) => T;
type VariableExpr = string;
export type Variable<T> = T | VariableExpr;

export type Size = Variable<number> | `${number}` | `${number}px` | `${number}%${'x' | 'y' | '' | 'c' | 'cm' | 'sm'}` | `fill` | `default`;
export type Size2D = [Size, Size];
export type Anchor = "top_left" | "top_middle" | "top_right" | "left_middle" | "center" | "right_middle" | "bottom_left" | "bottom_middle" | "bottom_right";

function FromSizeLike(x: Size, y: Size): Size2D;
function FromSizeLike(x: Size2D): Size2D;
function FromSizeLike(x: Size | Size2D, y?: Size): Size2D {
    if (Array.isArray(x)) return x;
    if (y === undefined) throw new Error("Invalid arguments for FromSizeLike.");
    return [x, y];
}

function ControlNameFromDeclaration(declaration: string): string {
    if (declaration.includes("@")) return declaration.split("@")[0];
    return declaration;
}

class ControlRef{
    owningNamespace: string;
    controlName: string;

    constructor(owningNamespace: string, controlName: string) {
        this.owningNamespace = owningNamespace;
        this.controlName = controlName;
    }
}

export function GetRef<Props>(owningNamespace: string, controlName: string) {
    const controlRef = new ControlRef(owningNamespace, controlName);

    const ControlClass = class extends Control {
        static controlName = controlName;

        constructor(props: Props) {
            super(controlRef);
        }
    }

    return ControlClass;
}
 
export class UiFile extends GeneratorBase<UiFile> {
    override data: Record<string, unknown>;
    uiNamespace: string;
    controls: Map<string, Control> = new Map();

    constructor(uiNamespace: string, existingData?: Record<string, unknown>) {
        super();
        this.data = existingData ?? {};
        this.uiNamespace = uiNamespace;
        this.data.namespace = uiNamespace;
    }

    override toJson(): Record<string, unknown> {
        const data = super.toJson();

        this.controls.forEach((control, name) => {
            data[name] = control.toJson();
        });

        return data;
    }

    addControl<Props>(controlName: string, control: Control) {
        if (!(control instanceof Control)) {
            throw new Error("Control must be an instance of Control.");
        }

        this.controls.set(controlName, control);

        const controlRef = new ControlRef(this.uiNamespace, controlName);

        const ControlClass = class extends Control {
            static controlName = controlName;

            constructor(props: Props) {
                super(controlRef);
            }
        }

        return ControlClass;
    }
}

export class Control extends GeneratorBase<Control> {
    override data: Record<string, unknown>;
    base: ControlRef | undefined;
    controls: [string, Control][] = [];

    constructor(base: ControlRef | undefined = undefined, ...args: any[]) {
        super();
        this.base = base;
        this.data = {};
    }

    public setBase(base: ControlRef): this {
        this.base = base;
        return this;
    }

    protected setType(type: string): this {
        this.data.type = type;
        return this;
    }

    public addControl(name: string, control: Control): this {
        const base = control.base;

        if (base != undefined) {
            this.controls.push([`${name}@${base.owningNamespace}.${base.controlName}`, control]);
        }
        else {
            this.controls.push([name, control]);
        }
        return this;
    }

    public setVariable<T>(name: string, value: Variable<T>, asFallback?: boolean): this {
        if (asFallback) {
            this.data[`$${name}|default`] = value;
        }
        else {
            this.data[`$${name}`] = value;
        }

        return this;
    }

    public override toJson(): Record<string, unknown> {
        const data = super.toJson();

        const controls = this.getValueAtPath<Record<string, unknown>[]>("controls", []);

        this.controls.forEach(([name, control]) => {
            let key = `${name}`;
            controls.push({ [key]: control.toJson() });
        });

        if (controls.length > 0) {
            data.controls = controls;
        }

        return data;
    }
}

interface Binding {
    /**
     * If binding should be ignored
     */
    ignored?: boolean;

    binding_type: "global" | "view" | "collection" | "collection_details" | "none";

    /**
     * Stores the value of the data binding name or condition with it
     */
    binding_name?: string;

    /**
     * Name of the UI element property that will apply the stored value in binding_name
     */
    binding_name_override?: string

    /**
     * 	Name of the collection of items to be used
     */
    binding_collection_name?: string;

    binding_collection_prefix?: string;

    /**
     * Condition for the data binding to happen.
     */
    binding_condition?: "always" | "always_when_visible" | "visible" | "once" | "none" | "visibility_changed";

    /**
     * Name of the UI element to observe its property values
     */
    source_control_name?: string;

    /**
     * Store the value of the property value of the UI element refered in source_control_name
     */
    source_property_name?: string;

    /**
     * The UI element property that the stored value in source_property_name will be applied to
     */
    target_property_name?: string;

    /**
     * 	If true, allows the selection of a sibling element in the same control instead of its child, for source_control_name
     */
    resolve_sibling_scope?: boolean;
}

// Component Props
interface DataBindingProps {
    bindings?: Binding[];
}

interface SpriteComponentProps {
    texture?: Variable<string>;
}

interface LayoutComponentProps {
    size?: Variable<Size2D>;
    offset?: Variable<Size2D>;
    anchor_to?: Variable<Anchor>;
    anchor_from?: Variable<Anchor>;
}

interface ControlProps {
    visible?: Variable<boolean>;
    enabled?: Variable<boolean>;
    layer?: Variable<number>;
}

interface LabelComponentProps {
    text?: Variable<string>;
    color?: Variable<[number, number, number]>;
    locked_color?: Variable<[number, number, number]>;
    shadow?: Variable<boolean>;
    hide_hyphen?: Variable<boolean>;
    notify_on_elipses?: Variable<string[]>;
    enable_profanity_filter?: Variable<boolean>;
    locked_alpha?: Variable<number>;
    font_size?: Variable<"small" | "normal" | "large" | "extra_large">;
    font_scale_factor?: Variable<number>;
    localize?: Variable<boolean>;
    line_padding?: Variable<number>;
    font_type?: Variable<"default" | "rune" | "unicode" | "smooth" | "MinecraftTen">;
    text_alignment?: Variable<"left" | "center" | "right">;
}

interface CustomRendererComponentProps {
    renderer?: string;
}

interface StackPanelComponentProps {
    orientation?: "horizontal" | "vertical";
}

interface CollectionComponentProps {
    /**
     * Name of the collection to be used
     */
    collection_name?: Variable<string>;
}

/**
 * Props that are used within the UI generator. Not found in minecraft
 */
interface GeneratorProps {
    /**
     * A flag that indicates if the generator should handle children elements
     * - if true, the generator will ignore the children elements and only generate the parent element
     */
    handles_children?: true;

    /**
     * Can be used to define fallback values for variables
     */
    defaults?: Record<string, Variable<any>>;
}

// Components
function LabelComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Label extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function DataBindingComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class DataBinding extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function LayoutComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Layout extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function SpriteComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Sprite extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function CustomRendererComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class CustomRenderer extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function StackPanelComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class StackPanel extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function CollectionComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Collection extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

// Element type props
export interface PanelProps extends LayoutComponentProps, ControlProps, DataBindingProps, GeneratorProps {};
export interface ImageProps extends SpriteComponentProps, LayoutComponentProps, ControlProps, DataBindingProps, GeneratorProps {};
export interface LabelProps extends LabelComponentProps, LayoutComponentProps, ControlProps, DataBindingProps, GeneratorProps {};
export interface CustomProps extends CustomRendererComponentProps, LayoutComponentProps, ControlProps, DataBindingProps, GeneratorProps {};
export interface StackPanelProps extends StackPanelComponentProps, LayoutComponentProps, ControlProps, DataBindingProps, CollectionComponentProps, GeneratorProps {};
export interface CollectionProps extends CollectionComponentProps, LayoutComponentProps, ControlProps, DataBindingProps, GeneratorProps {};

// Element types
export class Label extends DataBindingComponent(LabelComponent(LayoutComponent(Control))) {
    constructor(props: LabelProps) {
        super();
        this.setType("label");
    }
}

export class Image extends DataBindingComponent(SpriteComponent(LayoutComponent(Control))) {
    constructor(props: ImageProps) {
        super();
        this.setType("image");
    }
}

export class Panel extends LayoutComponent(Control) {
    constructor(props: PanelProps) {
        super();
        this.setType("panel");
    }    
}

export class Custom extends CustomRendererComponent(DataBindingComponent(LayoutComponent(Control))) {
    constructor(props: PanelProps) {
        super();
        this.setType("custom");
    }
}

export class StackPanel extends CollectionComponent(StackPanelComponent(DataBindingComponent(LayoutComponent(Control)))) {
    constructor(props: StackPanelProps) {
        super();
        this.setType("stack_panel");
    }
}

export class Collection extends CollectionComponent(DataBindingComponent(LayoutComponent(Control))) {
    constructor(props: CollectionProps) {
        super();
        this.setType("collection");
    }
}

// React implementation
import React from "npm:react";

const UI_PROPS = ["panel","input_panel","image","grid","label","button","screen","scroll_box","stack_panel","toggle","slider","slider_box","dropdown","edit_box","custom","scroll_view","scroll_track","factory","selection_wheel","grid_page_indicator","label_cycler","image_cycler","collection_panel","controls","variables","visible","ignored","modifications","anims","disable_anim_fast_forward","animation_reset_name","enabled","layer","alpha","propagate_alpha","clips_children","allow_clipping","clip_offset","clip_state_change_event","enabled_scissor_test","property_bag","selected","use_child_anchors","grid_position","debug","anchor_from","anchor_to","contained","draggable","follows_cursor","offset","size","max_size","min_size","inherit_max_sibling_width","inherit_max_sibling_height","use_anchored_offset","bindings","sound_name","sound_pitch","sound_volume","default_focus_precedence","focus_enabled","focus_wrap_enabled","focus_magnet_enabled","focus_identifier","focus_change_down","focus_change_up","focus_change_left","focus_change_right","focus_mapping","focus_container","use_last_focus","focus_navigation_mode_left","focus_navigation_mode_right","focus_navigation_mode_down","focus_navigation_mode_up","focus_container_custom_left","focus_container_custom_right","focus_container_custom_down","focus_container_custom_up","button_mappings","modal","inline_modal","always_listen_to_input","always_handle_pointer","always_handle_controller_direction","hover_enabled","prevent_touch_input","consume_event","consume_hover_events","gesture_tracking_button","texture","uv","uv_size","nineslice_size","base_size","color","tiled","tiled_scale","clip_direction","clip_ratio","clip_pixelperfect","keep_ratio","bilinear","fill","grayscale","force_texture_reload","$fit_to_witdh","zip_folder","texture_file_system","allow_debug_missing_texture","pixel_perfect","grid_dimensions","maximum_grid_items","grid_dimension_binding","grid_rescaling_type","grid_fill_direction","precached_grid_item_count","grid_item_template","text","locked_color","shadow","font_size","font_scale_factor","localize","line_padding","font_type","backup_font_type","text_alignment","hide_hypen","locked_alpha","enable_profanity_filter","notify_on_ellipses","default_control","hover_control","pressed_control","locked_control","render_only_when_topmost","screen_not_flushable","always_accepts_input","render_game_behind","absorbs_input","is_showing_menu","is_modal","should_steal_mouse","low_frequency_rendering","screen_draws_last","vr_mode","force_render_below","send_telemetry","close_on_player_hurt","cache_screen","load_screen_immediately","gamepad_cursor","gamepad_cursor_deflection_mode","should_be_skipped_during_automation","orientation","radio_toggle_group","toggle_name","toggle_default_state","toggle_group_forced_index","toggle_group_default_selected","reset_on_focus_lost","toggle_on_button","toggle_off_button","enable_directional_toggling","toggle_grid_collection_name","checked_control","unchecked_control","checked_hover_control","unchecked_hover_control","checked_locked_control","unchecked_locked_control","checked_locked_hover_control","unchecked_locked_hover_control","slider_track_button","slider_small_decrease_button","slider_small_increase_button","slider_steps","slider_direction","slider_timeout","slider_collection_name","slider_name","slider_select_on_hover","slider_selected_button","slider_deselected_button","slider_box_control","background_control","background_hover_control","progress_control","progress_hover_control","indent_control","dropdown_name","dropdown_content_control","dropdown_area","text_box_name","text_edit_box_grid_collection_name","constrain_to_rect","enabled_newline","text_type","max_length","text_control","place_holder_control","can_be_deselected","always_listening","virtual_keyboard_buffer_control","renderer","scrollbar_track_button","scrollbar_touch_button","scroll_speed","gesture_control_enabled","always_handle_scrolling","touch_mode","scrollbar_box","scrollbar_track","scroll_view_port","scroll_content","scroll_box_and_track_panel","jump_to_bottom_on_update","allow_scroll_even_when_content_fits","inner_radius","outer_radius","state_controls","slice_count","button_name","iterate_left_button_name","iterate_right_button_name","initial_button_slice","grid_item_when_current","grid_item_when_not_current","cycler_manager_size_control_target","target_cycler_to_compare","next_sub_page_button_name","prev_sub_page_button_name","text_labels","images", "collection_name"];

export function createMinecraftElement(type: Function, props: any, ...children: any[]): Control {
    props ??= {};

    const handlesChildren = props.handles_children;

    // Inject children into props, this is useful for components that manage their own children
    if (children.length > 0) {
        props.children = children.length === 1 ? children[0] : children;
    }

    const element = new (type as any)(props);

    for (const [key, value] of Object.entries(props ?? {})) {
        if (key === "children") continue;

        if (typeof (element as any)[key] === "function") {
            (element as any)[key](value);
        } 
        else if (key.startsWith("$") || UI_PROPS.includes(key)) {
            element.data[key] = value;
        }
    }

    // Set any default values
    if (props.defaults) {
        for (const [key, value] of Object.entries(props.defaults)) {
            // Don't set default values of existing props
            if (element.data[key] !== undefined) continue;
            element.data[`${key}|default`] = value;
        }
    }
    

    if (!handlesChildren && children.length && typeof (element as any).addControl === "function") {
        children.flat().forEach((child, i) => {
            if (child instanceof Control) {
                element.addControl(`${i}`, child);
            }
        })
    }

    return element;
}

export function createMinecraftFragment(...children: any[]) {
  return children;
}