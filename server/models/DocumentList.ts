import { ObjectID } from "mongodb";

import { API_SERVER_BASE_URL } from "../utils/constants";
import { DocType } from "./Document";

export interface IDocumentListGroup {
    _id: ObjectID;
    title: string;
    subtitle?: string;
    desc?: string;
    items: DocumentListItem[];
}

export class DocumentListGroup implements IDocumentListGroup {
    static collection = "documentLists";
    static URL = (id: ObjectID) => API_SERVER_BASE_URL + "/docList/" + id.toHexString();
    _id: ObjectID;
    title: string;
    items: DocumentListItem[];
}

interface DocumentListItem {
    title: string;
    url: string;
    docType: DocType;
}
