import { Serializer } from "jsonapi-serializer";

export const getStanzaSerializer = (type: string, selfURL: string) => {

    const serializer = {
        topLevelLinks: {
            self: selfURL
        },
        keyForAttribute: "camelCase",
        attributes: ["lines", "analysis", "stanza"]
    };

    return new Serializer(type, serializer);
};
