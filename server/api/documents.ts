import * as Hapi from "hapi";
import * as Joi from "joi";

import { getChapterSerializer } from "../serializers/documents";
import { HapiPlugin } from "../common/interfaces";
import { bootstrapData } from "../documents/bootstrapData";
import { IDocument, Document, DocType } from "../models/Document";

interface PreParams {
    document?: Document;
    serialisedDocument?: any;
}

interface Params {
    slug?: string;
}

class Documents {
    options: any;

    constructor(server: Hapi.Server, options: any, next: Function) {

        this.options = options;

        server.route({
            method: "GET",
            path: "/docs/{slug}",
            config: {
                description: "Get a document",
                notes: "Returns a document by the slug passed in the path",
                tags: ["api"],
                plugins: {
                    "hapi-swagger": {
                        order: 1
                    }
                },
                validate: {
                    params: {
                        slug: Joi.string()
                            .required()
                            .description("the slug for the document"),
                    }
                },
                pre: [
                    { method: this.getDocument, assign: "document" },
                    { method: this.getSerialisedDocument, assign: "serialisedDocument" }
                ],
                handler: this.sendDocument
            }
        });

        next();
    }

    private getDocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        reply(bootstrapData.find(data => data.url === request.url.path));
    }

    private getSerialisedDocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.document.docType === DocType.Chapter.toString()) {
            documentSerializer = getChapterSerializer("documents", Document.documentURL(params.slug));
        }

        return reply(documentSerializer.serialize(preParams.document));
    }

    private sendDocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        return reply((<PreParams>request.pre).serialisedDocument);
    }

    static attributes = {
        name: "documents"
    };
}

export const register: HapiPlugin = Documents;
