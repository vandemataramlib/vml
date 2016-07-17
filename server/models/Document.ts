import { API_SERVER_BASE_URL } from "../utils/constants";

export interface Book extends MetaStructure {

    data: Chapter[] | Part[];
}

export interface Part extends MetaStructure {

    data: Chapter[] | Section[];
}

export interface Section extends MetaStructure {

    data: Chapter[] | Subsection[];
}

export interface Subsection extends MetaStructure {

    data: Chapter[];
}

export interface IChapter extends MetaStructure {
    stanzas?: Stanza[];
    segments?: Segment[];
}

export class Chapter implements IChapter {
    id: string;
    stanzas: Stanza[];
    segments: Segment[];
    constructor(data: any) { }
}

export interface Segment extends MetaStructure {

    data: Stanza[];
}

export class Stanza implements MetaStructure {
    static URL = (documentSlug: string, subdocumentId: string, recordId: string, stanzaId: string) => {

        let url = `${API_SERVER_BASE_URL}/docs/${documentSlug}`;

        if (subdocumentId) {
            url += `/subdocs/${subdocumentId}`;
        }

        if (recordId) {
            url += `/records/${recordId}`;
        }

        url += `/stanza/${stanzaId}`;

        return url;
    };

    id: string;
    lines: Line[];
    stanza: string;
    analysis: Token[];
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

type TextOrChapterOrBookArray = Stanza[] | Chapter[] | Book[];

interface IVolume { }

class Volume implements IVolume {
    constructor(data: any) { }
}

interface ICollection { }

class Collection implements ICollection {
    constructor(data: any) { }
}

interface MetaStructure {
    id: string;
    title?: string;
    subtitle?: string;
    desc?: string;
    meta?: any;
    dataType?: string;
}

class Test { }

export enum DocType {
    Collection,
    Volume,
    Chapter
}

export interface IDocument extends MetaStructure {
    url: string;
    docType: string;
    contents: Chapter | Volume | Collection;
}

export class Document implements IDocument {
    id: string;
    docType: string;
    url: string;
    title: string;
    contents: Chapter | Volume | Collection;

    static documentURL = (documentSlug: string) => `${API_SERVER_BASE_URL}/docs/${documentSlug}`;
    static subdocumentURL = (documentSlug: string, subdocumentId: string) => {

        return `${API_SERVER_BASE_URL}/docs/${documentSlug}/subdocs/${subdocumentId}`;
    };
    static recordURL = (documentSlug: string, subdocumentId: string, recordId: string) => {

        return `${API_SERVER_BASE_URL}/docs/${documentSlug}/subdocs/${subdocumentId}/records/${recordId}`;
    };

    constructor(docType: DocType, title: string, data: any, id?: string) {

        this.docType = DocType[docType];
        this.title = title;

        if (id) {
            this.id = id;
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
