import { Serializer } from "jsonapi-serializer";

export const getStanzaSerializer = (type: string, topLevelLinks?: any) => {

    const serializer = {
        topLevelLinks,
        keyForAttribute: "camelCase",
        attributes: ["runningId", "segmentId", "lines", "analysis", "stanza"]
    };

    return new Serializer(type, serializer);
};
