import { PanelControl } from "../api/mod.ts";

const basePanel = new PanelControl()
    .declareVariable("$base_var", false)
    .setIgnored("$base_var")

console.log(basePanel);