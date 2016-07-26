import { Server } from "hapi";
import * as Joi from "joi";

import { DocumentListsController } from "../controllers/DocumentListsController";
import { IDocumentListGroup } from "../models/DocumentList";

export interface PreParams {
    docList?: IDocumentListGroup[];
    serialisedDocList?: any;
}

exports.register = (server: Server, options: any, next: Function) => {

    const controller = new DocumentListsController();

    server.dependency("hapi-mongodb", (server: Server, next: Function) => {

        controller.useDb(server.plugins["hapi-mongodb"].db);

        return next();
    });

    server.route({
        method: "GET",
        path: "/docList",
        config: {
            description: "Get the list of documents",
            tags: ["api"],
            pre: [
                { method: controller.getDocList, assign: "docList" },
                { method: controller.getSerialisedDocList, assign: "serialisedDocList" }
            ],
            handler: controller.sendDocList
        }
    });

    return next();
};

exports.register.attributes = {
    name: "documentList"
};
