import _cedict from "../data/cedict-original.json"

interface CEDict {
    [word: string]: CEDictSimplifiedEntry | CEDictTraditionalEntry,
}

interface CEDictDefinitions {
    [pinyin: string]: string[],
}

interface CEDictSimplifiedEntry {
    d: CEDictDefinitions,
    t: string,  // traditional
}

interface CEDictTraditionalEntry {
    d: CEDictDefinitions,
    s: string,  // traditional
}

let cedict = (_cedict as CEDict);

export default cedict;

export const queryDictionary = (query: string) => {
    return cedict[query]?.d;
}

