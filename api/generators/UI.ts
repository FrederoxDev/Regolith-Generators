import { GeneratorBase } from "../GeneratorBase.ts";

// type EmptyObject = Record<string | number | symbol, never>;

type VariableExpr = string;
type Variable<T> = T | VariableExpr;

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

type ResolveBaseProps<T> = T extends ControlRef<infer P> ? P : {};

export class ControlRef<Props> {
    owningNamespace: string;
    declaration: string;
    controlName: string;

    constructor(owningNamespace: string, declaration: string) {
        this.owningNamespace = owningNamespace;
        this.declaration = declaration;
        this.controlName = ControlNameFromDeclaration(declaration);
    }
}
 
export class UiFile extends GeneratorBase<UiFile> {
    override data: Record<string, unknown>;
    uiNamespace: string;
    controls: Map<string, Control> = new Map();

    constructor(uiNamespace: string, existingData?: Record<string, unknown>) {
        super();
        this.data = existingData ?? {};
        this.data.namespace = uiNamespace;
    }

    addControl<E>(name: string, control: Control): ControlRef<E> {
        const ref = new ControlRef(this.uiNamespace, name);
        this.controls.set(ref.controlName, control);
        return ref;
    }
}

export function GetRef<E>(namespace: string, controlName: string): ControlRef<E> {
    const ref = new ControlRef<E>(namespace, controlName);
    return ref;
}

export class Control<
    ControlBaseProps extends ControlRef<ControlBaseProps> = ControlRef<any>
> extends GeneratorBase<Control> {
    override data: Record<string, unknown>;
    base?: string;
    controls: [string, Control][] = [];

    constructor(...args: any[]) {
        super();
        this.data = {};
    }

    protected setBase(base: string): this {
        this.base = base;
        return this;
    }

    protected setType(type: string): this {
        this.data.type = type;
        return this;
    }

    public addControl(name: string, control: Control): this {
        this.controls.push([name, control]);
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
            if (control.base) { 
                key += `@${control.base}`;
            }

            controls.push({ [key]: control.toJson() });
        });

        if (controls.length > 0) {
            data.controls = controls;
        }

        return data;
    }
}

type Constructor<T = {}> = new (...args: any[]) => T;

interface SpriteComponentProps {
    texture: Variable<string>;
}

function SpriteComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Sprite extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

interface ControlComponentProps<BaseControlProps> {
    base?: ControlRef<BaseControlProps>;
}

interface LayoutComponentProps {
    size?: Size2D;
    offset?: Size2D;
    anchor_to?: Anchor;
    anchor_from?: Anchor;
}

function LayoutComponent<TBase extends Constructor<Control>>(Base: TBase) {
    return class Layout extends Base {
        constructor(...args: any[]) {
            super(...args);
        }
    }
}

export interface PanelProps<BaseControlProps = ControlRef<any>> extends LayoutComponentProps, ControlComponentProps<BaseControlProps> {};

export class Panel extends LayoutComponent(Control) {
    constructor(props: PanelProps) {
        super();
        this.setType("panel");
    }    
}

export interface ImageProps<BaseControlProps = any>
  extends SpriteComponentProps,
          LayoutComponentProps,
          ControlComponentProps<BaseControlProps>,
          ResolveBaseProps<BaseControlProps> {}

export class Image extends SpriteComponent(LayoutComponent(Control)) {
    constructor(props: ImageProps) {
        super();
        this.setType("image");
    }
}