import * as Confidence from "confidence";
import * as HapiJSONAPI from "@gar/hapi-json-api";
// import * as HapiSwagger from "hapi-swagger";

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
            plugin: "./server/api/roots"
        },
        {
            plugin: "./server/api/documents"
        },
        {
            plugin: "./server/api/subDocuments"
        },
        {
            plugin: "./server/api/records"
        },
        {
            plugin: "./server/api/stanzas"
        },
        {
            plugin: "./server/api/prefixes"
        },
        {
            plugin: "./server/api/documentList"
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
                    "url": "mongodb://localhost:27017/vml"
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
