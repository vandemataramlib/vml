import { API_SERVER_BASE_URL } from "../utils/constants";

export class Prefix {
    static URL = (id: string) => API_SERVER_BASE_URL + "/prefixes/" + id;
    static collection = "prefixes";
    _id: string;
    prefix: string;
    senses: string[];
}
