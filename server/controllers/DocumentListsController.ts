import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";

import { Controller } from "../common/interfaces";
import { DocumentListGroup, IDocumentListGroup } from "../models/DocumentList";
import { PreParams } from "../plugins/documentList";
import { API_SERVER_BASE_URL } from "../common/constants";
import { getDocumentListSerializer } from "../serializers/documentList";

export class DocumentListsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(DocumentListGroup.collection);
    };

    getDocList = (request: Request, reply: IReply) => {

        this.dbCollection.find().toArray()
            .then(docLists => reply(docLists));
    }

    getSerialisedDocList = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (documentListGroup: IDocumentListGroup) => DocumentListGroup.URL(documentListGroup._id)
        };

        const serializer = getDocumentListSerializer("documentListGroup", topLevelLinks, dataLinks);

        reply(serializer.serialize(preParams.docList));
    }

    sendDocList = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serialisedDocList);
    }
}
