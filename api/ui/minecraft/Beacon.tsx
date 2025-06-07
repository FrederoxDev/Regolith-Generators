import { CustomProps, GetRef } from "../../mod.ts";

export class Beacon {
    public static ItemRenderer = GetRef<CustomProps>("beacon", "item_renderer");
}