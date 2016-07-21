import * as Hapi from "hapi";
import * as MongoClient from "mongodb";

exports.register = function (server: Hapi.Server, options: any, next: Function) {

    server.route({
        method: "GET",
        path: "/",
        handler: function (request, reply) {

            const db: MongoClient.Db = request.server.plugins["hapi-mongodb"].db;

            db.collection("documents").findOne({ url: "/docs/ishopanishad" })
                .then(rec => reply(rec));
        }
    });


    next();
};


exports.register.attributes = {
    name: "api"
};
