import {MongoClient} from "mongodb";
import { prefixes } from "../documents/prefixes";

const url = "mongodb://localhost:27017/vml";

MongoClient.connect(url, (err, db) => {

    db.collection("prefixes").insertMany(prefixes);
    db.close();
});
