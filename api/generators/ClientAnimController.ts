import { GeneratorBase, GeneratorFactory } from "../GeneratorBase.ts";
import { randomId } from "../Utils.ts";
import { createFile } from "../mod.ts";

type MolangExpression = string;

interface ClientAnimationControllerState {
    transitions?: { [stateAlias: string]: MolangExpression }[];
    animations?: string[];
}

export class ClientAnimationController extends GeneratorBase<ClientAnimationController> {
    data: Record<string, unknown>;
    projectNamespace: string;
    id: string;

    constructor(projectNamespace: string, id: string) {
        super();

        this.projectNamespace = projectNamespace;
        this.id = id;

        this.data = {
            "states": {}
        }
    }

    setInitialState(state: string): this {
        this.setValueAtPath("initial_state", state);
        return this;
    }

    addState(name: string, options: ClientAnimationControllerState): this {
        this.setValueAtPath(`states/${name}`, options);
        return this;
    }
}

export class ClientAnimationControllerGenerator extends GeneratorFactory<ClientAnimationController> {
    fileName: string;

    constructor(projectNamespace: string, fileName: string) {
        super(projectNamespace, "RP/animation_controllers");
        this.fileName = fileName;
    }

    makeController(id: string): ClientAnimationController {
        const def = new ClientAnimationController(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }

    public generate(): void {
        const data = {
            "format_version": "1.10.0",
            "animation_controllers": {}
        };

        for (const [id, def] of this.filesToGenerate) {
            data.animation_controllers[`controller.animation.${def.projectNamespace}.${def.id}`] = def.toJson();
        }

        createFile(JSON.stringify(data, null, 2), `${this.exportFolder}/${this.fileName}.controller.json`);
    }
}