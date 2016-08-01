import { Request, IReply } from "hapi";
import { Db, Collection, ObjectID } from "mongodb";
import { Deserializer } from "jsonapi-serializer";
import { Constants, Models } from "vml-common";

import { Controller } from "../common/interfaces";
import { getPrefixSerializer } from "../serializers/prefixes";
import { Params, Query, PreParams } from "../plugins/prefixes";

export class PrefixesController implements Controller {
    private dbCollection: Collection;
    private deserializer: Deserializer;

    constructor() {

        this.deserializer = new Deserializer({ keyForAttribute: "camelCase" });
    }

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Prefix.collection);
    }

    getPrefixes = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.find().toArray());
    }

    getSerializedPrefixes = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => Constants.API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (prefix: Models.Prefix) => Models.Prefix.URL(prefix._id)
        };

        const serializer = getPrefixSerializer("prefixes", topLevelLinks, dataLinks);

        return reply(serializer.serialize(preParams.prefixes));
    }

    sendPrefixes = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefixes);
    }

    getPrefix = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        return reply(this.dbCollection.findOne({ _id: new ObjectID(params.id) }));
    }

    getSerializedPrefix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => Constants.API_SERVER_BASE_URL + request.url.path
        };

        const serializer = getPrefixSerializer("prefixes", topLevelLinks);

        return reply(serializer.serialize(preParams.prefix));
    }

    sendPrefix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefix);
    }

    getMatchingPrefixes = (request: Request, reply: IReply) => {

        const query: Query = request.query;

        return reply(this.dbCollection.find({ prefix: new RegExp(`^${query.startsWith}`) }).toArray());
    }

    getPrefixPayload = (request: Request, reply: IReply) => {

        return reply(this.deserializer.deserialize(request.payload));
    }

    createPrefix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        this.dbCollection.insertOne(preParams.newPrefix)
            .then(response => reply(response.ops[0]));
    }

    sendNewPrefix = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedPrefix).created(Models.Prefix.URL(preParams.serializedPrefix.data.id));
    }

    deletePrefix = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        this.dbCollection.findOneAndDelete({ _id: new ObjectID(params.id) })
            .then(response => reply({}));
    }

    patchPrefix = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        this.deserializer.deserialize(request.payload)
            .then(updatedPrefix => {

                const prefix = new Models.Prefix(updatedPrefix);
                return this.dbCollection.findOneAndReplace({ _id: new ObjectID(params.id) }, prefix, { returnOriginal: false });
            })
            .then(response => reply(response.value));
    }
}
