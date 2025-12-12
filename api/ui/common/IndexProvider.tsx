import { CollectionProps, Variable, Size2D, Control, CollectionPanel, createMinecraftElement } from "../../mod.ts";

export interface IndexProviderProps extends CollectionProps {
    $index?: Variable<number>;
    $element_offset?: Size2D;
    collection_name?: string;
}

/**
 * A simple CollectionPanel wrapper that adds the children to the "form_buttons" collection and assigns them an index.
 */
export function IndexProvider(props: IndexProviderProps & { children?: Control | Control[] }) {
    const children = props.children;
    if (children === undefined) throw new Error("TemplateFormButton: children is required");

    let childrenArray: Control[] = [];

    if (children instanceof Control) {
        childrenArray.push(children);
    }
    else if (Array.isArray(children)) {
        childrenArray = children;
    } 
    else {
        throw new Error("TemplateFormButton: children must be a Control or an array of Controls");
    }

    childrenArray.forEach((child) => {
        child.data["collection_index"] = "$index";
        child.data["$offset"] = "$element_offset";
    });

    return <CollectionPanel collection_name={props.collection_name} defaults={{
        $element_offset: [0, 0],
    }}>
        {childrenArray}
    </CollectionPanel>
}

/**
 * A simple CollectionPanel wrapper that adds the children to the "form_buttons" collection and assigns them an index.
 */
export function FormIndexProvider(props: IndexProviderProps & { children?: Control | Control[] }) {
    return <IndexProvider {...props} collection_name="form_buttons" />
}

export function ChestIndexProvider(props: IndexProviderProps & { children?: Control | Control[] }) {
    return <IndexProvider {...props} collection_name="container_items" />
}