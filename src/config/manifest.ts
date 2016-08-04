import * as Confidence from "confidence";

const Config = require("./config");

const criteria = {
    env: process.env.NODE_ENV
};

const manifest = {
    $meta: "This file defines the plot device.",
    server: {
        debug: {
            request: ["error"]
        },
        connections: {
            routes: {
                security: true,
                cors: true
            }
        }
    },
    connections: [{
        port: Config.get("/port/api"),
        labels: ["api"]
    }],
    registrations: [
        {
            plugin: "@gar/hapi-json-api",
        },
        {
            plugin: "../plugins/roots"
        },
        {
            plugin: "../plugins/documents"
        },
        {
            plugin: "../plugins/subdocuments"
        },
        {
            plugin: "../plugins/records"
        },
        {
            plugin: "../plugins/stanzas"
        },
        {
            plugin: "../plugins/prefixes"
        },
        {
            plugin: "../plugins/documentList"
        },
        {
            plugin: "../plugins/suffixes"
        },
        {
            plugin: "inert"
        },
        {
            plugin: "vision"
        },
        {
            plugin: {
                register: "hapi-mongodb",
                options: {
                    "url": Config.get("/db/address") + Config.get("/db/name")
                }
            }
        },
        {
            plugin: {
                register: "hapi-swagger",
                options: {
                    info: {
                        title: "Vande Mataram Library",
                        version: "v1"
                    },
                    expanded: "none",
                    sortEndpoints: "ordered",
                    consumes: ["application/vnd.api+json", "application/json"],
                    produces: ["application/vnd.api+json", "application/json"],
                    tags: [
                        {
                            name: "docs",
                            description: "Documents API"
                        },
                        {
                            name: "roots",
                            description: "Roots API"
                        },
                        {
                            name: "prefixes",
                            description: "Prefixes API"
                        },
                        {
                            name: "suffixes",
                            description: "Suffixes API"
                        },
                        {
                            name: "docList",
                            description: "Document List API"
                        }
                    ]
                }
            }
        }
    ]
};

const store = new Confidence.Store(manifest);

exports.get = function (key: string) {

    return store.get(key, criteria);
};

exports.meta = function (key: string) {

    return store.meta(key, criteria);
};
