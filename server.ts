import * as Hapi from "hapi";
const Composer = require("./index");

Composer((err: Error, server: Hapi.Server) => {

    if (err) {
        throw err;
    }

    server.start(() => {

        console.log("Started the plot device on port " + server.info.port);
    });
});
