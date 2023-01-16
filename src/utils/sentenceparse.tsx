/**
 * '[12:34.56]dafgsg'.replace(/\[(\d{2}):(\d{2})\.(\d{2}|\d{3})\](.*)/, (_, ...args) => {
    const [mm, ss, ms, content] = args;
    return `${mm}分钟${ss}秒${ms}了:内容：${content}`
  })
 */

import { Sentence, Info } from "./lyric"
// 信息正则
const lrcinforeg = /\[(.+):(.+)\]/
// 歌词正则
const lrcreg = /\[(\d{2}):(\d{2})\.(\d{2}|\d{3})\](.*)/


/**
 * 解析info那几行 [ar:Simon]
 */
export const fromLRCinfostr = (senstr: string): { type: "" | "info", info: Info } => {
    if (lrcinforeg.test(senstr)) {
        const splitstr = senstr.replace(lrcinforeg, (_, ...args) => {
            const [sub, obj, other] = args;
            return `${sub}&#&${obj}`
        })
        const splitlist = splitstr.split("&#&")
        return { type: "info", info: new Info(splitlist[0], splitlist[1]) }
    } else {
        return { type: "", info: new Info('', '') }
    }
}

/**
 * 解析任意一行LRC [00:23.12]
 */
export function fromLRCtime2flag(senstr: string): { type: "sentence" | "info" | "nothing", sen: Sentence, info: Info } {
    if (lrcreg.test(senstr)) {
        // 能按照歌词行解析
        const splitstr = senstr.replace(lrcreg, (_, ...args) => {
            const [mm, ss, ms, content] = args;
            return `${mm}&#&${ss}&#&${ms}&#&${content}`
        })
        const splitlist = splitstr.split("&#&")
        const mm = parseInt(splitlist[0])
        const ss = parseInt(splitlist[1])
        const ms = parseInt(splitlist[2].slice(0, 2))
        return { type: "sentence", sen: new Sentence(mm * 60 * 100 + ss * 100 + ms, splitlist[3].trim()), info: new Info('1', '2') }
    } else {
        // 尝试按照info行解析
        let parseline = fromLRCinfostr(senstr)
        if (parseline.type == "info") {
            return { type: "info", info: parseline.info, sen: new Sentence(1, '2') }
        }
        return { type: "nothing", info: new Info("a", "b"), sen: new Sentence(1, '2') }
    }
}

/**
 * 从0.01秒为底的时间 如122表示1.22秒 转为 lrc的时间字符串
 */
export function fromtimeflag2str(timeflag: number): string {
    let timett = Math.floor(timeflag)
    // 时间由于offset过大小于0，直接显示为0
    if(timett<0){
        return "[00:00.00]"
    }
    const mm: number = Math.floor(timett / 6000)
    let mmstr = "" + mm
    if (mm>=0 && mm < 10) {
        mmstr = "0" + mm
    }
    timett = timett % 6000
    const ss = Math.floor(timett / 100)
    let ssstr = "" + ss
    if (ss>=0 && ss < 10) {
        ssstr = "0" + ss
    }
    const ms = timett % 100
    let msstr = "" + ms
    if (ms>=0 && ms < 10) {
        msstr = "0" + ms
    }
    return `[${mmstr}:${ssstr}.${msstr}]`
}
