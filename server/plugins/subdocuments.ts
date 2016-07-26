import { Server } from "hapi";
import * as Joi from "joi";

import { SubdocumentsController } from "../controllers/SubdocumentsController";
import { IDocument } from "../models/Document";

export interface Params {
    slug?: string;
    subdocId?: string;
}

export interface PreParams {
    subdocument?: IDocument;
    serializedSubdocument?: any;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new SubdocumentsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        path: "/docs/{slug}/subdocs/{subdocId}",
        method: "GET",
        config: {
            description: "Get a subdocument",
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
                { method: controller.getSubdocument, assign: "subdocument" },
                { method: controller.getSerializedSubdocument, assign: "serializedSubdocument" }
            ],
            handler: controller.sendSubdocument
        }
    });

    return next();
};

exports.register.attributes = {
    name: "subdocuments"
};
