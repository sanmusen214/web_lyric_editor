import React, { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { Button, RadioChangeEvent, Row, Tag, Tooltip } from 'antd';
import { Radio, Timeline, Typography } from 'antd';
import { Info, Lyric, Sentence } from '../../../../utils/lyric';
import { fromtimeflag2str } from '../../../../utils/sentenceparse';
import "./EditArea.css"
import { Howl } from 'howler';
import { animate } from 'popmotion';
import { RightCircleOutlined } from '@ant-design/icons'
import intl from "react-intl-universal"
import TextArea from 'antd/es/input/TextArea';


type EditAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song: Howl | undefined
  syncscroll: boolean
}

declare global {
  interface Window {
    nowsenind: any; // 你可以将 'any' 替换为你的实际类型
  }
}

const { Text } = Typography;

const EditArea: React.FC<EditAreaProps> = (props) => {

  const lyc = props.lyc

  // 应该高亮的senlist下标,为-1表示现在不该高亮
  const [nowind, setNowind] = useState<number>(0)
  // 时间不合法（非递增）的senlist下标
  const [errind, setErrind] = useState<number>(-1)


  /**
   * 重绘，使正在播放的歌曲高亮,时间错误的歌词红色
   */
  const updateNowSenUI = () => {
    const nowPlaySec001: number = 100 * (props.song?.seek() || 0)
    const nowPlayingInd: number = props.lyc.getNowLyricIndex(nowPlaySec001)
    setNowind(nowPlayingInd)
    window.nowsenind = nowPlayingInd
    const errInd: number = props.lyc.checkErrTime()
    setErrind(errInd)
    requestAnimationFrame(updateNowSenUI)
  }
  useEffect(() => {
    updateNowSenUI()
  }, [props.lyc, props.song])
  /**
   * 监听当前歌词切换,设置如果同步滚动
   */
  useEffect(() => {
    // 如果歌词符合递增顺序(无乱序）且开启了同步滚动
    if (props.syncscroll && nowind !== -1) {
      animate({
        from: document.querySelector("#EditArea")?.scrollTop,
        to: (document.querySelector(".nowplaying") as HTMLDivElement)?.offsetTop - 150,
        duration: 300,
        onUpdate: latest => document.querySelector("#EditArea")?.scrollTo(0, latest)
      })
    }
  }, [nowind, props.syncscroll])

  // 绑定快捷键到Ctrl+H
  useEffect(() => {
    window.addEventListener('keydown', (e) => {
        if (e.key.toUpperCase() === "H" && e.ctrlKey) {
          e.preventDefault()
          jumpMouseTo(window.nowsenind)
        }
    })
  },[])

  /**
   * Info left
   */
  const setEditableInfoSub = (ind: number, input: string) => {
    lyc.editinfo_sub(ind, input)
    updateLyc(lyc)
  }
  /**
   * Info right
   */
  const setEditableInfoObj = (ind: number, input: string) => {
    lyc.editinfo_obj(ind, input)
    updateLyc(lyc)
  }
  /**
   * Sentence time
   */
  const setEditableSenTime = (ind: number, input: string) => {
    lyc.editsentence_time(ind, input)
    updateLyc(lyc)
  }
  const updateTime=(ind:number)=>{
    lyc.update_time(ind,100*(props.song?.seek()||0))
    updateLyc(lyc)
  }
  /**
   * Sentence content
   */
  const setEditableSenCont = (ind: number, input: any) => {
    const divele:any=input.target
    console.log(divele.innerText)
    lyc.editsentence_content(ind, divele.innerText.trim())
    updateLyc(lyc)
  }

  /**
   * 在某一句下面加一句翻译,默认按照当前歌曲播放时间，默认内容为空
   */
  const addSentenceAfter = (ind: number) => {
    lyc.addsentence(ind, new Sentence(100 * (props.song?.seek() || 0), ""))
    updateLyc(lyc)
  }
  const addInfoAfter = (ind: number) => {
    lyc.addinfo(ind, new Info("", ""))
    updateLyc(lyc)
  }

  /**
 * 删除某一句
 */
  const delSentence = (ind: number) => {
    lyc.deletesentence(ind)
    updateLyc(lyc)
  }

  const delInfo = (ind: number) => {
    lyc.deleteinfo(ind)
    updateLyc(lyc)
  }

  /**
   * 替换Lyc，使页面重新渲染
   */
  const updateLyc = (oldlyc: Lyric): void => {
    const newlyc = new Lyric(false)
    newlyc.copy(oldlyc)
    props.setLyc(newlyc)
  }

  const oneditover = (ind: number) => {
    if (ind == props.lyc.senlist.length - 1) {
      addSentenceAfter(-1)
    }
  }

  // 快捷键相关操作
  const handleKeyDown = (e: KeyboardEvent, ind:number) => {
    console.log(e)
    if(e.key === "Enter"){
      e.preventDefault()
    }
    // 创建并跳转到新的一行
    if(e.key === "Enter"  && e.ctrlKey){
      e.preventDefault()
      addSentenceAfter(ind)
      // 光标移到新的一行
      jumpMouseTo(ind+1)
    }
    // 光标移到上一行
    if((e.key.toUpperCase() === "I" || e.key === "ArrowUp")  && e.ctrlKey){
      e.preventDefault()
      jumpMouseTo(ind-1)
    }
    // 光标移到下一行
    if((e.key.toUpperCase() === "K" || e.key === "ArrowDown") && e.ctrlKey){
      e.preventDefault()
      jumpMouseTo(ind+1)
    }
    // 歌曲时间往前移动三秒
    if((e.key.toUpperCase() === "J" || e.key === "ArrowLeft") && e.ctrlKey){
      e.preventDefault()
      props.song?.seek(props.song?.seek()-3)
    }
    // 歌曲时间往后移动三秒
    if((e.key.toUpperCase() === "L" || e.key === "ArrowRight") && e.ctrlKey){
      e.preventDefault()
      props.song?.seek(props.song?.seek()+3)
    }
    // 更新当前时间戳为现在歌曲时间
    if(e.key.toUpperCase() === "R" && e.ctrlKey){
      e.preventDefault()
      updateTime(ind)
    }
    // 更新歌曲时间为当前时间戳
    if(e.key.toUpperCase() === "F" && e.ctrlKey){
      e.preventDefault()
      const totime = props.lyc?.senlist[ind]?.start / 100;
      if (totime>=0) { props.song?.seek(totime) }
    }
    // 空格键播放暂停
    if(e.key === " " && e.ctrlKey){
      e.preventDefault()
      if(props?.song?.playing()){
        props.song?.pause()
      }else{
        props.song?.play()
      }
    }
  }


  const jumpMouseTo = (ind: number) => {
    // 将光标移到新的一行
    if (ind<0 || ind>=props.lyc.senlist.length) return
    // 找到第ind个conshow
    const ele: HTMLElement = document.querySelectorAll('.conshow')[ind] as HTMLElement
    // 聚焦到最后一个文字
    ele.focus()
    const range = document.createRange()
    range.selectNodeContents(ele)
    range.collapse(false)
    const sel = window.getSelection()
    if(sel?.anchorOffset!=0)return;
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  return (
    <div id="EditArea">

      <Timeline mode={"left"}>
        {props.lyc?.infolist.length == 0 ? <div style={{ 'textAlign': 'center', marginBottom: '20px' }}><Tag style={{ cursor: 'pointer' }} onClick={() => addInfoAfter(-1)}>add info</Tag></div> : <></>
        }
        {lyc?.infolist.map((e, ind) => {
          return (<Timeline.Item
            key={ind}
            label={
              <Text style={{ width: '100px', float: "right" }}
                editable={{ onChange: (words) => setEditableInfoSub(ind, words), triggerType: ['text'], autoSize: true, enterIcon: null }}>{e.sub ? e.sub : <div>&nbsp;</div>}</Text>}
            className="infoitem toucharea"
          >
            <Text editable={{ onChange: (words) => setEditableInfoObj(ind, words), triggerType: ['text'], enterIcon: null }}>{e.obj ? e.obj : <div>&nbsp;</div>}</Text>
            <div className='infobuttons hovershow'>
              <Tag color={'blue'} style={{ cursor: 'pointer' }} onClick={() => {
                addInfoAfter(ind)
              }}>{intl.get("add-infoline")}</Tag>
              <Tag color={'red'} style={{ cursor: 'pointer' }} onClick={() => {
                delInfo(ind)
              }}>{intl.get("del-infoline")}</Tag>
            </div>
          </Timeline.Item>)
        })}

        {props.lyc?.senlist.length == 0 ? <div style={{ 'textAlign': 'center', marginBottom: '20px' }}>
          <Tag style={{ cursor: 'pointer' }} onClick={() => addSentenceAfter(-1)}>add sen</Tag>
        </div> : <></>}

        {lyc?.senlist.map((e, ind) => {
          return (<Timeline.Item
            key={ind}
            color={errind - 1 == ind ? 'orange' : (errind == ind ? 'red' : (nowind == ind ? 'green' : 'gray'))}
            className={nowind == ind ? 'nowplaying senitem toucharea' : 'other senitem toucharea'}
            label={<>
              <Text style={{ width: '90px', float: "right" }}
                editable={{ onChange: (words) => setEditableSenTime(ind, words), triggerType: ['text'], enterIcon: null }}
              >{fromtimeflag2str(e.start)}</Text>
              <div className='hovershow' style={{position:'absolute',right:-10,top:'23px'}}>
                <Tag color={'blue'} style={{ cursor: 'pointer' }} onClick={() => {
                  updateTime(ind)
                }}>{intl.get("update-timeflag")}</Tag>
              </div>
              </>
            }
            dot={<Tooltip title={intl.get('jumpto-attention')}><RightCircleOutlined style={ind == nowind ? { fontSize: '1.5rem', transform: 'translateY(16%)' } : { transform: 'translateY(5%)' }} onClick={() => { 
              const totime = props.lyc?.senlist[ind]?.start / 100;
              if (totime==0 || totime) { props.song?.seek(totime) } }} /></Tooltip>}
          >
            <span contentEditable="true"
            className='conshow'
            style={{display:"inline-block",fontSize:'1.2rem',paddingRight:'5px',paddingLeft:'5px'}}
            // onInput={e=>setEditableSenCont(ind,e)}
            onBlur={e=>setEditableSenCont(ind,e)}
            onKeyDown={e=>handleKeyDown(e, ind)}
            >
              {e.content}
            </span>
            {/* <TextArea
            onChange={(e) => setEditableSenCont(ind, e.target.value)}
            autoSize
            onPressEnter={()=>oneditover(ind)}
            style={{ fontSize: '1.2rem' }}
            className='conshow'
            value={e.content.length > 0 ? e.content : ""}
            /> */}
            <div className='senbuttons hovershow'>
              <Tag color={'blue'} style={{ cursor: 'pointer' }} onClick={() => {
                addSentenceAfter(ind)
              }}>{intl.get("add-senline")}</Tag>
              <Tag color={'red'} style={{ cursor: 'pointer' }} onClick={() => {
                delSentence(ind)
              }}>{intl.get("del-senline")}</Tag>
            </div>
          </Timeline.Item>)
        })}
      </Timeline>
      <div style={{ height: '500px' }}></div>
    </div>
  );
};

export default EditArea