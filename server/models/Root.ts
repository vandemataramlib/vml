import { API_SERVER_BASE_URL } from "../utils/constants";

export class Root {
    static URL = (id: string) => API_SERVER_BASE_URL + "/roots/" + id;
    id: string;
    root: string;
    senses: string[];
}
