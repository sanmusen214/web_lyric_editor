import React, { useEffect, useState } from 'react';
import { RadioChangeEvent, Row, Tag } from 'antd';
import { Radio, Timeline, Typography } from 'antd';
import { Info, Lyric, Sentence } from '../../../../utils/lyric';
import { fromtimeflag2str } from '../../../../utils/sentenceparse';
import "./EditArea.css"
import { Howl } from 'howler';
import { animate } from 'popmotion';
import {RightCircleOutlined} from '@ant-design/icons'


type EditAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song:Howl|undefined
  syncscroll:boolean
}

const { Text } = Typography;

const EditArea: React.FC<EditAreaProps> = (props) => {

  const lyc = props.lyc

  // 应该高亮的senlist下标
  const [nowind,setNowind]=useState<number>(0)
  // 时间不合法（非递增）的senlist下标
  const [errind,setErrind]=useState<number>(-1)


  /**
   * 重绘，使正在播放的歌曲高亮,时间错误的歌词红色
   */
   const updateNowSenUI=()=>{
    const nowPlaySec001:number=100*(props.song?.seek()||0)
    const nowPlayingInd:number=props.lyc.getNowLyricIndex(nowPlaySec001)
    setNowind(nowPlayingInd)
    const errInd:number=props.lyc.checkErrTime()
    setErrind(errInd)
    requestAnimationFrame(updateNowSenUI)
  }
  useEffect(()=>{
    updateNowSenUI()
  },[props.lyc,props.song])
  /**
   * 监听当前歌词切换
   */
  useEffect(()=>{
    if(props.syncscroll){
      animate({
        from: document.querySelector("#EditArea")?.scrollTop,
        to:(document.querySelector(".nowplaying") as HTMLDivElement)?.offsetTop-60,
        onUpdate:latest=>document.querySelector("#EditArea")?.scrollTo(0,latest)
      })
      console.log(document.querySelector("#EditArea")?.scrollTop)
      console.log((document.querySelector(".nowplaying") as HTMLDivElement)?.offsetTop)
    }
  },[nowind,props.syncscroll])

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
  /**
   * Sentence content
   */
  const setEditableSenCont = (ind: number, input: string) => {
    lyc.editsentence_content(ind, input)
    updateLyc(lyc)
  }

  /**
   * 在某一句下面加一句翻译,默认时间和上一句相同，默认内容为空
   */
  const addSentenceAfter=(ind:number)=>{
    lyc.addsentence(ind,new Sentence(100*(props.song?.seek()||0),""))
    updateLyc(lyc)
  }

    /**
   * 删除某一句
   */
     const delSentence=(ind:number)=>{
      lyc.deletesentence(ind)
      updateLyc(lyc)
    }

  /**
   * 替换Lyc，使页面重新渲染
   */
  const updateLyc = (oldlyc: Lyric): void => {
    const newlyc = new Lyric()
    newlyc.copy(oldlyc)
    props.setLyc(newlyc)
  }

  return (
    <div id="EditArea">
      <Timeline mode={"left"}>
        {lyc?.infolist.map((e, ind) => {
          return (<Timeline.Item key={ind} label={<Text style={{ width: '100px', float: "right" }} editable={{ onChange: (words) => setEditableInfoSub(ind, words), triggerType: ['text'], autoSize: true, enterIcon: null }}>{e.sub}</Text>}>
            <Text editable={{ onChange: (words) => setEditableInfoObj(ind, words), triggerType: ['text'], enterIcon: null }}>{e.obj}</Text>
          </Timeline.Item>)
        })}
        {lyc?.senlist.map((e, ind) => {
          return (<Timeline.Item 
            key={ind} 
            color={errind-1==ind?'orange':(errind==ind?'red':(nowind==ind?'green':'gray'))} 
            className={nowind==ind?'nowplaying senitem':'other senitem'} 
            label={
            <Text style={{ width: '90px', float: "right" }}
            editable={{ onChange: (words) => setEditableSenTime(ind, words), triggerType: ['text'], enterIcon: null }}
            >{fromtimeflag2str(e.start)}</Text>
          }
          dot={<RightCircleOutlined onClick={()=>{const totime=props.lyc?.senlist[ind]?.start/100;if(totime){props.song?.seek(totime)}}} />}
          >
            <Text editable={{ onChange: (words) => setEditableSenCont(ind, words), triggerType: ['text'], enterIcon: null }}>{e.content.length > 0 ? e.content : <div>&nbsp;</div>}</Text>
            <div className='senbuttons'>
              <Tag color={'blue'} style={{cursor:'pointer'}} onClick={()=>{
              addSentenceAfter(ind)
            }}>Add New</Tag>
            <Tag color={'red'} style={{cursor:'pointer'}} onClick={()=>{
              delSentence(ind)
            }}>Delete</Tag>
            </div>
          </Timeline.Item>)
        })}
      </Timeline>
    </div>
  );
};

export default EditArea