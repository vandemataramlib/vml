import { roots } from "../documents/rootsRaw";
import * as Sanscript from "sanscript";

interface Root {
    id: string;
    root: string;
    senses: string[];
}

const mappedRoots: Root[] = roots.map((root, i) => {
    return {
        id: i.toString(),
        root: Sanscript.t(root, "devanagari", "itrans"),
        senses: []
    };
});

// [1, 2, 3].map((num, i) => { return {num: num + 1, id: i}});

console.log(mappedRoots);
