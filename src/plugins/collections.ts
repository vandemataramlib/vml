import { Server } from "hapi";
import * as Joi from "joi";
import { Models } from "vml-common";

import { CollectionsController } from "../controllers/CollectionsController";

export interface Params {
    id?: string;
}

export interface Query { }

export interface PreParams {
    collection?: Models.Collection;
    serializedCollection?: any;
    deserializedPayload?: Models.Collection;
    collections?: Models.Collection[];
    serializedCollections?: any;
    deserializedStanzaPayload?: Models.CollectionStanza[];
}

interface Internals {
    collectionPayloadSchema: any;
    stanzaPayloadSchema: any;
}

let internals = <Internals>{};

internals.collectionPayloadSchema = {
    data: Joi.object().required().keys({
        type: Joi.string().required().valid("collections"),
        id: Joi.string(),
        attributes: Joi.object().required().keys({
            title: Joi.string().required(),
            description: Joi.string().allow(null),
            segments: Joi.array().required().items(
                Joi.object().keys({
                    id: Joi.number().required(),
                    stanzas: Joi.array().required().items(
                        Joi.object().keys({
                            id: Joi.number().required(),
                            lines: Joi.array().required(),
                            originalUrl: Joi.string().required(),
                            runningId: Joi.string(),
                            referenceTitle: Joi.string().required()
                        })
                    )
                })
            )
        })
    }),
    links: Joi.object()
};

internals.stanzaPayloadSchema = {
    data: Joi.array().required().items(
        Joi.object().required().keys({
            type: Joi.string().required().valid("collectionStanzas"),
            id: Joi.number().required().default("id"),
            attributes: Joi.object().required().keys({
                lines: Joi.array().required().description("the lines comprising the stanza").items(
                    Joi.object().keys({
                        line: Joi.string()
                    }).options({ allowUnknown: true })
                ),
                originalUrl: Joi.string().required(),
                referenceTitle: Joi.string().required(),
                runningId: Joi.string(),
                segmentId: Joi.number().required()
            }).options({ allowUnknown: true })
        })
    ),
    links: Joi.object()
};

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new CollectionsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        method: "GET",
        path: "/collections",
        config: {
            description: "Get a list of all collections",
            tags: ["api"],
            pre: [
                {
                    method: controller.getCollections,
                    assign: "collections"
                },
                {
                    method: controller.getSerializedCollections,
                    assign: "serializedCollections"
                }
            ],
            handler: controller.replyWithCollections
        }
    });

    server.route({
        method: "GET",
        path: "/collections/{id}",
        config: {
            description: "Get a collection",
            notes: "Returns a collection with the given id",
            tags: ["api"],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description("the id for the collection")
                }
            },
            pre: [
                {
                    method: controller.getCollection,
                    assign: "collection"
                },
                {
                    method: controller.getSerializedCollection,
                    assign: "serializedCollection"
                }
            ],
            handler: controller.replyWithCollection
        }
    });

    server.route({
        method: "POST",
        path: "/collections",
        config: {
            description: "Create a collection",
            notes: "Returns the newly created collection",
            tags: ["api"],
            validate: {
                payload: internals.collectionPayloadSchema
            },
            pre: [
                {
                    method: controller.deserializePayload,
                    assign: "deserializedPayload"
                },
                {
                    method: controller.createCollection,
                    assign: "collection"
                },
                {
                    method: controller.getSerializedCollection,
                    assign: "serializedCollection"
                }
            ],
            handler: controller.replyWithNewCollection
        }
    });

    server.route({
        method: "PATCH",
        path: "/collections/{id}",
        config: {
            description: "Update a collection with the given id",
            notes: "Accepts the new entries and returns the updated collection",
            tags: ["api"],
            validate: {
                payload: internals.stanzaPayloadSchema,
                params: {
                    id: Joi.string().required()
                        .description("the id of the collection to be updated")
                }
            },
            pre: [
                {
                    method: controller.deserializeStanzaPayload,
                    assign: "deserializedStanzaPayload"
                },
                {
                    method: controller.patchCollection,
                    assign: "collection"
                },
                {
                    method: controller.getSerializedCollection,
                    assign: "serializedCollection"
                }
            ],
            handler: controller.replyWithCollection
        }
    });

    return next();
};

exports.register.attributes = {
    name: "collections"
};
