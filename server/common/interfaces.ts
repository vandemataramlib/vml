import * as Hapi from "hapi";

export interface PackageAttributes {
    pkg: Object;
}

export interface ExplicitAttributes {
    name: string;
    version?: string;
    multiple?: boolean;
    dependencies?: string | Array<string>;
    connections?: boolean;
    once?: boolean;
}

export interface HapiPlugin {
    new (server: Hapi.Server, options: any, next: Function): any;
    attributes: PackageAttributes | ExplicitAttributes;
}
