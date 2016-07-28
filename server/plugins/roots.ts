import { Server } from "hapi";
import * as Joi from "joi";

import { Root } from "../models/Root";
import { RootsController } from "../controllers/RootsController";

export interface Params {
    id?: string;
}

export interface Query {
    startsWith?: string;
}

export interface PreParams {
    roots?: Root[];
    serializedRoots?: any;
    root?: Root;
    serializedRoot?: any;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new RootsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        method: "GET",
        path: "/roots",
        config: {
            description: "Get all roots",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 1
                }
            },
            pre: [
                { method: controller.getRoots, assign: "roots" },
                { method: controller.getSerializedRoots, assign: "serializedRoots" }
            ],
            handler: controller.sendRoots
        }
    });

    server.route({
        method: "GET",
        path: "/roots/search",
        config: {
            description: "Search through roots",
            notes: "Returns matching roots beginning with the given characters",
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
                { method: controller.getMatchingRoots, assign: "roots" },
                { method: controller.getSerializedRoots, assign: "serializedRoots" }
            ],
            handler: controller.sendRoots
        }
    });

    server.route({
        method: "GET",
        path: "/roots/{id}",
        config: {
            description: "Get a root",
            notes: "Returns a root for the given id",
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
                        .description("the id for the root"),
                }
            },
            pre: [
                { method: controller.getRoot, assign: "root" },
                { method: controller.getSerializedRoot, assign: "serializedRoot" }
            ],
            handler: controller.sendRoot
        }
    });

    return next();
};

exports.register.attributes = {
    name: "roots"
};
