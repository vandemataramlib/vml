import { MongoClient, Db } from "mongodb";

import { suffixes } from "../documents/suffixes";

MongoClient.connect("mongodb://localhost:27017/vml")
    .then((db: Db) => {

        const collection = db.collection("suffixes");
        const suffixCount = suffixes.length;
        suffixes.forEach((suffix, i) => {

            collection.insertOne(suffix)
                .then(doc => {

                    console.log(suffix.suffix);
                    if (i === suffixCount - 1) {
                        db.close();
                    }
                })
                .catch(err => console.log(err));
        });
    })
    .catch(err => console.log(err));
