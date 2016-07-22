import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, Collection } from "mongodb";

import { HapiPlugin } from "../common/interfaces";
import { Document } from "../models/Document";
import { getChapterSerializer } from "../serializers/documents";
import { API_SERVER_BASE_URL } from "../utils/constants";

interface Params {
    slug?: string;
    subdocId?: string;
    recordId?: string;
}

interface PreParams {
    record?: Document;
    serialisedRecord?: any;
}

class Records {
    dbCollection: Collection;

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

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
                    { method: this.getRecord, assign: "record" },
                    { method: this.getSerialisedRecord, assign: "serialisedRecord" }
                ],
                handler: this.sendRecord
            }
        });

        return next();
    }

    private setDbCollection = (server: Hapi.Server, next: Function) => {

        const db: Db = server.plugins["hapi-mongodb"].db;

        this.dbCollection = db.collection(Document.collection);

        return next();
    }

    private getRecord = (request: Hapi.Request, reply: Hapi.IReply) => {

        this.dbCollection.findOne({ url: request.url.path })
            .then(record => reply(record));
    }

    private getSerialisedRecord = (request: Hapi.Request, reply: Hapi.IReply) => {

        const params: Params = request.params;
        const preParams: PreParams = request.pre;

        const recordSerializer = getChapterSerializer("records", Document.recordURL(params.slug, params.subdocId, params.recordId));

        return reply(recordSerializer.serialize(preParams.record));
    }

    private sendRecord = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serialisedRecord);
    }

    static attributes = {
        name: "records"
    };
}

export const register: HapiPlugin = Records;
