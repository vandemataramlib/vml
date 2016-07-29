import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";

import { Controller } from "../common/interfaces";
import { Document, DocType } from "../models/Document";
import { Params, PreParams } from "../plugins/subdocuments";
import { getChapterSerializer } from "../serializers/documents";

export class SubdocumentsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Document.collection);
    }

    getSubdocument = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.findOne({ url: request.url.path }));
    }

    getSerializedSubdocument = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.subdocument) {
            if (preParams.subdocument.docType === DocType.Chapter) {
                documentSerializer = getChapterSerializer("subdocuments", Document.subdocumentURL(params.slug, params.subdocId));
            }
        }
        else {
            documentSerializer = getChapterSerializer("subdocuments", Document.subdocumentURL(params.slug, params.subdocId));
        }

        return reply(documentSerializer.serialize(preParams.subdocument));
    }

    sendSubdocument = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedSubdocument);
    }
}
