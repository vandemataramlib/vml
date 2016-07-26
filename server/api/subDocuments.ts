import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, Collection } from "mongodb";

import { HapiPlugin } from "../common/interfaces";
import { getChapterSerializer } from "../serializers/documents";
import { Document, DocType } from "../models/Document";
import { API_SERVER_BASE_URL } from "../utils/constants";

interface Params {
    slug?: string;
    subdocId?: string;
}

interface PreParams {
    subdocument?: Document;
    serialisedSubdocument?: any;
}

class SubDocuments {
    dbCollection: Collection;

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

        server.route({
            path: "/docs/{slug}/subdocs/{subdocId}",
            method: "GET",
            config: {
                description: "Get a subdoument",
                notes: "Returns a subdocument by the slug and subdocument id passed in the path",
                tags: ["api"],
                plugins: {
                    "hapi-swagger": {
                        order: 2
                    }
                },
                validate: {
                    params: {
                        slug: Joi.string()
                            .required()
                            .description("the slug for the document"),
                        subdocId: Joi.number()
                            .required()
                            .description("the id for the subdocument")
                    }
                },
                pre: [
                    { method: this.getSubdocument, assign: "subdocument" },
                    { method: this.getSerializedSubdocument, assign: "serialisedSubdocument" }
                ],
                handler: this.sendSubdocument
            }
        });

        return next();
    }

    private setDbCollection = (server: Hapi.Server, next: Function) => {

        const db: Db = server.plugins["hapi-mongodb"].db;

        this.dbCollection = db.collection(Document.collection);

        return next();
    }

    private getSubdocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        this.dbCollection.findOne({ url: request.url.path })
            .then(record => reply(record));
    }

    private getSerializedSubdocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.subdocument.docType === DocType.Chapter) {
            documentSerializer = getChapterSerializer("subdocuments", Document.subdocumentURL(params.slug, params.subdocId));
        }

        return reply(documentSerializer.serialize(preParams.subdocument));
    }

    private sendSubdocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serialisedSubdocument);
    }

    static attributes = {
        name: "subDocuments"
    };
}

export const register: HapiPlugin = SubDocuments;
