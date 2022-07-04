declare module 'chinese-to-pinyin' {
    interface PinyinOptions {
        // pinyin('今天天气真好', {removeTone: true}) // jin tian tian qi zhen hao
        removeTone?: boolean,

        // pinyin('今天天气真好', {toneToNumber: true}) // jin1 tian1 tian1 qi4 zhen1 hao3
        toneToNumber?: boolean,

        // pinyin('今天天气真好', {toneToNumberOnly: true}) // 1 1 1 4 1 3
        toneToNumberOnly?: boolean,

        // pinyin('今天天气真好', {removeSpace: true}) // jīntiāntiānqìzhēnhǎo
        removeSpace?: boolean,

        // pinyin('1今天天气dd dd真e好fff', { keepRest: true }) // 1jīn tiān tiān qìdd ddzhēnehǎofff
        keepRest?: boolean,
    }

    function pinyin(str: string, options?: PinyinOptions): string;

    export default pinyin;
}
