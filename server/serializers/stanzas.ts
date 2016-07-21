import { Serializer } from "jsonapi-serializer";

export const getStanzaSerializer = (type: string, topLevelLinks?: any) => {

    const serializer = {
        topLevelLinks,
        id: "_id",
        keyForAttribute: "camelCase",
        attributes: ["lines", "analysis", "stanza"]
    };

    return new Serializer(type, serializer);
};
