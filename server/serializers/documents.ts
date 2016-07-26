import { Serializer } from "jsonapi-serializer";

export const getChapterSerializer = (type: string, selfURL: string) => {

    const serializer = {
        topLevelLinks: {
            self: selfURL
        },
        id: "_id",
        attributes: ["title", "url", "contents", "docType"],
        keyForAttribute: "camelCase",
        contents: {
            attributes: ["segments"],
            segments: {
                attributes: ["stanzas"],
                stanzas: {
                    attributes: ["lines", "id"],
                    lines: {
                        attributes: ["line"]
                    }
                }
            }
        }
    };

    return new Serializer(type, serializer);
};

export const getVolumeSerializer = (type: string, selfURL: string) => {

};

export const getCollectionSerializer = (type: string, selfURL: string) => {

};
