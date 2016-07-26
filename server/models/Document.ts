import { API_SERVER_BASE_URL } from "../common/constants";

export interface Book extends LogicalEntity {

    contents: Chapter[] | Part[];
}

export interface Part extends LogicalEntity {

    contents: Chapter[] | Section[];
}

export interface Section extends LogicalEntity {

    contents: Chapter[] | Subsection[];
}

export interface Subsection extends LogicalEntity {

    contents: Chapter[];
}

export enum ContentType {
    Padya,
    Gadya,
    Sutra,
    Bhashya,
    Mishra,
    Natya
}

export interface IChapter extends LogicalEntity {
    segments: Segment[];
    contentType: ContentType;
}

export class Chapter implements IChapter {
    id: number;
    segments: Segment[];
    contentType: ContentType;
    constructor(data: any) { }
}

export interface Segment extends LogicalEntity {

    stanzas: Stanza[];
}

export class Stanza implements LogicalEntity {
    static URL = (slug: string, subdocId: string, recordId: string, stanzaId: string) => {

        let url = `${API_SERVER_BASE_URL}/docs/${slug}`;

        if (subdocId) {
            url += `/subdocs/${subdocId}`;
        }

        if (recordId) {
            url += `/records/${recordId}`;
        }

        url += `/stanza/${stanzaId}`;

        return url;
    };

    id: number;
    segmentId: number;
    runningId: string;
    lines: Line[];
    stanza: string;
    analysis: Token[];
    constructor(data: Stanza, id?: number) {
        this.lines = data.lines;
        this.analysis = data.analysis;
        if (id) {
            this.id = id;
        }
    }
}

export interface Line {
    id: string;
    line?: string;
    words?: Word[];
}

export interface Word {
    id: string;
    word: string;
    analysis?: Token[];
}

export interface Token {
    id: string;
    token: string;
}

enum DocumentDataTypes {
    chapter,
    chapters,
    books
}

interface IVolume { }

class Volume implements IVolume {
    constructor(data: any) { }
}

interface ICollection { }

class Collection implements ICollection {
    constructor(data: any) { }
}

interface MetaStructure {
    title?: string;
    subtitle?: string;
    desc?: string;
    meta?: any;
    dataType?: string;
}

interface LogicalEntity extends MetaStructure {
    id: number;
}

interface DbEntity extends MetaStructure {
    _id: string;
}

class Test { }

export enum DocType {
    Collection,
    Volume,
    Chapter
}

export interface IDocument extends DbEntity {
    url: string;
    docType: DocType;
    contents: Chapter | Volume | Collection;
}

export class Document implements Document {
    _id: string;
    docType: DocType;
    url: string;
    title: string;
    contents: Chapter | Volume | Collection;

    static collection = "documents";
    static documentURL = (documentSlug: string) => `${API_SERVER_BASE_URL}/docs/${documentSlug}`;
    static subdocumentURL = (documentSlug: string, subdocumentId: string) => {

        return `${API_SERVER_BASE_URL}/docs/${documentSlug}/subdocs/${subdocumentId}`;
    };
    static recordURL = (documentSlug: string, subdocumentId: string, recordId: string) => {

        return `${API_SERVER_BASE_URL}/docs/${documentSlug}/subdocs/${subdocumentId}/records/${recordId}`;
    };
    static URL = (slug: string, subdocId: string, recordId: string) => {

        let url = `${API_SERVER_BASE_URL}/docs/${slug}`;

        if (subdocId) {
            url += `/subdocs/${subdocId}`;
        }

        if (recordId) {
            url += `/records/${recordId}`;
        }

        return url;
    };

    constructor(docType: DocType, title: string, data: any, id?: string) {

        this.docType = docType;
        this.title = title;

        if (id) {
            this._id = id;
        }

        if (docType === DocType.Chapter) {
            this.contents = new Chapter(data);
        }
        else if (docType === DocType.Volume) {
            this.contents = new Volume(data);
        }
        else if (docType === DocType.Collection) {
            this.contents = new Collection(data);
        }
    }
}
