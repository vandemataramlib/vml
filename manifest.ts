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
            plugin: "./server/plugins/roots"
        },
        {
            plugin: "./server/plugins/documents"
        },
        {
            plugin: "./server/plugins/subdocuments"
        },
        {
            plugin: "./server/plugins/records"
        },
        {
            plugin: "./server/plugins/stanzas"
        },
        {
            plugin: "./server/plugins/prefixes"
        },
        {
            plugin: "./server/plugins/documentList"
        },
        {
            plugin: "./server/plugins/suffixes"
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
