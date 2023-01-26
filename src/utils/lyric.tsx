import { fromLRCtime2flag, fromtimeflag2str } from "./sentenceparse"
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
    offset:number
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

// Sentence存储的start已经包含了Lyc现在的offset
export class Lyric {
    infolist: Array<Info>
    senlist: Array<Sentence>
    offset: number // 代表多少个0.01s



    constructor(copy_from_localstorage:boolean=false) {
        this.infolist = []
        this.senlist = []
        this.offset = 0
        if(copy_from_localstorage){
            this.copyfromLocalStorage()
    }
    }

    copy = (otherlyric: Lyric) => {
        this.infolist = otherlyric.infolist
        this.senlist = otherlyric.senlist
        this.offset = otherlyric.offset
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
        return {type:"lrc",offset:this.offset,infolist:il,senlist:sl}
    }
    
    toLyc=():string=>{
        let res=""
        for(let info of this.infolist){
            res+=`[${info.sub}:${info.obj}]\n`
        }
        for(let sen of this.senlist){
            res+=`${fromtimeflag2str(sen.start)}${sen.content}\n`
        }
        return res
    }

    /**
     * 从localsotrage里添加
     */
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
                console.log("copy from local")
                this.offset=cachejson.offset
            }
        }else{
            this.senlist.push(new Sentence(0,"first sentence"))
        }
    }

    /**
     * 传入0.01s为底的时间点，返回目前正在播放的是哪一句歌词的下标
     */
    getNowLyricIndex=(time:number):number=>{
        const errind=this.checkErrTime()
        // if(errind!=-1){
        //     // 如果时间非递增且在time之前，则无法定位当前播放的歌词
        //     if(errind==0 || this.senlist[errind-1].start<time){
        //         return -1
        //     }

        // }
        time=Math.floor(time)+0.01//fix：点击tag切换时间却没高亮
        for(let i=0;i<this.senlist.length;i++){
            if(errind!=-1 && i>=errind){
                return -1
            }
            if(i!=this.senlist.length-1){
                // 不是最后一句的话，处于这一句时间戳之后，下一句时间戳之前
                if(this.senlist[i]?.start<=time && this.senlist[i+1]?.start>time){
                    return i
                }
            }else{
                // 如果是最后一句，只需要在这一句时间戳之后
                if(this.senlist[i]?.start<=time){
                    return i
                }
            }
        }
        return -1
    }

    /**
     * 检查歌词的时间是否合法，必须是递增序列,返回第一个不合法的下标,没有的话返回-1
     */
    checkErrTime=():number=>{
        for(let i=0;i<this.senlist.length;i++){
            if(i!=0){
                if(this.senlist[i]?.start<=this.senlist[i-1]?.start){
                    return i
                }
            }
        }
        return -1
    }


    /** 
     * 整体移动，传入时间单位0.01s
     */
    moveAll=(num:number)=>{
        for(let sen of this.senlist){
            sen.start+=num
        }
    }

    // offset
    /**
     * 传入0.01s为底的时间，然后计算现在offset和用户新设的offset差，平移所有senlist
     */
    setoffset=(time:number)=>{
        console.log(time,this.offset)
        const localoffset=time-this.offset
        this.moveAll(localoffset)
        this.offset=time
    }

    // info
    /**
     * ind处添加一个，放置于ind和ind+1之间
     */
    addinfo = (ind: number, info: Info) => {
        /**
         * 添加一个健全的info
         */
        if (ind == -1 || ind==this.senlist.length-1) {
            this.infolist.push(info)
        } else {
            // splice会直接把start处的往后挪一位，所以+1
            this.infolist.splice(ind+1, 0, info)
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
        this.infolist.splice(ind, 1)
    }

    /**
         * 添加一个健全的sentence.ind=-1插入最新,否则插在ind后面
         */
    addsentence = (ind: number, sen: Sentence) => {
        sen.start=Math.floor(sen.start)
        if (ind == -1 || ind==this.senlist.length-1) {
            this.senlist.push(sen)
        } else {
            this.senlist.splice(ind+1, 0, sen)
        }

    }

    /**
     * 更新某句时间,0.01s为单位
     */
    update_time=(ind:number,starttime:number):void=>{
        starttime=Math.floor(starttime)
        if(ind>=0 && ind<=this.senlist.length-1){
            this.senlist[ind].start=starttime
        }

    }

    addblank_sentence = (ind: number, starttime: number) => {
        /**
         * 在某个位置添加一个空的sentence
         */
        starttime=Math.floor(starttime)
        if (ind == -1 || ind==this.senlist.length-1) {
            this.senlist.push(new Sentence(starttime, ""))
        } else {
            this.senlist.splice(ind+1, 0, new Sentence(starttime, ""))
        }

    }

    editsentence_time = (ind: number, newtime: string): void => {
        const res = fromLRCtime2flag(newtime)
        if (res.type == "sentence") {
            this.senlist[ind].start = Math.floor(res.sen.start)
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
        this.senlist.splice(ind, 1)
    }

}


export const create_from_LRC = (input: string): Lyric => {
    const lyricobj = new Lyric(false)
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

export const create_from_TXT=(input:string):Lyric=>{
    const lyricobj=new Lyric(false)
    const sentences=(input+"").split("\n")
    for (let sen of sentences){
        lyricobj.addsentence(-1,new Sentence(0,sen))
    }
    return lyricobj
}