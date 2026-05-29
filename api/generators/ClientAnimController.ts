import { GeneratorFactory } from "../GeneratorBase.ts";
import { createFile } from "../FileIO.ts";
import { AnimationControllerBase } from "./AnimationController.ts";
import { type AnimationControllerStateData } from "./AnimationControllerTypes.ts";

type MolangExpression = string;

interface ClientAnimationControllerState extends AnimationControllerStateData {
    transitions?: { [stateAlias: string]: MolangExpression }[];
    animations?: string[];
}

/**
 * Backwards-compatible client animation controller builder.
 *
 * This class keeps the original constructor and public fields while inheriting
 * the complete animation controller helper API from `AnimationControllerDef`.
 *
 * @see https://learn.microsoft.com/minecraft/creator/reference/content/visualreference/actor_animation_controller.v1.10.0
 */
export class ClientAnimationController extends AnimationControllerBase<ClientAnimationController> {
    projectNamespace: string;
    id: string;

    /**
     * Creates a controller with identifier
     * `controller.animation.<projectNamespace>.<id>`.
     */
    constructor(projectNamespace: string, id: string) {
        super(`controller.animation.${projectNamespace}.${id}`);

        this.projectNamespace = projectNamespace;
        this.id = id;
    }

    /**
     * Adds or replaces one state.
     */
    override addState(name: string, options: ClientAnimationControllerState): this {
        return super.addState(name, options);
    }
}

/**
 * Backwards-compatible generator for client animation controller documents.
 *
 * Generated files are written under `RP/animation_controllers` as
 * `{fileName}.controller.json`, matching the previous API.
 */
export class ClientAnimationControllerGenerator extends GeneratorFactory<ClientAnimationController> {
    fileName: string;

    /**
     * Creates a client animation controller generator.
     */
    constructor(projectNamespace: string, fileName: string) {
        super(projectNamespace, "RP/animation_controllers");
        this.fileName = fileName;
    }

    /**
     * Queues a controller with id
     * `controller.animation.<projectNamespace>.<id>`.
     */
    makeController(id: string): ClientAnimationController {
        const def = new ClientAnimationController(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }

    /**
     * Writes queued client animation controllers.
     */
    public override generate(): void {
        const data: {
            "format_version": string;
            "animation_controllers": Record<string, unknown>;
        } = {
            "format_version": "1.10.0",
            "animation_controllers": {}
        };

        for (const def of this.filesToGenerate.values()) {
            data.animation_controllers[def.identifier] = def.toJson();
        }

        createFile(JSON.stringify(data, null, 2), `${this.exportFolder}/${this.fileName}.controller.json`);
    }
}
