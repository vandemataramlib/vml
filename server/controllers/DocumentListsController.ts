import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";
import { Models, Constants, Serializers } from "vml-common";

import { Controller } from "../common/interfaces";
import { PreParams } from "../plugins/documentList";

export class DocumentListsController implements Controller {
    private dbCollection: Collection;

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.DocumentListGroup.collection);
    };

    getDocList = (request: Request, reply: IReply) => {

        this.dbCollection.find().toArray()
            .then(docLists => reply(docLists));
    }

    getSerialisedDocList = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: Constants.API_SERVER_BASE_URL + request.url.path
        };

        const dataLinks = {
            self: (documentListGroup: Models.IDocumentListGroup) => Models.DocumentListGroup.URL(documentListGroup._id)
        };

        const serializer = Serializers.getDocumentListSerializer("documentListGroup", topLevelLinks, dataLinks);

        reply(serializer.serialize(preParams.docList));
    }

    sendDocList = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serialisedDocList);
    }
}
