import { fromLRCtime2flag } from "./sentenceparse"
type infoobj={
    sub:string
    obj:string
}
type senobj={
    ct:string
    tt:string
    st:number
}
type lycobj={
    type:"lrc"
    infolist?:Array<infoobj>
    senlist?:Array<senobj>
}
export class Info {
    sub: string
    obj: string

    constructor(sub: string, obj: string) {
        this.sub = sub
        this.obj = obj
    }
}

export class Sentence {
    content: string
    transcontent: string
    start: number

    constructor(start: number, content: string, transcontent: string = "") {
        this.content = content
        this.transcontent = transcontent
        this.start = start
    }
}

export class Lyric {
    infolist: Array<Info>
    senlist: Array<Sentence>



    constructor(copy_from_localstorage:boolean=false) {
        this.infolist = []
        this.senlist = []
        if(copy_from_localstorage){
            this.copyfromLocalStorage()
        }
    }

    copy = (otherlyric: Lyric) => {
        this.infolist = otherlyric.infolist
        this.senlist = otherlyric.senlist
    }

    toJSON=():lycobj=>{
        const il:Array<infoobj>=[]
        this.infolist.forEach((info)=>{
            il.push({sub:info.sub,obj:info.obj})
        })
        const sl:Array<senobj>=[]
        this.senlist.forEach((sen)=>{
            sl.push({ct:sen.content,tt:sen.transcontent,st:sen.start})
        })
        return {type:"lrc",infolist:il,senlist:sl}
    }

    copyfromLocalStorage=()=>{
        const cachestr:string|null=localStorage.getItem("cachelyric")
        if(cachestr){
            const cachejson:lycobj=JSON.parse(cachestr)
            if(cachejson.type=="lrc"){
                cachejson.infolist?.forEach((data:infoobj)=>{
                    this.infolist.push(new Info(data.sub,data.obj))
                })
                cachejson.senlist?.forEach((data:senobj)=>{
                    this.senlist.push(new Sentence(data.st,data.ct,data.tt))
                })
            }
        }
    }
    // info
    addinfo = (ind: number, info: Info) => {
        /**
         * 添加一个健全的info
         */
        if (ind == -1) {
            this.infolist.push(info)
        } else {
            this.infolist = this.infolist.splice(ind, 0, info)
        }

    }

    editinfo_sub = (ind: number, newsub: string) => {
        /**
         * 更改某个info
         */
        this.infolist[ind].sub = newsub
    }

    editinfo_obj = (ind: number, newobj: string) => {
        /**
         * 更改某个info
         */
        this.infolist[ind].obj = newobj
    }

    deleteinfo = (ind: number) => {
        /**
         * 删除某个info
         */
        this.infolist = this.infolist.splice(ind, 1)
    }

    // sentence
    addsentence = (ind: number, sen: Sentence) => {
        /**
         * 添加一个健全的sentence.ind=-1插入最新
         */
        if (ind == -1) {
            this.senlist.push(sen)
        } else {
            this.senlist = this.senlist.splice(ind, 0, sen)
        }

    }

    addblank_sentence = (ind: number, starttime: number) => {
        /**
         * 在某个位置添加一个空的sentence
         */
        if (ind == -1) {
            this.senlist.push(new Sentence(starttime, ""))
        } else {
            this.senlist = this.senlist.splice(ind, 0, new Sentence(starttime, ""))
        }

    }

    editsentence_time = (ind: number, newtime: string): void => {
        const res = fromLRCtime2flag(newtime)
        if (res.type == "sentence") {
            this.senlist[ind].start = res.sen.start
        }
    }

    editsentence_content = (ind: number, newcontent: string): void => {
        /**
         * 更改某个sentence
         */
        this.senlist[ind].content = newcontent
    }

    deletesentence = (ind: number) => {
        /**
         * 删除某个sentence
         */
        this.senlist = this.senlist.splice(ind, 1)
    }

}


export const create_from_LRC = (input: string): Lyric => {
    const lyricobj = new Lyric()
    const sentences = (input + "").split("\n")
    for (let i = 0; i < sentences.length; i++) {
        const sentenceparse
            = fromLRCtime2flag(sentences[i].trim())
        if (sentenceparse.type == "sentence") {
            lyricobj.addsentence(-1, sentenceparse.sen)
        } else if (sentenceparse.type == "info") {
            lyricobj.addinfo(-1, sentenceparse.info)
        }
    }
    return lyricobj
}
