import cedict from "../data/cedict.json"

interface CEDict {
    [word: string]: {
        [pinyin: string]: string[]
    }
}

export default (cedict as CEDict);
