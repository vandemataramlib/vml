import { Server } from "hapi";
import * as Joi from "joi";

import { Document, Stanza } from "../models/Document";
import { StanzaController } from "../controllers/StanzasController";

export interface Params {
    slug?: string;
    subdocId?: string;
    recordId?: string;
    stanzaId?: string;
}

export interface PreParams {
    document?: Document;
    stanza?: Stanza;
    serializedStanza?: any;
    deserializedPayload?: Stanza;
}

interface Internals {
    stanzaPayloadSchema: any;
}

let internals = <Internals>{};

internals.stanzaPayloadSchema = {
    data: Joi.object().required().keys({
        type: Joi.string().required().default("stanzas"),
        id: Joi.string().required().default("id"),
        attributes: Joi.object().required().keys({
            lines: Joi.array().required().description("the lines comprising the stanza").items(
                Joi.object().keys({
                    line: Joi.string(),
                    words: Joi.array().items(
                        Joi.object().keys({
                            word: Joi.string(),
                            analysis: Joi.alternatives().try(Joi.array().items(
                                Joi.object().keys({
                                    token: Joi.string()
                                })
                            ), null)
                        }).options({ allowUnknown: true })
                    )
                }).options({ allowUnknown: true })
            ),
            analysis: Joi.alternatives().try(Joi.array().description("the stanza's analysis"), null)
        }).options({ allowUnknown: true })
    })
};

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new StanzaController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        path: "/docs/{slug}/subdocs/{subdocId}/records/{recordId}/stanzas/{stanzaId}",
        method: "GET",
        config: {
            description: "Get a stanza from a record",
            notes: "Returns a stanza by the document slug, subdocId, recordId and stanzaId passed in the path",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 6
                }
            },
            validate: {
                params: {
                    slug: Joi.string()
                        .required()
                        .description("the slug for the document"),
                    subdocId: Joi.string()
                        .required()
                        .description("the id for the subdocument"),
                    recordId: Joi.string()
                        .required()
                        .description("the id for the record"),
                    stanzaId: Joi.string()
                        .required()
                        .description("the id of the stanza")
                }
            },
            pre: [
                {
                    method: controller.getStanza,
                    assign: "stanza"
                },
                {
                    method: controller.getSerializedStanza,
                    assign: "serializedStanza"
                }
            ],
            handler: controller.replyWithStanza
        }
    });

    server.route({
        path: "/docs/{slug}/stanzas/{stanzaId}",
        method: "GET",
        config: {
            description: "Get a stanza from a document",
            notes: "Returns a stanza by the document slug and stanzaId passed in the path",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 4
                }
            },
            validate: {
                params: {
                    slug: Joi.string()
                        .required()
                        .description("the slug for the document"),
                    stanzaId: Joi.string()
                        .required()
                        .description("the id of the stanza")
                }
            },
            pre: [
                {
                    method: controller.getStanza,
                    assign: "stanza"
                },
                {
                    method: controller.getSerializedStanza,
                    assign: "serializedStanza"
                }
            ],
            handler: controller.replyWithStanza
        }
    });

    server.route({
        path: "/docs/{slug}/stanzas/{stanzaId}",
        method: "PATCH",
        config: {
            description: "Update a stanza in a document",
            notes: "Returns the updated stanza",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 4
                }
            },
            validate: {
                params: {
                    slug: Joi.string()
                        .required()
                        .description("the slug for the document"),
                    stanzaId: Joi.string()
                        .required()
                        .description("the id of the stanza")
                },
                payload: internals.stanzaPayloadSchema
            },
            pre: [
                {
                    method: controller.deserializePayload,
                    assign: "deserializedPayload"
                },
                {
                    method: controller.patchStanza,
                    assign: "patchedDocument"
                },
                {
                    method: controller.getStanza,
                    assign: "stanza"
                },
                {
                    method: controller.getSerializedStanza,
                    assign: "serializedStanza"
                }
            ],
            handler: controller.replyWithStanza
        }
    });

    server.route({
        path: "/docs/{slug}/subdocs/{subdocId}/stanzas/{stanzaId}",
        method: "GET",
        config: {
            description: "Get a stanza from a subdocument",
            notes: "Returns a stanza by the document slug, subdocId and stanzaId passed in the path",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 5
                }
            },
            validate: {
                params: {
                    slug: Joi.string()
                        .required()
                        .description("the slug for the document"),
                    subdocId: Joi.string()
                        .required()
                        .description("the id for the subdocument"),
                    stanzaId: Joi.string()
                        .required()
                        .description("the id of the stanza")
                }
            },
            pre: [
                {
                    method: controller.getStanza,
                    assign: "stanza"
                },
                {
                    method: controller.getSerializedStanza,
                    assign: "serializedStanza"
                }
            ],
            handler: controller.replyWithStanza
        }
    });

    return next();
};

exports.register.attributes = {
    name: "stanzas"
};