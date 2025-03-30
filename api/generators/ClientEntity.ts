import { GeneratorFactory, GeneratorBase } from "../GeneratorBase.ts";

export class ClientEntityGenerator extends GeneratorFactory<ClientEntityDef> {
    constructor(projectNamespace: string) {
        super(projectNamespace, "RP/entity");
    }

    makeEntity(id: string): ClientEntityDef {
        const def = new ClientEntityDef(this.projectNamespace, id);
        this.filesToGenerate.set(id, def);
        return def;
    }
}

export enum EntityMaterials {
    Entity = "entity",
    EntityAlphablend = "entity_alphablend",
    EntityAlphablendNoColorEntityStatic = "entity_alphablend_no_color_entity_static",
    EntityAlphatest = "entity_alphatest",
    EntityAlphatestChangeColor = "entity_alphatest_change_color",
    EntityAlphatestChangeColorGlint = "entity_alphatest_change_color_glint",
    EntityAlphatestGlint = "entity_alphatest_glint",
    EntityAlphatestGlintItem = "entity_alphatest_glint_item",
    EntityAlphatestMulticolorTint = "entity_alphatest_multicolor_tint",
    EntityBeam = "entity_beam",
    EntityBeamAdditive = "entity_beam_additive",
    EntityChangeColor = "entity_change_color",
    EntityChangeColorGlint = "entity_change_color_glint",
    EntityCustom = "entity_custom",
    EntityDissolveLayer0 = "entity_dissolve_layer_0",
    EntityDissolveLayer1 = "entity_dissolve_layer_1",
    EntityEmissive = "entity_emissive",
    EntityEmissiveAlpha = "entity_emissive_alpha",
    EntityEmissiveAlphaOneSided = "entity_emissive_alpha_one_sided",
    EntityFlatColorLine = "entity_flat_color_line",
    EntityGlint = "entity_glint",
    EntityLeadBase = "entity_lead_base",
    EntityLoyaltyRope = "entity_loyalty_rope",
    EntityMultitexture = "entity_multitexture",
    EntityMultitextureAlphaTest = "entity_multitexture_alpha_test",
    EntityMultitextureAlphaTestColorMask = "entity_multitexture_alpha_test_color_mask",
    EntityMultitextureColorMask = "entity_multitexture_color_mask",
    EntityMultitextureMasked = "entity_multitexture_masked",
    EntityMultitextureMultiplicativeBlend = "entity_multitexture_multiplicative_blend"
}

export class ClientEntityDef extends GeneratorBase<ClientEntityDef> {
    data: Record<string, unknown>;
    
    constructor(projectNamespace: string, id: string) {
        super();

        this.data = {
            "format_version": "1.21.70",
            "minecraft:client_entity": {
                "description": {
                    "identifier": `${projectNamespace}:${id}`
                }
            }   
        }
    }

    addGeometry(geometryID: string, as = "default"): this {
        this.setValueAtPath("minecraft:client_entity/description/geometry", {
            [as]: geometryID
        });
        return this;
    }

    addTexture(texturePath: string, as = "default"): this {
        this.setValueAtPath("minecraft:client_entity/description/textures", {
            [as]: texturePath
        });
        return this;
    }

    addMaterial(material: EntityMaterials | string, as = "default"): this {
        this.setValueAtPath("minecraft:client_entity/description/materials", {
            [as]: material
        });
        return this;
    }

    addDefaultRenderController(): this {
        const controllers = this.getValueAtPath<string[]>("minecraft:client_entity/description/render_controllers", []);
        controllers.push("controller.render.default");
        this.setValueAtPath("minecraft:client_entity/description/render_controllers", controllers);
        return this;
    }
}