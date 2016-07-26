import { Server } from "hapi";
import * as Joi from "joi";

import { PrefixesController } from "../controllers/PrefixesController";
import { Prefix } from "../models/Prefix";

export interface Params {
    id?: string;
}

export interface Query {
    startsWith?: string;
}

export interface PreParams {
    prefixes?: Prefix[];
    prefix?: Prefix;
    serializedPrefixes?: any;
    serializedPrefix?: any;
    newPrefix?: Prefix;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new PrefixesController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        method: "GET",
        path: "/prefixes",
        config: {
            description: "Get all prefixes",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 1
                }
            },
            pre: [
                { method: controller.getPrefixes, assign: "prefixes" },
                { method: controller.getSerializedPrefixes, assign: "serializedPrefixes" }
            ],
            handler: controller.sendPrefixes
        }
    });

    server.route({
        method: "POST",
        path: "/prefixes",
        config: {
            description: "Create prefix",
            notes: "Returns the newly created prefix",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 1
                }
            },
            validate: {
                payload: {
                    data: Joi.object().required().keys({
                        type: Joi.string().required().default("prefixes"),
                        attributes: Joi.object().required().keys({
                            prefix: Joi.string().required().description("the prefix"),
                            senses: Joi.array().required().description("senses for controller prefix")
                        })
                    })
                }
            },
            pre: [
                { method: controller.getPrefixPayload, assign: "newPrefix" },
                { method: controller.createPrefix, assign: "prefix" },
                { method: controller.getSerializedPrefix, assign: "serializedPrefix" }
            ],
            handler: controller.sendNewPrefix
        }
    });

    server.route({
        method: "GET",
        path: "/prefixes/{id}",
        config: {
            description: "Get a prefix",
            tags: ["api"],
            notes: "Returns a prefix for the given id",
            plugins: {
                "hapi-swagger": {
                    order: 2
                }
            },
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description("the id for the prefix"),
                }
            },
            pre: [
                { method: controller.getPrefix, assign: "prefix" },
                { method: controller.getSerializedPrefix, assign: "serializedPrefix" }
            ],
            handler: controller.sendPrefix
        }
    });

    server.route({
        method: "DELETE",
        path: "/prefixes/{id}",
        config: {
            description: "Delete a prefix",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 2
                }
            },
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description("the id for the prefix"),
                }
            },
            handler: controller.deletePrefix
        }
    });

    server.route({
        method: "PATCH",
        path: "/prefixes/{id}",
        config: {
            description: "Update a prefix",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 2
                }
            },
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description("the id for the prefix"),
                },
                payload: {
                    data: Joi.object().required().keys({
                        type: Joi.string().required().default("prefixes"),
                        id: Joi.string().required().default("id"),
                        attributes: Joi.object().required().keys({
                            prefix: Joi.string().description("the prefix"),
                            senses: Joi.array().description("senses for controller prefix")
                        })
                    })
                }
            },
            pre: [
                { method: controller.patchPrefix, assign: "prefix" },
                { method: controller.getSerializedPrefix, assign: "serializedPrefix" }
            ],
            handler: controller.sendPrefix
        }
    });

    server.route({
        method: "GET",
        path: "/prefixes/search",
        config: {
            description: "Search through roots",
            notes: "Returns matching prefixes beginning with the given characters",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 3
                }
            },
            validate: {
                query: {
                    startsWith: Joi.string()
                        .required()
                        .description("the root to search"),
                }
            },
            pre: [
                { method: controller.getPrefixes, assign: "prefixes" },
                { method: controller.getMatchingPrefixes, assign: "prefixes" },
                { method: controller.getSerializedPrefixes, assign: "serializedPrefixes" }
            ],
            handler: controller.sendPrefixes
        }
    });

    return next();
};

exports.register.attributes = {
    name: "prefixes"
};
