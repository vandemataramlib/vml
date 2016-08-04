import { Server } from "hapi";
import * as Joi from "joi";
import { Models } from "vml-common";

import { DocumentsController } from "../controllers/DocumentsController";

export interface PreParams {
    document?: Models.IDocument;
    serializedDocument?: any;
}

export interface Params {
    slug?: string;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new DocumentsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

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
                { method: controller.getDocument, assign: "document" },
                { method: controller.getSerializedDocument, assign: "serializedDocument" }
            ],
            handler: controller.sendDocument
        }
    });

    return next();
};

exports.register.attributes = {
    name: "documents"
};
