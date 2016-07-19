import { Serializer } from "jsonapi-serializer";

export const getDocumentListSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const options = {
        topLevelLinks,
        dataLinks,
        attributes: ["title", "url"],
        keyForAttribute: "camelCase"
    };

    return new Serializer(type, options);
};
