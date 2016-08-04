import { Db } from "mongodb";

export interface Controller {
    useDb: (db: Db) => void;
}
