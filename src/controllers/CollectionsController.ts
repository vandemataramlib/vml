import { Request, IReply } from "hapi";
import { Db, Collection, ObjectID } from "mongodb";
import { Deserializer } from "jsonapi-serializer";
import { Models, Serializers, Constants } from "vml-common";

import { Controller } from "../common/interfaces";
import { Params, Query, PreParams } from "../plugins/collections";

export class CollectionsController implements Controller {
    private dbCollection: Collection;
    private deserializer: Deserializer;

    constructor() {

        this.deserializer = new Deserializer({ keyForAttribute: "camelCase" });
    }

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Collection.collection);
    };

    getCollection = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        return reply(this.dbCollection.find({ _id: new ObjectID(params.id) }).limit(1).next());
    }

    getSerializedCollection = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        let topLevelLinks: any = null;

        if (preParams.collection) {
            topLevelLinks = {
                self: Constants.API_SERVER_BASE_URL + Models.Collection.URL(preParams.collection._id)
            };
        }

        const collectionSerializer = Serializers.getCollectionSerializer("collections", topLevelLinks);

        return reply(collectionSerializer.serialize(preParams.collection));
    }

    replyWithCollection = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedCollection);
    }

    deserializePayload = (request: Request, reply: IReply) => {

        return reply(this.deserializer.deserialize(request.payload));
    }

    createCollection = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const collection = preParams.deserializedPayload;

        delete (<any>collection).id;

        this.dbCollection.insertOne(preParams.deserializedPayload)
            .then(response => {

                return reply(response.ops[0]);
            });
    }

    replyWithNewCollection = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedCollection);
    }

    getCollections = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.find().toArray());
    }

    getSerializedCollections = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: () => Constants.API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (collection: Models.Collection) => Constants.API_SERVER_BASE_URL + Models.Collection.URL(collection._id)
        };

        const serializer = Serializers.getCollectionSerializer("collections", topLevelLinks, dataLinks);

        return reply(serializer.serialize(preParams.collections));
    }

    replyWithCollections = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedCollections);
    }

    deserializeStanzaPayload = (request: Request, reply: IReply) => {

        return reply(this.deserializer.deserialize(request.payload));
    }

    patchCollection = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;
        const params: Params = request.params;

        const segmentId = preParams.deserializedStanzaPayload[0].segmentId;

        const segmentKey = `segments.${segmentId}.stanzas`;

        const update = {
            $push: {
                [segmentKey]: {
                    $each: preParams.deserializedStanzaPayload
                }
            }
        };

        return reply(this.dbCollection.findOneAndUpdate(
            { _id: new ObjectID(params.id) }, update, { returnOriginal: false }).then(response => response.value)
        );
    }
}
