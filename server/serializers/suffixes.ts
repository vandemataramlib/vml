import { Serializer } from "jsonapi-serializer";

export const getSuffixSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const serializer = {
        topLevelLinks,
        dataLinks,
        id: "_id",
        keyForAttribute: "camelCase",
        attributes: ["suffix"]
    };

    return new Serializer(type, serializer);
};
