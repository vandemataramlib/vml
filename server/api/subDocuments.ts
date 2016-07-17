import * as Hapi from "hapi";
import * as Joi from "joi";

import { HapiPlugin } from "../common/interfaces";
import { getChapterSerializer } from "../serializers/documents";
import { bootstrapData } from "../documents/bootstrapData";
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
    options: any;

    constructor(server: Hapi.Server, options: any, next: Function) {

        this.options = options;

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

        next();
    }

    private getSubdocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        reply(bootstrapData.find(data => data.url === request.url.path));
    }

    private getSerializedSubdocument = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        let documentSerializer: any;

        if (preParams.subdocument.docType === DocType.Chapter.toString()) {
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
