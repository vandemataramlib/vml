import { API_SERVER_BASE_URL } from "../utils/constants";
import { ObjectID } from "mongodb";

export class Root {
    static collection = "roots";
    static URL = (id: ObjectID) => API_SERVER_BASE_URL + "/roots/" + id.toHexString();
    _id: ObjectID;
    root: string;
    senses: string[];
}
