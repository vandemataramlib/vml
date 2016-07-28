import { Request, IReply } from "hapi";
import { Db, ObjectID, Collection } from "mongodb";

import { Controller } from "../common/interfaces";
import { Root } from "../models/Root";
import { Params, Query, PreParams } from "../plugins/roots";
import { getRootSerializer } from "../serializers/roots";
import { API_SERVER_BASE_URL } from "../common/constants";

export class RootsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Root.collection);
    }

    getRoots = (request: Request, reply: IReply) => {

        this.dbCollection.find().toArray()
            .then(roots => reply(roots));
    }

    getSerializedRoots = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;
        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };
        const dataLinks = {
            self: (root: Root) => Root.URL(root._id)
        };

        return reply(getRootSerializer("roots", topLevelLinks, dataLinks).serialize(preParams.roots));
    }

    sendRoots = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedRoots);
    }

    getMatchingRoots = (request: Request, reply: IReply) => {

        const query: Query = request.query;

        this.dbCollection.find({ root: new RegExp(`^${query.startsWith}`) }).toArray()
            .then(roots => reply(roots));
    }

    getRoot = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        this.dbCollection.findOne({ _id: new ObjectID(params.id) })
            .then(roots => reply(roots));
    }

    getSerializedRoot = (request: Request, reply: IReply) => {

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

    sendRoot = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedRoot);
    }
}
