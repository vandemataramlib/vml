import { prefixes } from "../documents/prefixesRaw";

interface Prefix {
    id: string;
    prefix: string;
    senses: string[];
}

const mappedPrefixes: Prefix[] = prefixes.map((prefix, i) => {

    return {
        id: i.toString(),
        prefix: prefix.form,
        senses: prefix.senses
    };
});

console.log(mappedPrefixes);
