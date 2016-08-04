import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";
import { Models, Serializers } from "vml-common";

import { Controller } from "../common/interfaces";
import { Params, PreParams } from "../plugins/records";

export class RecordsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Document.collection);
    }

    getRecord = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.findOne({ url: request.url.path }));
    }

    getSerializedRecord = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        const recordSerializer = Serializers.getChapterSerializer("records", Models.Document.URL(params.slug, params.subdocId, params.recordId));

        return reply(recordSerializer.serialize(preParams.record));
    }

    sendRecord = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serialisedRecord);
    }
}
