import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, Collection } from "mongodb";

import { getDocumentListSerializer } from "../serializers/documentList";
import { API_SERVER_BASE_URL } from "../utils/constants";
import { IDocumentListGroup, DocumentListGroup } from "../models/DocumentList";

interface PreParams {
    docList?: IDocumentListGroup[];
    serialisedDocList?: any;
}

class DocumentList {
    dbCollection: Collection;

    static attributes = {
        name: "documentList"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

        server.route({
            method: "GET",
            path: "/docList",
            config: {
                description: "Get the list of documents",
                tags: ["api"],
                pre: [
                    { method: this.getDocList, assign: "docList" },
                    { method: this.getSerialisedDocList, assign: "serialisedDocList" }
                ],
                handler: this.sendDocList
            }
        });

        return next();
    }

    private setDbCollection = (server: Hapi.Server, next: Function) => {

        const db: Db = server.plugins["hapi-mongodb"].db;

        this.dbCollection = db.collection(DocumentListGroup.collection);

        return next();
    }

    private getDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

        this.dbCollection.find().toArray()
            .then(docLists => reply(docLists));
    }

    private getSerialisedDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

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

    private sendDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serialisedDocList);
    }
}

export const register = DocumentList;
