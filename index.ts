import * as Glue from "glue";
const Manifest = require("./manifest");


const composeOptions = {
    relativeTo: __dirname
};


module.exports = Glue.compose.bind(Glue, Manifest.get("/"), composeOptions);