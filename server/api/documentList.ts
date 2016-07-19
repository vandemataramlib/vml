import * as Hapi from "hapi";
import * as Joi from "joi";

import { bootstrapData } from "../documents/bootstrapData";
import { getDocumentListSerializer } from "../serializers/documentList";
import { API_SERVER_BASE_URL } from "../utils/constants";

interface PreParams {
    docList?: any;
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

        reply(bootstrapData.map(data => { return { title: data.title, url: data.url, id: data.id }; }));
    }

    private getSerialisedDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        const topLevelLinks = {
            self: API_SERVER_BASE_URL + request.url.path
        };

        const serializer = getDocumentListSerializer("documents", topLevelLinks);

        reply(serializer.serialize(preParams.docList));
    }

    private sendDocList = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serialisedDocList);
    }
}

export const register = DocumentList;