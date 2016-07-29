import { Server } from "hapi";
import * as Joi from "joi";
import { Models } from "vml-common";

import { RecordsController } from "../controllers/RecordsController";

export interface Params {
    slug?: string;
    subdocId?: string;
    recordId?: string;
}

export interface PreParams {
    record?: Models.IDocument;
    serialisedRecord?: any;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new RecordsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        path: "/docs/{slug}/subdocs/{subdocId}/records/{recordId}",
        method: "GET",
        config: {
            description: "Get a record",
            notes: "Returns a record by the slug and subdocument id passed in the path",
            tags: ["api"],
            plugins: {
                "hapi-swagger": {
                    order: 3
                }
            },
            validate: {
                params: {
                    slug: Joi.string()
                        .required()
                        .description("the slug for the document"),
                    subdocId: Joi.number()
                        .required()
                        .description("the id for the subdocument"),
                    recordId: Joi.number()
                        .required()
                        .description("the id for the record"),
                }
            },
            pre: [
                { method: controller.getRecord, assign: "record" },
                { method: controller.getSerializedRecord, assign: "serialisedRecord" }
            ],
            handler: controller.sendRecord
        }
    });

    return next();
};

exports.register.attributes = {
    name: "records"
};
