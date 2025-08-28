import {
    Button,
    createMinecraftElement,
    Custom,
    InputPanel,
    Label,
    Screen,
    Variable,
    Image,
    StackPanel
} from "../../mod.ts";

export interface HovertextProps {
    $hover_layer?: Variable<number>;
    $hover_text: Variable<string>;
}

/**
 * A simple hovertext renderer that allows for displaying localized text 
 */
export function Hovertext(_props: HovertextProps) {
    return (
        // <Button hover_control="hover">
        //     <Custom
        //         renderer="hover_text_renderer"
        //         allow_clipping={false}
        //         layer={"$hover_layer"}
        //         key="hover"
        //         defaults={{
        //             "$hover_layer": 200,
        //         }}
        //         property_bag={{
        //             "#hover_text": "$hover_text",
        //         }}
                
        //     />
        // </Button>
            
        <Button hover_control="hover" consume_hover_events={false} allow_clipping={false} >
            <Screen follows_cursor size={[0, 0]} key="hover" layer="$hover_layer" allow_clipping={false} defaults={{
                "$hover_layer": 0
            }}>
                <Image size={["100%sm + 6px", "100%sm + 6px"]} texture="textures/ui/purpleBorder" layer={0} anchors="left_middle" offset={[10, 0]} allow_clipping={false} />
                {/* <Label text="$hover_text" localize /> */}
                <StackPanel anchors="left_middle" size={["100%c", "100%c"]} offset={["13px", 0]} allow_clipping={false} >
                    <Label
                        text="$hover_text"
                        anchors="top_left"
                        allow_clipping={false} 
                    />
                </StackPanel>
            </Screen>
        </Button>
    );
}
