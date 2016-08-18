import * as Hapi from "hapi";
const Exiting = require("exiting");

const Composer = require("./src/config");

Composer((err: Error, server: Hapi.Server) => {

    if (err) {
        throw err;
    }

    new Exiting.Manager(server).start((err: Error) => {

        if (err) {
            throw err;
        }

        console.log("Server started on port", server.info.port);
    });
});
