import { Server } from "hapi";
import * as Joi from "joi";

import { SuffixesController } from "../controllers/SuffixesController";
import { ISuffix } from "../models/Suffix";

export interface Params {
    id?: string;
}

export interface Query {
    startsWith?: string;
}

export interface PreParams {
    suffixes?: ISuffix[];
    suffix?: ISuffix;
    serializedSuffixes?: any;
    serializedSuffix?: any;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new SuffixesController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        method: "GET",
        path: "/suffixes",
        config: {
            description: "Get all suffixes",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 1
                }
            },
            pre: [
                { method: controller.getSuffixes, assign: "suffixes" },
                { method: controller.getSerializedSuffixes, assign: "serializedSuffixes" }
            ],
            handler: controller.sendSuffixes
        }
    });

    server.route({
        method: "GET",
        path: "/suffixes/{id}",
        config: {
            description: "Get a suffix",
            notes: "Returns a suffix for the given id",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 2
                }
            },
            validate: {
                params: {
                    id: Joi.string().required()
                        .description("the id for the suffix")
                }
            },
            pre: [
                {
                    method: controller.getSuffix,
                    assign: "suffix"
                },
                {
                    method: controller.getSerializedSuffix,
                    assign: "serializedSuffix"
                }
            ],
            handler: controller.sendSuffix
        }
    });

    server.route({
        method: "GET",
        path: "/suffixes/search",
        config: {
            description: "Search for a suffix",
            notes: "Returns all suffixes matching given criterion",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 3
                }
            },
            validate: {
                query: {
                    startsWith: Joi.string().required()
                        .description("the first few characters of the suffix")
                }
            },
            pre: [
                {
                    method: controller.searchSuffixes,
                    assign: "suffixes"
                },
                {
                    method: controller.getSerializedSuffixes,
                    assign: "serializedSuffixes"
                }
            ],
            handler: controller.sendSuffixes
        }
    });

    return next();
};

exports.register.attributes = {
    name: "suffixes"
};
