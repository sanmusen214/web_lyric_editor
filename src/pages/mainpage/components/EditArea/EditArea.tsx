import React, { KeyboardEvent, useEffect, useState } from 'react';
import { Button, RadioChangeEvent, Row, Tag } from 'antd';
import { Radio, Timeline, Typography } from 'antd';
import { Info, Lyric, Sentence } from '../../../../utils/lyric';
import { fromtimeflag2str } from '../../../../utils/sentenceparse';
import "./EditArea.css"
import { Howl } from 'howler';
import { animate } from 'popmotion';
import { RightCircleOutlined } from '@ant-design/icons'


type EditAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song: Howl | undefined
  syncscroll: boolean
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
        onUpdate: latest => document.querySelector("#EditArea")?.scrollTo(0, latest)
      })
    }
  }, [nowind, props.syncscroll])

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

  const oneditover=(ind:number)=>{
    if(ind==props.lyc.senlist.length-1){
      addSentenceAfter(-1)
    }
  }

  return (
    <div id="EditArea">
      {props.lyc?.infolist.length == 0 ?<div style={{ 'textAlign': 'center', marginBottom: '20px' }}><Tag style={{ cursor: 'pointer' }} onClick={() => addInfoAfter(-1)}>add info</Tag></div> : <></>
      }
      {props.lyc?.senlist.length == 0 ? <div style={{ 'textAlign': 'center', marginBottom: '20px' }}>
        <Tag style={{ cursor: 'pointer' }} onClick={() => addSentenceAfter(-1)}>add sen</Tag>
      </div> : <></>}



      <Timeline mode={"left"}>
        {lyc?.infolist.map((e, ind) => {
          return (<Timeline.Item
            key={ind}
            label={
              <Text style={{ width: '100px', float: "right" }}
                editable={{ onChange: (words) => setEditableInfoSub(ind, words), triggerType: ['text'], autoSize: true, enterIcon: null }}>{e.sub ? e.sub : <div>&nbsp;</div>}</Text>}
            className="infoitem"
          >
            <Text editable={{ onChange: (words) => setEditableInfoObj(ind, words), triggerType: ['text'], enterIcon: null }}>{e.obj ? e.obj : <div>&nbsp;</div>}</Text>
            <div className='infobuttons'>
              <Tag color={'blue'} style={{ cursor: 'pointer' }} onClick={() => {
                addInfoAfter(ind)
              }}>Add New</Tag>
              <Tag color={'red'} style={{ cursor: 'pointer' }} onClick={() => {
                delInfo(ind)
              }}>Delete</Tag>
            </div>
          </Timeline.Item>)
        })}
        {lyc?.senlist.map((e, ind) => {
          return (<Timeline.Item
            key={ind}
            color={errind - 1 == ind ? 'orange' : (errind == ind ? 'red' : (nowind == ind ? 'green' : 'gray'))}
            className={nowind == ind ? 'nowplaying senitem' : 'other senitem'}
            label={
              <Text style={{ width: '90px', float: "right" }}
                editable={{ onChange: (words) => setEditableSenTime(ind, words), triggerType: ['text'], enterIcon: null }}
              >{fromtimeflag2str(e.start)}</Text>
            }
            dot={<RightCircleOutlined style={ind == nowind ? { fontSize: '1.5rem', transform: 'translateY(16%)' } : { transform: 'translateY(5%)' }} onClick={() => { const totime = props.lyc?.senlist[ind]?.start / 100; if (totime) { props.song?.seek(totime) } }} />}
          >
            <Text
              editable={{ onChange: (words) => setEditableSenCont(ind, words), triggerType: ['text'], enterIcon: null, onEnd:()=>{oneditover(ind)} }}
              style={{ fontSize: '1.2rem' }}
            >{e.content.length > 0 ? e.content : <div>&nbsp;</div>}</Text>
            <div className='senbuttons'>
              <Tag color={'blue'} style={{ cursor: 'pointer' }} onClick={() => {
                addSentenceAfter(ind)
              }}>Add New</Tag>
              <Tag color={'red'} style={{ cursor: 'pointer' }} onClick={() => {
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