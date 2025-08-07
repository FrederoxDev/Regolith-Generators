import { GeneratorBase } from "../GeneratorBase.ts";

// type EmptyObject = Record<string | number | symbol, never>;

type Constructor<T = {}> = new (...args: any[]) => T;
type VariableExpr = string;
export type Variable<T> = T | VariableExpr;

export type Size = Variable<number> | `${number}` | `${number}px` | `${number}%${'x' | 'y' | '' | 'c' | 'cm' | 'sm'}` | `fill` | `default`;
export type Size2D = [Size, Size];
export type Anchor = "top_left" | "top_middle" | "top_right" | "left_middle" | "center" | "right_middle" | "bottom_left" | "bottom_middle" | "bottom_right";

class ControlRef {
    owningNamespace: string | undefined;
    controlName: string;

    constructor(owningNamespace: string | undefined, controlName: string) {
        this.owningNamespace = owningNamespace;
        this.controlName = controlName;
    }

    getInheritName() {
        if (this.owningNamespace === undefined) {
            return `@${this.controlName}`;
        }

        return `@${this.owningNamespace}.${this.controlName}`;
    }

    getFullName() {
        if (this.owningNamespace === undefined) {
            return this.controlName;
        }

        return `${this.owningNamespace}.${this.controlName}`;
    }
}

export function GetRef<Props extends GeneratorProps>(owningNamespace: string | undefined, controlName: string) {
    const controlRef = new ControlRef(owningNamespace, controlName);

    const ControlClass = class extends Control {
        static controlName = controlName;

        static getFullName() {
            return controlRef.getFullName();
        }

        static getInheritName() {
            return controlRef.getInheritName();
        }

        constructor(props: Props) {
            super(controlRef, props);
        }
    }

    return ControlClass;
}

export type UiRef<Props extends GeneratorProps> = any;;
 
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

    addControl<Props extends GeneratorProps>(controlName: string, control: Control) {
        if (!(control instanceof Control)) {
            throw new Error("Control must be an instance of Control.");
        }

        if (control.inheritedControl !== undefined) {
            const inherits = control.inheritedControl.getInheritName();
            this.controls.set(`${controlName}${inherits}`, control);
            // console.log(`Adding control ${controlName} to UI file ${this.uiNamespace} with inheritance from ${control.inheritedControl.owningNamespace}.${control.inheritedControl.controlName}`);
        }
        else {
            this.controls.set(controlName, control);
            // console.log(`Adding control ${controlName} to UI file ${this.uiNamespace}`);
        }

        const controlRef = new ControlRef(this.uiNamespace, controlName);

        const ControlClass = class extends Control {
            static controlName = controlName;

            static getFullName() {
                return controlRef.getFullName();
            }

            static getInheritName() {
                return controlRef.getInheritName();
            }

            constructor(props: Props) {
                super(controlRef, props);
            }
        }

        return ControlClass;
    }
}

export class Control extends GeneratorBase<Control> {
    override data: Record<string, unknown>;

    /**
     * Stores a reference to the control that this control inherits from.
     * i.e. example@chest.something
    */
    inheritedControl: ControlRef | undefined;

    /**
     * Stores a list of unrendered controls that are attached to this control.
    */
    controls: [string, Control][] = [];

    key?: string;

    constructor(base: ControlRef | undefined = undefined, props: GeneratorProps, ...args: any[]) {
        super();
        this.inheritedControl = base;
        this.data = {};
        this.key = props.key;

        if (props.children && props.children.length > 0) {
            props.children.forEach((child) => {
                if (child.key !== undefined) {
                    this.addControl(child.key, child);
                }
                else {
                    this.addControl(`${this.controls.length}`, child);
                }
            })
        }
    }

    public setBase(base: ControlRef): this {
        this.inheritedControl = base;
        return this;
    }

    protected setType(type: string): this {
        this.data.type = type;
        return this;
    }

