import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db } from "mongodb";

import { HapiPlugin } from "../common/interfaces";
import { getStanzaSerializer } from "../serializers/stanzas";
import { IDocument, Document, DocType, IChapter, Stanza as StanzaObj } from "../models/Document";

interface Params {
    slug?: string;
    subdocId?: string;
    recordId?: string;
    stanzaId?: string;
}

interface PreParams {
    document?: Document;
    serializedStanza?: any;
}

class Stanza {
    options: any;

    static attributes = {
        name: "stanzas"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        this.options = options;

        server.route({
            path: "/docs/{slug}/subdocs/{subdocId}/records/{recordId}/stanzas/{stanzaId}",
            method: "GET",
            config: {
                description: "Get a stanza from a record",
                notes: "Returns a stanza by the document slug, subdocId, recordId and stanzaId passed in the path",
                tags: ["api"],
                plugins: {
                    "hapi-swagger": {
                        order: 6
                    }
                },
                validate: {
                    params: {
                        slug: Joi.string()
                            .required()
                            .description("the slug for the document"),
                        subdocId: Joi.string()
                            .required()
                            .description("the id for the subdocument"),
                        recordId: Joi.string()
                            .required()
                            .description("the id for the record"),
                        stanzaId: Joi.string()
                            .required()
                            .description("the id of the stanza")
                    }
                },
                pre: [
                    { method: this.getStanza, assign: "document" },
                    { method: this.getSerializedStanza, assign: "serializedStanza" }
                ],
                handler: this.replyWithStanza
            }
        });

        server.route({
            path: "/docs/{slug}/stanzas/{stanzaId}",
            method: "GET",
            config: {
                description: "Get a stanza from a document",
                notes: "Returns a stanza by the document slug and stanzaId passed in the path",
                tags: ["api"],
                plugins: {
                    "hapi-swagger": {
                        order: 4
                    }
                },
                validate: {
                    params: {
                        slug: Joi.string()
                            .required()
                            .description("the slug for the document"),
                        stanzaId: Joi.string()
                            .required()
                            .description("the id of the stanza")
                    }
                },
                pre: [
                    { method: this.getStanza, assign: "document" },
                    { method: this.getSerializedStanza, assign: "serializedStanza" }
                ],
                handler: this.replyWithStanza
            }
        });

        server.route({
            path: "/docs/{slug}/subdocs/{subdocId}/stanzas/{stanzaId}",
            method: "GET",
            config: {
                description: "Get a stanza from a subdocument",
                notes: "Returns a stanza by the document slug, subdocId and stanzaId passed in the path",
                tags: ["api"],
                plugins: {
                    "hapi-swagger": {
                        order: 5
                    }
                },
                validate: {
                    params: {
                        slug: Joi.string()
                            .required()
                            .description("the slug for the document"),
                        subdocId: Joi.string()
                            .required()
                            .description("the id for the subdocument"),
                        stanzaId: Joi.string()
                            .required()
                            .description("the id of the stanza")
                    }
                },
                pre: [
                    { method: this.getStanza, assign: "document" },
                    { method: this.getSerializedStanza, assign: "serializedStanza" }
                ],
                handler: this.replyWithStanza
            }
        });

        next();
    }

    getStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const requestPath = request.url.path;

        const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

        const db: Db = request.server.plugins["hapi-mongodb"].db;

        db.collection(Document.collection).findOne({ url: documentPath })
            .then(record => reply(record));
    }

    getSerializedStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        let stanza: StanzaObj = null;
        let topLevelLinks: any = null;

        if (preParams.document) {
            const chapter = <IChapter>preParams.document.contents;
            let localStanza = chapter.stanzas.find(stanza => stanza.id === request.params.stanzaId);
            if (localStanza) {
                stanza = localStanza;
                topLevelLinks = {
                    self: StanzaObj.URL(request.params.slug, request.params.subdocId,
                        request.params.recordId, request.params.stanzaId)
                };
            }
        }

        const stanzaSerializer = getStanzaSerializer("stanzas", topLevelLinks);

        return reply(stanzaSerializer.serialize(stanza));
    }

    replyWithStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serializedStanza);
    }
}

export const register: HapiPlugin = Stanza;
