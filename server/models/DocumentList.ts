import { API_SERVER_BASE_URL } from "../common/constants";
import { DocType } from "./Document";

export interface IDocumentListGroup {
    _id: string;
    title: string;
    subtitle?: string;
    desc?: string;
    items: DocumentListItem[];
}

export class DocumentListGroup implements IDocumentListGroup {
    static collection = "documentLists";
    static URL = (id: string) => API_SERVER_BASE_URL + "/docList/" + id;
    _id: string;
    title: string;
    items: DocumentListItem[];
}

interface DocumentListItem {
    title: string;
    url: string;
    docType: DocType;
}