    public addControl(name: string, control: Control): this {
        const base = control.inheritedControl;
        
        if (!(control instanceof Control)) {
            throw new Error("Control must be an instance of Control.");
        }

        if (base != undefined) {
            this.controls.push([`${name}@${base.getFullName()}`, control]);
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

        // Check through data to find any instances where there are Control[]'s, if found flatten them into JSON
        for (const key in data) {
            const value = data[key];

            if (!(Array.isArray(value) && value.every(item => item instanceof Control))) continue;

            const jsonified = value.map((ctrl, idx) => {
                const base = ctrl.inheritedControl === undefined
                    ? ""
                    : ctrl.inheritedControl.getInheritName();

                const key = (ctrl.key ?? `${idx}`) + base;
                return { [key]: ctrl.toJson() };
            });

            data[key] = jsonified;
        }

        const rawControls = this.getValueAtPath<Record<string, unknown>[] | string>("controls", []);

        // Controls could possibly be a variable, in that scenario ignore it
        let controlsIsVariable = false;
        let controls: Record<string, unknown>[] = [];

        if (typeof rawControls === "string") {
            if (!rawControls.startsWith("$")) {
                throw new Error(`Only expected controls to be an array of controls or a variable, got: ${rawControls}, am I missing a use-case?`);
            }

            controlsIsVariable = true;
        }
        else if (Array.isArray(rawControls)) {
            controls = rawControls;
        }
        else {
            throw new Error(`Expected controls to be an array of controls or a variable, got: ${rawControls}`);
        }

        if (!controlsIsVariable) this.controls.forEach(([name, control]) => {
            controls.push({ [`${name}`]: control.toJson() });
        });

        // Check for duplicate control names, sometimes running into issues where children get duplicated
        // so this helps to catch that
        const previouslySeenKeys = new Set<string>();

        if (!controlsIsVariable) controls.forEach((item) => {
            const key = Object.keys(item)[0];

            if (previouslySeenKeys.has(key)) {
                console.log("super", super.constructor.name);
                console.log("this.controls", this.controls);
                console.log("super data", data)
                throw new Error(`Duplicate control name: ${key}`);
            }

            previouslySeenKeys.add(key);
        });

        if (controls.length > 0) {
            data.controls = controls;
        }

        return data;
    }
}

interface AnimationComponentProps {
    anim_type: "alpha" | "clip" | "color" | "flip_book" | "offset" | "size" | "uv" | "wait" | "aseprite_flip_book";
    duration?: Variable<number>;
    next?: Variable<string>;
    destroy_at_end?: Variable<string>;
    play_event?: Variable<string>;
    end_event?: Variable<string>;
    start_event?: Variable<string>;
    reset_event?: Variable<string>;
    easing?: "linear" | "spring" | "in_quad" | "out_quad" | "in_out_quad" | "in_cubic" | "out_cubic" | "in_out_cubic" | "in_quart" | "out_quart" | "in_out_quart" | "in_quint" | "out_quint" | "in_out_quint" | "in_sine" | "out_sine" | "in_out_sine" | 
        "in_expo" | "out_expo" | "in_out_expo" | "in_circ" | "out_circ" | "in_out_circ" | "in_bounce" | "out_bounce" | "in_out_bounce" | "in_back" | "out_back" | "in_out_back" | "in_elastic" | "out_elastic" | "in_out_elastic";
    from?: Variable<any>,
    to?: Variable<any>;
    initial_uv?: Variable<[number, number]>;
    fps?: Variable<number>;
    frame_count?: Variable<number>;
    frame_step?: Variable<number>;
    reversible?: Variable<boolean>;
    resettable?: Variable<boolean>;
    scale_from_starting_alpha?: Variable<boolean>;
    activated?: Variable<boolean>;
}

interface Factory {
    /**
     * Map of control names to instances of controls.
     * 
     * @example
     * "control_ids": {
		        "test": "@server_form.list_filter_0"
        }
     */
    control_ids?: Record<string, string>;

    control_name?: string;

    factory_variables?: Variable<any>;

    insert_location?: Variable<any>

    max_children_size?: Variable<number>;

    max_size?: Variable<number>;

    name?: string;
}

interface Binding {
    /**
     * If binding should be ignored
     */
    ignored?: boolean;

