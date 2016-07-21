import { Serializer } from "jsonapi-serializer";

export const getRootSerializer = (type: string, topLevelLinks?: any, dataLinks?: any) => {

    const options = {
        topLevelLinks,
        dataLinks,
        id: "_id",
        attributes: ["root", "senses"],
        keyForAttribute: "camelCase"
    };

    return new Serializer(type, options);
};
