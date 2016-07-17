import * as Hapi from "hapi";
import * as Joi from "joi";
import { Serializer } from "jsonapi-serializer";

import { HapiPlugin } from "../common/interfaces";
import { getPrefixSerializer } from "../serializers/prefixes";
import { prefixes } from "../documents/prefixes";
import { Prefix } from "../models/Prefix";
import { API_SERVER_BASE_URL } from "../utils/constants";

interface Params {
    id?: string;
}

interface Query {
    startsWith?: string;
}

interface PreParams {
    prefixes?: Prefix[];
    prefix?: Prefix;
    serializedPrefixes?: any;
    serializedPrefix?: any;
}

class Prefixes {
    options: any;

    static attributes = {
        name: "prefixes"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        this.options = options;

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
                    { method: this.getPrefixes, assign: "prefixes" },
                    { method: this.getSerializedPrefixes, assign: "serializedPrefixes" }
                ],
                handler: this.sendPrefixes
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
                    { method: this.getPrefix, assign: "prefix" },
                    { method: this.getSerializedPrefix, assign: "serializedPrefix" }
                ],
                handler: this.sendPrefix
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
                    { method: this.getPrefixes, assign: "prefixes" },
                    { method: this.getMatchingPrefixes, assign: "prefixes" },
                    { method: this.getSerializedPrefixes, assign: "serializedPrefixes" }
                ],
                handler: this.sendPrefixes
            }
        });

        next();
    }

    private getPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        return reply(prefixes);
    }

    private getSerializedPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (prefix: Prefix) => Prefix.URL(prefix.id)
        };

        const serializer = getPrefixSerializer("prefixes", topLevelLinks, dataLinks);

        return reply(serializer.serialize(preParams.prefixes));
    }

    private sendPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefixes);
    }

    private getPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;

        return reply(prefixes.find(prefix => prefix.id === params.id));
    }

    private getSerializedPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const serializer = getPrefixSerializer("prefixes", topLevelLinks);

        return reply(serializer.serialize(preParams.prefix));
    }

    private sendPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefix);
    }

    private getMatchingPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;
        const query: Query = request.query;

        return reply(preParams.prefixes.filter(prefix => prefix.prefix.startsWith(query.startsWith)));
    }
}

export const register: HapiPlugin = Prefixes;