    binding_type?: "global" | "view" | "collection" | "collection_details" | "none";

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
    allow_debug_missing_texture?: Variable<boolean>;
    uv?: Variable<[number, number]>;
    uv_size?: Variable<[number, number]>;
    texture_file_system?: Variable<string>;
    nineslice_size?: Variable<number | [number, number, number, number]>;
    tiled?: Variable<boolean | "x" | "y">;
    tiled_scale?: Variable<[number, number]>;
    clip_direction?: Variable<"left" | "right" | "up" | "down" | "center">;
    clip_ratio?: Variable<number>;
    clip_pixelperfect?: Variable<boolean>;
    keep_ratio?: Variable<boolean>;
    bilinear?: Variable<boolean>;
    fill?: Variable<boolean>;
    grayscale?: Variable<boolean>;
    zip_folder?: Variable<string>;
    force_texture_reload?: Variable<boolean>;
    base_size?: Variable<[number, number]>;
}

interface LayoutComponentProps {
    size?: Variable<Size2D>;
    controls?: Variable<Control[]>;
    max_size?: Variable<Size2D>;
    min_size?: Variable<Size2D>;    
    offset?: Variable<Size2D>;
    anchor_to?: Variable<Anchor>;
    anchor_from?: Variable<Anchor>;
    inherit_max_sibling_width?: Variable<boolean>;
    inherit_max_sibling_height?: Variable<boolean>;
    use_anchored_offset?: Variable<boolean>;
    contained?: Variable<boolean>;
    draggable?: Variable<boolean>;
    follows_cursor?: Variable<boolean>;
}

interface ControlProps {
    visible?: Variable<boolean>;
    enabled?: Variable<boolean>;
    layer?: Variable<number>;
    alpha?: Variable<number>;
    propagate_alpha?: Variable<boolean>;
    clips_children?: Variable<boolean>;
    allow_clipping?: Variable<boolean>;
    clip_offset?: Variable<Size2D>;
    clip_state_change_event?: Variable<string>;
    enabled_scissor_test?: Variable<boolean>;
    property_bag?: Variable<Record<string, unknown>>;
    selected?: Variable<boolean>;
    use_child_anchors?: Variable<boolean>;
    anims?: Variable<string[]>;
    disable_anim_fast_forward?: Variable<boolean>;
    animation_reset_name?: Variable<string>;
    ignored?: Variable<boolean>;
    variables?: Variable<Record<string, unknown>[]>;
    modifications?: Variable<any>;
    grid_position?: Variable<Size2D>;
    collection_index?: Variable<number>;
    factory?: Factory;
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


interface InputComponentProps {
    button_mappings?: Variable<any>;
    modal?: Variable<boolean>;
    inline_modal?: Variable<boolean>;
    always_listen_to_input?: Variable<boolean>;
    always_handle_pointer?: Variable<boolean>;
    always_handle_controller_direction?: Variable<boolean>;
    hover_enabled?: Variable<boolean>;
    prevent_touch_input?: Variable<boolean>;
    consume_event?: Variable<boolean>;
    consume_hover_events?: Variable<boolean>;
    gesture_tracking_button?: Variable<string>;
}

interface ButtonComponentProps {
    default_control?: Variable<string>;
    hover_control?: Variable<string>;
    pressed_control?: Variable<string>;
    locked_control?: Variable<string>;
}

interface FocusComponentProps {
    default_focus_precedence?: Variable<number>;
    focus_enabled?: Variable<boolean>;
    focus_wrap_enabled?: Variable<boolean>;
    focus_magnet_enabled?: Variable<boolean>;
    focus_identifier?: Variable<string>;
    focus_change_down?: Variable<string>;
    focus_change_up?: Variable<string>;
    focus_change_left?: Variable<string>;
    focus_change_right?: Variable<string>;
    focus_mapping?: Variable<any>; // array of focus mapping objects
    focus_container?: Variable<any>;
    use_last_focus?: Variable<boolean>;
    focus_navigation_mode_left?: Variable<"none" | "stop" | "custom" | "contained">;
    focus_navigation_mode_right?: Variable<"none" | "stop" | "custom" | "contained">;
    focus_navigation_mode_down?: Variable<"none" | "stop" | "custom" | "contained">;
    focus_navigation_mode_up?: Variable<"none" | "stop" | "custom" | "contained">;
    focus_container_custom_left?: Variable<any>; // Vector of focus container custom object
    focus_container_custom_right?: Variable<any>; // Vector of focus container custom object
    focus_container_custom_down?: Variable<any>; // Vector of focus container custom object
    focus_container_custom_up?: Variable<any>; // Vector of focus container custom object
}

interface SoundDefinition {
    sound_name?: Variable<string>;
    sound_volume?: Variable<number>;
    sound_pitch?: Variable<number>;
    min_seconds_between_plays?: Variable<number>;
}

interface SoundComponentProps {
    sound_name?: Variable<string>;
    sound_volume?: Variable<number>;
    sound_pitch?: Variable<number>;
    sounds?: Variable<SoundDefinition[]>;
}

interface ScreenComponentProps {
    render_only_when_topmost?: Variable<boolean>;
    screen_not_flushable?: Variable<boolean>;
    always_accepts_input?: Variable<boolean>;
    render_game_behind?: Variable<boolean>;
    absorbs_input?: Variable<boolean>;
    is_showing_menu?: Variable<boolean>;
    is_modal?: Variable<boolean>;
    should_steal_mouse?: Variable<boolean>;
    low_frequency_rendering?: Variable<boolean>;
    screen_draws_last?: Variable<boolean>;
    vr_mode?: Variable<boolean>;
    force_render_below?: Variable<boolean>;
    send_telemetry?: Variable<boolean>;
    close_on_player_hurt?: Variable<boolean>;
    cache_screen?: Variable<boolean>;
    load_screen_immediately?: Variable<boolean>;
    gamepad_cursor?: Variable<boolean>;
    gamepad_cursor_deflection_mode?: Variable<boolean>;
    should_be_skipped_during_automation?: Variable<boolean>;
}

interface ToggleComponentProps {
    radio_toggle_group?: Variable<boolean>;
    toggle_name?: Variable<string>;
    toggle_default_state?: Variable<boolean>;
    toggle_group_forced_index?: Variable<number>;
    toggle_group_default_selected?: Variable<number>;
    reset_on_focus_lost?: Variable<boolean>;
    toggle_on_hover?: Variable<string>;
    toggle_on_button?: Variable<string>;
    toggle_off_button?: Variable<string>;
    enable_directional_toggling?: Variable<boolean>;
    toggle_grid_collection_name?: Variable<string>;
    checked_control?: Variable<string>;
    unchecked_control?: Variable<string>;
    checked_hover_control?: Variable<string>;
    unchecked_hover_control?: Variable<string>;
    checked_locked_control?: Variable<string>;
    unchecked_locked_control?: Variable<string>;
    checked_locked_hover_control?: Variable<string>;
    unchecked_locked_hover_control?: Variable<string>;
}

/**
 * Props that are used within the UI generator. Not found in minecraft
 */
export interface GeneratorProps {
    children?: Control[];

