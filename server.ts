import * as Hapi from "hapi";
const Composer = require("./index");

Composer((err: Error, server: Hapi.Server) => {

    if (err) {
        throw err;
    }

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log("Server started on port", server.info.port);
    });
});
