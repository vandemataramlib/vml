import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, Collection } from "mongodb";

import { getChapterSerializer } from "../serializers/documents";
import { HapiPlugin } from "../common/interfaces";
import { IDocument, Document, DocType } from "../models/Document";

interface PreParams {
    document?: Document;
    serialisedDocument?: any;
}

interface Params {
    slug?: string;
}

class Documents {
    dbCollection: Collection;

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

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

        return next();
    }

    private setDbCollection = (server: Hapi.Server, next: Function) => {

        const db: Db = server.plugins["hapi-mongodb"].db;

        this.dbCollection = db.collection(Document.collection);

        return next();
    }

    private getDocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        this.dbCollection.findOne({ url: request.url.path })
            .then(record => reply(record));
    }

    private getSerialisedDocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.document.docType === DocType.Chapter) {
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
