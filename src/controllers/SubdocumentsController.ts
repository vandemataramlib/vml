import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";
import { Models, Serializers, Constants } from "vml-common";

import { Controller } from "../common/interfaces";
import { Params, PreParams } from "../plugins/subdocuments";

export class SubdocumentsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Document.collection);
    }

    getSubdocument = (request: Request, reply: IReply) => {

        return reply(this.dbCollection.findOne({ url: request.url.path }));
    }

    getSerializedSubdocument = (request: Request, reply: IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.subdocument) {
            if (preParams.subdocument.docType === Models.DocType.Chapter) {
                const url = Constants.API_SERVER_BASE_URL + Models.Document.URL(params.slug, params.subdocId);
                documentSerializer = Serializers.getChapterSerializer("subdocuments", url);
            }
        }
        else {
            const url = Constants.API_SERVER_BASE_URL + Models.Document.URL(params.slug, params.subdocId);
            documentSerializer = Serializers.getChapterSerializer("subdocuments", url);
        }

        return reply(documentSerializer.serialize(preParams.subdocument));
    }

    sendSubdocument = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedSubdocument);
    }
}
