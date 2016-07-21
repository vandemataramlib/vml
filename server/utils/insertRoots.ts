import { MongoClient } from "mongodb";
import { roots } from "../documents/rootsRaw";
import * as Sanscript from "sanscript";

interface Root {
    root: string;
    senses: string[];
}

const mappedRoots: Root[] = roots.map((root, i) => {
    return {
        root: Sanscript.t(root, "devanagari", "itrans"),
        senses: []
    };
});

const url = "mongodb://localhost:27017/vml";

MongoClient.connect(url, (err, db) => {

    db.collection("roots").insertMany(mappedRoots);
    db.close();
});
