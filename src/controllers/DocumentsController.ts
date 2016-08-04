import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";
import { Models, Serializers } from "vml-common";

import { Controller } from "../common/interfaces";
import { Params, PreParams } from "../plugins/documents";

export class DocumentsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Document.collection);
    }

    getDocument = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.find({ url: request.url.path }).limit(1).next());
    }

    getSerializedDocument = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.document) {
            if (preParams.document.docType === Models.DocType.Chapter) {
                documentSerializer = Serializers.getChapterSerializer("documents", Models.Document.URL(params.slug));
            }
        }
        else {
            documentSerializer = Serializers.getChapterSerializer("documents", Models.Document.URL(params.slug));
        }

        return reply(documentSerializer.serialize(preParams.document));
    }

    sendDocument = (request: Request, reply: IReply) => {

        return reply((<PreParams>request.pre).serializedDocument);
    }
}
