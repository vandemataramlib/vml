import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, ObjectID, Collection } from "mongodb";
import { Deserializer } from "jsonapi-serializer";

import { HapiPlugin } from "../common/interfaces";
import { getPrefixSerializer } from "../serializers/prefixes";
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
    newPrefix?: Prefix;
}

class Prefixes {
    dbCollection: Collection;

    static attributes = {
        name: "prefixes"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

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
                                senses: Joi.array().required().description("senses for this prefix")
                            })
                        })
                    }
                },
                pre: [
                    { method: this.getPrefixPayload, assign: "newPrefix" },
                    { method: this.createPrefix, assign: "prefix" },
                    { method: this.getSerializedPrefix, assign: "serializedPrefix" }
                ],
                handler: this.sendNewPrefix
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
                handler: this.deletePrefix
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
                                senses: Joi.array().description("senses for this prefix")
                            })
                        })
                    }
                },
                pre: [
                    { method: this.patchPrefix, assign: "prefix" },
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

        return next();
    }

    private setDbCollection = (server: Hapi.Server, next: Function) => {

        const db: Db = server.plugins["hapi-mongodb"].db;

        this.dbCollection = db.collection(Prefix.collection);

        return next();
    }

    private getPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        this.dbCollection.find().toArray()
            .then(prefixes => reply(prefixes));
    }

    private getSerializedPrefixes = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (prefix: Prefix) => Prefix.URL(prefix._id)
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

        this.dbCollection.findOne({ _id: new ObjectID(params.id) })
            .then(prefix => reply(prefix));
    }

    private getSerializedPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const serializer = getPrefixSerializer("prefixes");

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

    private getPrefixPayload = (request: Hapi.Request, reply: Hapi.IReply) => {

        reply(new Deserializer().deserialize(request.payload));
    }

    private createPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        this.dbCollection.insertOne(preParams.newPrefix)
            .then(response => reply(response.ops[0]));
    }

    private sendNewPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefix).created(Prefix.URL(preParams.serializedPrefix.data.id));
    }

    private deletePrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;

        this.dbCollection.findOneAndDelete({ _id: new ObjectID(params.id) })
            .then(response => reply({}));
    }

    private patchPrefix = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;

        new Deserializer().deserialize(request.payload)
            .then(updatedPrefix => {

                const prefix = new Prefix(updatedPrefix);
                return this.dbCollection.findOneAndReplace({ _id: new ObjectID(params.id) }, prefix, { returnOriginal: false });
            })
            .then(response => reply(response.value));
    }
}

export const register: HapiPlugin = Prefixes;
