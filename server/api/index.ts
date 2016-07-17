import * as Hapi from "hapi";

exports.register = function (server: Hapi.Server, options: any, next: Function) {

    server.route({
        method: "GET",
        path: "/",
        handler: function (request, reply) {

            reply({ message: "Welcome to the plot device." });
        }
    });


    next();
};


exports.register.attributes = {
    name: "api"
};
