import * as Hapi from "hapi";
import * as Joi from "joi";
import { Db, Collection } from "mongodb";
import { Deserializer } from "jsonapi-serializer";

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
    stanza?: StanzaObj;
    serializedStanza?: any;
    deserializedPayload?: StanzaObj;
}

const stanzaPayloadSchema = {
    data: Joi.object().required().keys({
        type: Joi.string().required().default("stanzas"),
        id: Joi.string().required().default("id"),
        attributes: Joi.object().required().keys({
            lines: Joi.array().required().description("the lines comprising the stanza").items(
                Joi.object().keys({
                    line: Joi.string(),
                    words: Joi.array().items(
                        Joi.object().keys({
                            word: Joi.string(),
                            analysis: Joi.alternatives().try(Joi.array().items(
                                Joi.object().keys({
                                    token: Joi.string()
                                })
                            ), null)
                        }).options({ allowUnknown: true })
                    )
                }).options({ allowUnknown: true })
            ),
            analysis: Joi.alternatives().try(Joi.array().description("the stanza's analysis"), null)
        }).options({ allowUnknown: true })
    })
};

class Stanza {
    dbCollection: Collection;

    static attributes = {
        name: "stanzas"
    };

    constructor(server: Hapi.Server, options: any, next: Function) {

        server.dependency("hapi-mongodb", this.setDbCollection);

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
                    { method: this.getDocument, assign: "document" },
                    { method: this.getStanza, assign: "stanza" },
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
                    { method: this.getDocument, assign: "document" },
                    { method: this.getStanza, assign: "stanza" },
                    { method: this.getSerializedStanza, assign: "serializedStanza" }
                ],
                handler: this.replyWithStanza
            }
        });

        server.route({
            path: "/docs/{slug}/stanzas/{stanzaId}",
            method: "PATCH",
            config: {
                description: "Update a stanza in a document",
                notes: "Returns the updated stanza",
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
                    },
                    payload: stanzaPayloadSchema
                },
                pre: [
                    { method: this.getDocument, assign: "document" },
                    [
                        { method: this.getStanza, assign: "stanza" },
                        { method: this.deserializePayload, assign: "deserializedPayload" }
                    ],
                    { method: this.patchStanza, assign: "document" },
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
                    { method: this.getDocument, assign: "document" },
                    { method: this.getStanza, assign: "stanza" },
                    { method: this.getSerializedStanza, assign: "serializedStanza" }
                ],
                handler: this.replyWithStanza
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

        const requestPath = request.url.path;

        const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

        this.dbCollection.findOne({ url: documentPath })
            .then(record => reply(record));
    }

    private getStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        let stanza: StanzaObj = null;

        if (preParams.document) {
            const chapter = <IChapter>preParams.document.contents;
            let localStanza = chapter.stanzas.find(stanza => stanza.id === request.params.stanzaId);
            if (localStanza) {
                stanza = localStanza;
            }
        }

        return reply(stanza);
    }

    private getSerializedStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        let topLevelLinks: any = null;

        if (preParams.stanza) {
            topLevelLinks = {
                self: StanzaObj.URL(request.params.slug, request.params.subdocId,
                    request.params.recordId, request.params.stanzaId)
            };
        }

        const stanzaSerializer = getStanzaSerializer("stanzas", topLevelLinks);

        return reply(stanzaSerializer.serialize(preParams.stanza));
    }

    private replyWithStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;

        reply(preParams.serializedStanza);
    }

    private deserializePayload = (request: Hapi.Request, reply: Hapi.IReply) => {

        new Deserializer().deserialize(request.payload)
            .then(stanza => reply(stanza));
    }

    private patchStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const preParams: PreParams = request.pre;
        const params: Params = request.params;

        let stanza: StanzaObj = null;

        if (preParams.document) {
            const documentStanzas = (<IChapter>preParams.document.contents).stanzas.map(stanza => {

                if (stanza.id === params.stanzaId) {

                    return preParams.deserializedPayload;
                }

                return stanza;
            });

            (<IChapter>preParams.document.contents).stanzas = documentStanzas;

            const requestPath = request.url.path;

            const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

            this.dbCollection.findOneAndReplace({ url: documentPath }, preParams.document, { returnOriginal: false })
                .then(response => {

                    const chapter = <IChapter>response.value.contents;
                    return reply(chapter.stanzas.find(stanza => stanza.id === request.params.stanzaId));
                });

        }
    }
}

export const register: HapiPlugin = Stanza;
