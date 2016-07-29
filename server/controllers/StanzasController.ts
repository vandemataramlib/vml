import { Request, IReply } from "hapi";
import { Db, Collection } from "mongodb";
import { Deserializer } from "jsonapi-serializer";
import { Models } from "vml-common";

import { Controller } from "../common/interfaces";
import { Params, PreParams } from "../plugins/stanzas";
import { getStanzaSerializer } from "../serializers/stanzas";

export class StanzaController implements Controller {
    private dbCollection: Collection;
    private deserializer: Deserializer;

    constructor() {

        this.deserializer = new Deserializer({ keyForAttribute: "camelCase" });
    }

    useDb = (db: Db) => {

        this.dbCollection = db.collection(Models.Document.collection);
    }

    getStanza = (request: Request, reply: IReply) => {

        const params: Params = request.params;

        const requestPath = request.url.path;

        const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

        this.dbCollection.aggregate([
            {
                $match: {
                    url: documentPath
                }
            },
            { $unwind: "$contents" },
            { $unwind: "$contents.segments" },
            { $unwind: "$contents.segments.stanzas" },
            {
                $match: {
                    "contents.segments.stanzas.runningId": params.stanzaId,
                }
            },
            {
                $project: {
                    stanza: "$contents.segments.stanzas"
                }
            }
        ]).limit(1).next().then(response => response ? reply(response.stanza) : reply(null));
    }

    replyWithStanza = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        return reply(preParams.serializedStanza);
    }

    getSerializedStanza = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;

        let topLevelLinks: any = null;

        if (preParams.stanza) {
            topLevelLinks = {
                self: Models.Stanza.URL(request.params.slug, request.params.subdocId,
                    request.params.recordId, request.params.stanzaId)
            };
        }

        const stanzaSerializer = getStanzaSerializer("stanzas", topLevelLinks);

        return reply(stanzaSerializer.serialize(preParams.stanza));
    }

    deserializePayload = (request: Request, reply: IReply) => {

        return reply(this.deserializer.deserialize(request.payload));
    }

    patchStanza = (request: Request, reply: IReply) => {

        const preParams: PreParams = request.pre;
        const params: Params = request.params;

        const requestPath = request.url.path;

        const documentPath = requestPath.substr(0, requestPath.indexOf("/stanzas"));

        const updatedStanza: Models.Stanza = preParams.deserializedPayload;

        const stanzaKey = `contents.segments.${updatedStanza.segmentId}.stanzas.${updatedStanza.id}`;

        const update = {
            $set: {
                [stanzaKey]: updatedStanza
            }
        };

        this.dbCollection.findOneAndUpdate({ url: documentPath }, update, { returnOriginal: false })
            .then(response => reply(response.value));
    }
}
