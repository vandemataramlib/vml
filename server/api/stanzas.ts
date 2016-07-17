import * as Hapi from "hapi";
import * as Joi from "joi";
import { Serializer } from "jsonapi-serializer";

import { HapiPlugin } from "../common/interfaces";
import { getStanzaSerializer } from "../serializers/stanzas";
import { bootstrapData } from "../documents/bootstrapData";
import { IDocument, Document, DocType, IChapter, Stanza as StanzaObj } from "../models/Document";

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
            handler: this.getStanza,
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
                }
            }
        });

        server.route({
            path: "/docs/{slug}/stanzas/{stanzaId}",
            method: "GET",
            handler: this.getStanza,
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
                }
            }
        });

        server.route({
            path: "/docs/{slug}/subdocs/{subdocId}/stanzas/{stanzaId}",
            method: "GET",
            handler: this.getStanza,
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
                }
            }
        });

        next();
    }

    getStanza = (request: Hapi.Request, reply: Hapi.IReply) => {

        const requestPath = request.url.path;

        const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

        const document: IDocument = bootstrapData.find(data => data.url === documentPath);

        const chapter = <IChapter>document.contents;

        const stanza = chapter.stanzas.find(stanza => stanza.id === request.params.stanzaId);

        const stanzaSerializer = getStanzaSerializer("stanzas",
            StanzaObj.URL(request.params.slug, request.params.subdocId,
                request.params.recordId, request.params.stanzaId));

        reply(stanzaSerializer.serialize(stanza));
    }
}

export const register: HapiPlugin = Stanza;
