import * as Confidence from "confidence";


const criteria = {
    env: process.env.NODE_ENV
};


const config = {
    $meta: "This file configures the plot device.",
    projectName: "vml",
    port: {
        api: {
            $filter: "env",
            test: 9191,
            $default: 8181
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key: string) {

    return store.get(key, criteria);
};


exports.meta = function (key: string) {

    return store.meta(key, criteria);
};
