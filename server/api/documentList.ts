import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db } from "mongodb";

import { getDocumentListSerializer } from "../serializers/documentList";
import { API_SERVER_BASE_URL } from "../utils/constants";
import { IDocumentListGroup, DocumentListGroup } from "../models/DocumentList";

interface PreParams {
    docList?: IDocumentListGroup[];
    serialisedDocList?: any;
}

class DocumentList {
    options: any;

    static attributes = {
        name: "documentList"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

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

        next();
    }

    private getDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

        const db: Db = request.server.plugins["hapi-mongodb"].db;

        db.collection(DocumentListGroup.collection).find().toArray()
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
