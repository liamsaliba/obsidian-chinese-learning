declare module 'hsk-words' {
    interface HSKDictionaryEntry {
        simplified: string,
        traditional: string,
        pinyin: string,
        pinyinN: string,
        definition: string,
        hsk: number,
    }

    function hsk(str: string): Promise<HSKDictionaryEntry>;

    export default hsk;
}
