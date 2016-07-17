import { Serializer } from "jsonapi-serializer";

export const getPrefixSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const serializer = {
        topLevelLinks,
        dataLinks,
        keyForAttribute: "camelCase",
        attributes: ["prefix", "senses"]
    };

    return new Serializer(type, serializer);
};
