import { API_SERVER_BASE_URL } from "../common/constants";

export class Root {
    static collection = "roots";
    static URL = (id: string) => API_SERVER_BASE_URL + "/roots/" + id;
    _id: string;
    root: string;
    senses: string[];
}
