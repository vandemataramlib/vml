import { IDocumentListGroup } from "../models/DocumentList";

export const bootstrapDocumentList: IDocumentListGroup[] = [
    {
        _id: "1",
        title: "Upanishads",
        items: [
            {
                title: "Ishopanishad",
                url: "/ishopanishad",
                docType: 2
            }, {
                title: "Chhandogyopanishad",
                url: "/Chhandogyopanishad",
                docType: 1
            }
        ]
    },
    {
        _id: "1",
        title: "Brahmanas",
        items: [
            {
                title: "Ishopanishad",
                url: "/ishopanishad",
                docType: 2
            }, {
                title: "Chhandogyopanishad",
                url: "/Chhandogyopanishad",
                docType: 1
            }
        ]
    }
];
