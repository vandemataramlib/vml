import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";

import { Controller } from "../common/interfaces";
import { IDocument, Document, DocType } from "../models/Document";
import { getChapterSerializer } from "../serializers/documents";
import { Params, PreParams } from "../plugins/documents";

export class DocumentsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Document.collection);
    }

    getDocument = (request: Request, reply: IReply) => {

        this.dbCollection.find({ url: request.url.path }).limit(1).next()
            .then(record => reply(record));
    }

    getSerializedDocument = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.document.docType === DocType.Chapter) {
            documentSerializer = getChapterSerializer("documents", Document.documentURL(params.slug));
        }

        return reply(documentSerializer.serialize(preParams.document));
    }

    sendDocument = (request: Request, reply: IReply) => {

        return reply((<PreParams>request.pre).serializedDocument);
    }
}
