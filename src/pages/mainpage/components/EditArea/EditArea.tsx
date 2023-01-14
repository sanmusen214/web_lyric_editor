import React, { useEffect, useState } from 'react';
import type { RadioChangeEvent } from 'antd';
import { Radio, Timeline, Typography } from 'antd';
import { Info, Lyric } from '../../../../utils/lyric';
import { fromtimeflag2str } from '../../../../utils/sentenceparse';
import "./EditArea.css"
import { Howl } from 'howler';


type EditAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song:Howl|undefined
}

const { Text } = Typography;

const EditArea: React.FC<EditAreaProps> = (props) => {

  const lyc = props.lyc

  // 应该高亮的senlist下标
  const [nowind,setNowind]=useState<number>(0)


  /**
   * 重绘，使正在播放的歌曲高亮
   */
   const updateNowSenUI=()=>{
    const nowPlaySec001:number=100*(props.song?.seek()||0)
    const nowPlayingInd:number=props.lyc.getNowLyricIndex(nowPlaySec001)
    setNowind(nowPlayingInd)
    requestAnimationFrame(updateNowSenUI)
  }
  useEffect(()=>{
    updateNowSenUI()
  },[props.lyc,props.song])
  /**
   * 监听当前歌词切换
   */
  useEffect(()=>{
    console.log(nowind)
  },[nowind])

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
          return (<Timeline.Item key={e.sub} label={<Text style={{ width: '100px', float: "right" }} editable={{ onChange: (words) => setEditableInfoSub(ind, words), triggerType: ['text'], autoSize: true, enterIcon: null }}>{e.sub}</Text>}>
            <Text editable={{ onChange: (words) => setEditableInfoObj(ind, words), triggerType: ['text'], enterIcon: null }}>{e.obj}</Text>
          </Timeline.Item>)
        })}
        {lyc?.senlist.map((e, ind) => {
          return (<Timeline.Item key={e.start} color={nowind==ind?'green':'gray'} label={
            <Text style={{ width: '90px', float: "right" }} editable={{ onChange: (words) => setEditableSenTime(ind, words), triggerType: ['text'], enterIcon: null }}>{fromtimeflag2str(e.start)}</Text>
          }>
            <Text editable={{ onChange: (words) => setEditableSenCont(ind, words), triggerType: ['text'], enterIcon: null }}>{e.content.length > 0 ? e.content : <div>&nbsp;</div>}</Text>
          </Timeline.Item>)
        })}
      </Timeline>
    </div>
  );
};

export default EditArea