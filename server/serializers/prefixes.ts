import { Serializer } from "jsonapi-serializer";

export const getPrefixSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const serializer = {
        topLevelLinks,
        dataLinks,
        id: "_id",
        keyForAttribute: "camelCase",
        attributes: ["prefix", "senses"]
    };

    return new Serializer(type, serializer);
};
