import { Serializer } from "jsonapi-serializer";

export const getDocumentListSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const options = {
        id: "_id",
        topLevelLinks,
        dataLinks,
        attributes: ["title", "subtitle", "desc", "items"],
        keyForAttribute: "camelCase"
    };

    return new Serializer(type, options);
};
