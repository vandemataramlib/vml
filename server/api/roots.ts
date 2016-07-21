import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, ObjectID } from "mongodb";

import { HapiPlugin } from "../common/interfaces";
import { getRootSerializer } from "../serializers/roots";
import { Root } from "../models/Root";
import { API_SERVER_BASE_URL } from "../utils/constants";

interface Params {
    id?: string;
}

interface Query {
    startsWith?: string;
}

interface PreParams {
    roots?: Root[];
    serializedRoots?: any;
    root?: Root;
    serializedRoot?: any;
}


class Roots {
    options: any;

    static attributes = {
        name: "roots"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        this.options = options;

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
                    { method: this.getRoots, assign: "roots" },
                    { method: this.getSerializedRoots, assign: "serializedRoots" }
                ],
                handler: this.sendRoots
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
                    { method: this.getRoots, assign: "roots" },
                    { method: this.getMatchingRoots, assign: "roots" },
                    { method: this.getSerializedRoots, assign: "serializedRoots" }
                ],
                handler: this.sendRoots
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
                    { method: this.getRoot, assign: "root" },
                    { method: this.getSerializedRoot, assign: "serializedRoot" }
                ],
                handler: this.sendRoot
            }
        });

        next();
    }

    private getRoots = (request: Hapi.Request, reply: Hapi.IReply) => {

        const db: Db = request.server.plugins["hapi-mongodb"].db;

        db.collection(Root.collection).find().toArray()
            .then(roots => reply(roots));
    }

    private getSerializedRoots = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;
        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };
        const dataLinks = {
            self: (root: Root) => Root.URL(root._id)
        };

        return reply(getRootSerializer("roots", topLevelLinks, dataLinks).serialize(preParams.roots));
    }

    private sendRoots = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedRoots);
    }

    private getMatchingRoots = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;
        const query: Query = request.query;

        return reply(preParams.roots.filter(root => root.root.startsWith(query.startsWith)));
    }

    private getRoot = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;

        const db: Db = request.server.plugins["hapi-mongodb"].db;

        db.collection(Root.collection).findOne({ _id: new ObjectID(params.id) })
            .then(roots => reply(roots));
    }

    private getSerializedRoot = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const root = preParams.root;

        let topLevelLinks: any;

        if (root) {
            topLevelLinks = {};
            topLevelLinks.self = Root.URL(root._id);
        }

        const rootSerializer = getRootSerializer("root", topLevelLinks);

        return reply(rootSerializer.serialize(preParams.root));
    }

    private sendRoot = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedRoot);
    }
}

export const register: HapiPlugin = Roots;