    /**
     * Can be used to define fallback values for variables
     */
    defaults?: Record<string, Variable<any>>;

    /**
     * Can be used to define both anchor_to and anchor_from at the same time
     */
    anchors?: Anchor;

    /**
     * Can be used to set a human-readable name for the control
     */
    key?: string;
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

function InputComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Input extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function FocusComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Focus extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function SoundComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Sound extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function ScreenComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Screen extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function ToggleComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Toggle extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function AnimationsComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Animations extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

function ButtonComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Button extends Base {
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
export interface InputPanelProps extends InputComponentProps, FocusComponentProps, SoundComponentProps, ControlProps, LayoutComponentProps, DataBindingProps, GeneratorProps {};
export interface ScreenProps extends ScreenComponentProps, ControlProps, LayoutComponentProps, DataBindingProps, GeneratorProps {};
export interface ToggleProps extends ToggleComponentProps, InputComponentProps, FocusComponentProps, SoundComponentProps, ControlProps, LayoutComponentProps, DataBindingProps, GeneratorProps {};
export interface AnimationProps extends AnimationComponentProps, GeneratorProps {}
export interface ButtonProps extends ButtonComponentProps, InputComponentProps, FocusComponentProps, SoundComponentProps, ControlProps, LayoutComponentProps, DataBindingProps, GeneratorProps {};

// Element types
export class Label extends DataBindingComponent(LabelComponent(LayoutComponent(Control))) {
    constructor(props: LabelProps) {
        super(undefined, props);
        this.setType("label");
    }
}

export class Image extends DataBindingComponent(SpriteComponent(LayoutComponent(Control))) {
    constructor(props: ImageProps) {
        super(undefined, props);
        this.setType("image");
    }
}

export class Panel extends LayoutComponent(Control) {
    constructor(props: PanelProps) {
        super(undefined, props);
        this.setType("panel");
    }    
}

export class Custom extends CustomRendererComponent(DataBindingComponent(LayoutComponent(Control))) {
    constructor(props: CustomProps) {
        super(undefined, props);
        this.setType("custom");
    }
}

export class StackPanel extends CollectionComponent(StackPanelComponent(DataBindingComponent(LayoutComponent(Control)))) {
    constructor(props: StackPanelProps) {
        super(undefined, props);
        this.setType("stack_panel");
    }
}

export class Collection extends CollectionComponent(DataBindingComponent(LayoutComponent(Control))) {
    constructor(props: CollectionProps) {
        super(undefined, props);
        this.setType("collection");
    }
}

export class CollectionPanel extends CollectionComponent(DataBindingComponent(LayoutComponent(Control))) {
    constructor(props: CollectionProps) {
        super(undefined, props);
        this.setType("collection_panel");
    }
}

export class InputPanel extends InputComponent(DataBindingComponent(FocusComponent(LayoutComponent(Control)))) {
    constructor(props: InputPanelProps) {
        super(undefined, props);
        this.setType("input_panel");
    }
}

export class Screen extends ScreenComponent(DataBindingComponent(FocusComponent(LayoutComponent(Control)))) {
    constructor(props: ScreenProps) {
        super(undefined, props);
        this.setType("screen");
    }
}

export class Toggle extends ToggleComponent(InputComponent(DataBindingComponent(FocusComponent(LayoutComponent(Control))))) {
    constructor(props: ToggleProps) {
        super(undefined, props);
        this.setType("toggle");
    }
}

export class Button extends ButtonComponent(InputComponent(DataBindingComponent(FocusComponent(LayoutComponent(Control))))) {
    constructor(props: ButtonProps) {
        super(undefined, props);
        this.setType("button");
    }
}

export class Animation extends AnimationsComponent(Control) {
    constructor(props: AnimationProps) {
        super(undefined, props);
    }

    protected override setType(type: string): this {
        return this;
    }
}


// React implementation

const UI_PROPS = ["panel","input_panel","image","grid","label","button","screen","scroll_box","stack_panel","toggle","slider","slider_box","dropdown","edit_box","custom","scroll_view","scroll_track","factory","selection_wheel","grid_page_indicator","label_cycler","image_cycler","collection_panel","controls","variables","visible","ignored","modifications","anims","disable_anim_fast_forward","animation_reset_name","enabled","layer","alpha","propagate_alpha","clips_children","allow_clipping","clip_offset","clip_state_change_event","enabled_scissor_test","property_bag","selected","use_child_anchors","grid_position","debug","anchor_from","anchor_to","contained","draggable","follows_cursor","offset","size","max_size","min_size","inherit_max_sibling_width","inherit_max_sibling_height","use_anchored_offset","bindings","sound_name","sound_pitch","sound_volume","default_focus_precedence","focus_enabled","focus_wrap_enabled","focus_magnet_enabled","focus_identifier","focus_change_down","focus_change_up","focus_change_left","focus_change_right","focus_mapping","focus_container","use_last_focus","focus_navigation_mode_left","focus_navigation_mode_right","focus_navigation_mode_down","focus_navigation_mode_up","focus_container_custom_left","focus_container_custom_right","focus_container_custom_down","focus_container_custom_up","button_mappings","modal","inline_modal","always_listen_to_input","always_handle_pointer","always_handle_controller_direction","hover_enabled","prevent_touch_input","consume_event","consume_hover_events","gesture_tracking_button","texture","uv","uv_size","nineslice_size","base_size","color","tiled","tiled_scale","clip_direction","clip_ratio","clip_pixelperfect","keep_ratio","bilinear","fill","grayscale","force_texture_reload","$fit_to_witdh","zip_folder","texture_file_system","allow_debug_missing_texture","pixel_perfect","grid_dimensions","maximum_grid_items","grid_dimension_binding","grid_rescaling_type","grid_fill_direction","precached_grid_item_count","grid_item_template","text","locked_color","shadow","font_size","font_scale_factor","localize","line_padding","font_type","backup_font_type","text_alignment","hide_hypen","locked_alpha","enable_profanity_filter","notify_on_ellipses","default_control","hover_control","pressed_control","locked_control","render_only_when_topmost","screen_not_flushable","always_accepts_input","render_game_behind","absorbs_input","is_showing_menu","is_modal","should_steal_mouse","low_frequency_rendering","screen_draws_last","vr_mode","force_render_below","send_telemetry","close_on_player_hurt","cache_screen","load_screen_immediately","gamepad_cursor","gamepad_cursor_deflection_mode","should_be_skipped_during_automation","orientation","radio_toggle_group","toggle_name","toggle_default_state","toggle_group_forced_index","toggle_group_default_selected","reset_on_focus_lost","toggle_on_button","toggle_off_button","enable_directional_toggling","toggle_grid_collection_name","checked_control","unchecked_control","checked_hover_control","unchecked_hover_control","checked_locked_control","unchecked_locked_control","checked_locked_hover_control","unchecked_locked_hover_control","slider_track_button","slider_small_decrease_button","slider_small_increase_button","slider_steps","slider_direction","slider_timeout","slider_collection_name","slider_name","slider_select_on_hover","slider_selected_button","slider_deselected_button","slider_box_control","background_control","background_hover_control","progress_control","progress_hover_control","indent_control","dropdown_name","dropdown_content_control","dropdown_area","text_box_name","text_edit_box_grid_collection_name","constrain_to_rect","enabled_newline","text_type","max_length","text_control","place_holder_control","can_be_deselected","always_listening","virtual_keyboard_buffer_control","renderer","scrollbar_track_button","scrollbar_touch_button","scroll_speed","gesture_control_enabled","always_handle_scrolling","touch_mode","scrollbar_box","scrollbar_track","scroll_view_port","scroll_content","scroll_box_and_track_panel","jump_to_bottom_on_update","allow_scroll_even_when_content_fits","inner_radius","outer_radius","state_controls","slice_count","button_name","iterate_left_button_name","iterate_right_button_name","initial_button_slice","grid_item_when_current","grid_item_when_not_current","cycler_manager_size_control_target","target_cycler_to_compare","next_sub_page_button_name","prev_sub_page_button_name","text_labels","images", "collection_name", "collection_index", "anim_type", "duration", "next", "destroy_at_end", "play_event", "end_event", "start_event", "reset_event", "easing", "from", "to", "initial_uv", "fps", "frame_count", "frame_step", "reversible", "resettable", "scale_from_starting_alpha", "activated", "control_ids",
"control_name",
"factory_variables",
"insert_location",
"max_children_size",
"max_size",
"name",
"factory"
];

export function createMinecraftElement(
    controlConstructor: Constructor<Control>, 
    properties: (Record<string, unknown> & GeneratorProps) | null, 
    ...children: any[]
): Control {
    properties ??= {};

    if (!Array.isArray(children)) {
        throw new Error("Children must be an array.");
    }

    const flattenedChildren = children.flat();

    flattenedChildren.forEach((child, i) => {
        if (!(child instanceof Control)) {
            console.error("erroring child", child);
            throw new Error(`Child must be an instance of Control. Child at index ${i} is of type ${typeof child}. ctor: ${child.constructor.name}`);
        }
    });

    // Inject children as properties
    if (flattenedChildren.length > 0) {
        properties.children = flattenedChildren;
    }
    
    const element = new controlConstructor(properties);

    // Copy any properties that are known JSON-UI properties AND user defined variables.
    for (const [key, value] of Object.entries(properties ?? {})) {
        if (key.startsWith("$") || UI_PROPS.includes(key)) {
            element.data[key] = value;
        }

        if (key === "anchors") {
            element.data.anchor_from = value;
            element.data.anchor_to = value;
        }
    }

    // Initialize any default user defined variables. Needed since the syntax for this in JSON-UI uses a |, which is not a valid JS variable name.
    // Does not bother applying any user defined variables that are already set to a non-default value.
    if (properties.defaults) {
        for (const [key, value] of Object.entries(properties.defaults)) {
            if (element.data[key] !== undefined) continue;
            element.data[`${key}|default`] = value;
        }
    }

    return element;
}

export function createMinecraftFragment(...children: any[]) {
  return children;
}