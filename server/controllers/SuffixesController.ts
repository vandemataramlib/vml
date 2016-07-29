import { Request, IReply } from "hapi";
import { Db, Collection, ObjectID } from "mongodb";

import { Controller } from "../common/interfaces";
import { Suffix } from "../models/Suffix";
import { Params, Query, PreParams } from "../plugins/suffixes";
import { getSuffixSerializer } from "../serializers/suffixes";
import { API_SERVER_BASE_URL } from "../common/constants";

export class SuffixesController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Suffix.collection);
    };

    getSuffixes = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.find().toArray());
    }

    getSerializedSuffixes = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (suffix: Suffix) => Suffix.URL(suffix._id)
        };

        const serializer = getSuffixSerializer("suffixes", topLevelLinks, dataLinks);

        return reply(serializer.serialize(preParams.suffixes));
    }

    sendSuffixes = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedSuffixes);
    }

    getSuffix = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        return reply(this.dbCollection.find({ _id: new ObjectID(params.id) }).limit(1).next());
    }

    getMatchingSuffixes = (request: Request, reply: IReply) => {

        const query: Query = request.query;

        return reply(this.dbCollection.find({ suffix: new RegExp(`^${query.startsWith}`) }).toArray());
    }

    getSerializedSuffix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => API_SERVER_BASE_URL + request.url.path
        };

        const serializer = getSuffixSerializer("suffixes", topLevelLinks);

        return reply(serializer.serialize(preParams.suffix));
    }

    sendSuffix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedSuffix);
    }
}
