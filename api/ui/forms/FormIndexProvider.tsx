import { CollectionPanel, CollectionProps, Control, Size2D, StackPanelProps, Variable, createMinecraftElement } from "../../mod.ts";

export interface FormIndexProviderProps extends CollectionProps {
    $index?: Variable<number>;
    $element_offset?: Size2D;
}

/**
 * A simple CollectionPanel wrapper that adds the children to the "form_buttons" collection and assigns them an index.
 */
export function FormIndexProvider(props: FormIndexProviderProps & { children?: Control | Control[] }) {
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

    return <CollectionPanel collection_name="form_buttons" defaults={{
        $element_offset: [0, 0],
    }}>
        {childrenArray}
    </CollectionPanel>
}