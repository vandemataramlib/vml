import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";

import { Controller } from "../common/interfaces";
import { Document, DocType } from "../models/Document";
import { Params, PreParams } from "../plugins/records";
import { getChapterSerializer } from "../serializers/documents";

export class RecordsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Document.collection);
    }

    getRecord = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.findOne({ url: request.url.path }));
    }

    getSerializedRecord = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        const recordSerializer = getChapterSerializer("records", Document.recordURL(params.slug, params.subdocId, params.recordId));

        return reply(recordSerializer.serialize(preParams.record));
    }

    sendRecord = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serialisedRecord);
    }
}
