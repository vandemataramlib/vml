import { API_SERVER_BASE_URL } from "../common/constants";

export enum SuffixType {
    Primary,
    Secondary
}

export enum POS {
    Noun,
    Verb,
    Participle,
    Adjective,
    Adverb
}

export enum Tense {
    Present,
    Past,
    Future,
    // Potential,
    // Indeclinable,
    // Infinitive
}

export enum Voice {
    Parasmaipada,
    Atmanepada,
    PerfectParasmaipada,
    PerfectAtmanepada,
    Passive,
    Active
}

export enum Degree {
    Comparative,
    Superlative
}

export enum Gender {
    Feminine,
    Masculine,
    Neuter
}

export enum Number {
    Singular,
    Dual,
    Plural
}

export interface ISuffix {
    _id: string;
    suffix: string;
    senses?: string[];
    type?: SuffixType;
    pos?: POS | POS[];
    tense?: Tense;
    voice?: Voice;
    degree?: Degree;
    gender?: Gender;
    number?: Number;
    formOf?: string;
    note?: string;
}

export class Suffix implements ISuffix {
    _id: string;
    suffix: string;
    static collection = "suffixes";
    static URL = (id: string) => API_SERVER_BASE_URL + "/suffixes/" + id;
}
