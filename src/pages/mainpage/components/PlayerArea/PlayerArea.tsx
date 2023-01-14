import React, { ReactNode, useEffect, useRef, useState } from 'react'
import "./PlayerArea.css"
import { Lyric } from '../../../../utils/lyric'
import { Howl, Howler } from 'howler'
import { Button, Col, Row, Slider, message } from 'antd'
import {PauseOutlined,CaretRightOutlined} from '@ant-design/icons'
import { fromtimeflag2str } from '../../../../utils/sentenceparse'
import { Formatter } from 'antd/es/slider'

type PlayerAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song:Howl|undefined
}

// 发生歌曲时间变化时，先变化时间。然后在渲染时用歌曲现在时间渲染进度条

/**
 * （默认获取进度条当前所在位置百分比from 0-1）,有event的话就获取鼠标对应的进度条百分比
 */
const getMusicUIPercent = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
  const progressbar = document.querySelector("#playerprogress-bar")
  const progressnow = document.querySelector("#playernow")
  if (progressbar && progressnow) {
    let left: number = 0
    if (e) {
      left = e.clientX - progressbar.getBoundingClientRect().x
    } else {
      left = progressnow.clientWidth
    }
    const total: number = progressbar.clientWidth
    return Math.max(Math.min(1, left / total), 0)
  }
  return 0
}

/**
 * 改变进度条UI位置,barprecent from 0 to 1
 */
export const changeBarNow=(barprecent:number)=>{
  const progressnow: HTMLImageElement | null = document.querySelector("#playernow")
  if (progressnow) {
    progressnow.style.width = `${barprecent * 100}%`
  }
}

const PlayerArea: React.FC<PlayerAreaProps> = (props) => {

  let [isDrag,setIsDrag] = useState<boolean>(false);
  let volume:number=0.3;
  let [playicon,setPlayIcon]=useState<"play"|"pause">("pause")


  // 播放完自动暂停自动切换图标
  props.song?.on("end",()=>{
    setPlayIcon("pause")
  })

  // Animation实时改变进度条位置
  const updateBar=()=>{
    changeBarNow((props.song?.seek()||0)/(props.song?.duration()||1))
    const nstr=document.querySelector("#nowtimestr")
    if(nstr){
      nstr.innerHTML=fromtimeflag2str((props.song?.seek()||0)*100)
    }
    requestAnimationFrame(updateBar)
  }
  useEffect(()=>{
    updateBar()
  },[props.song])

  // 拖拽时静音，然后取消拖拽时复原
  useEffect(()=>{
    console.log(isDrag)
    if(isDrag){
      props.song?.volume(0)
    }else{
      props.song?.volume(volume)
    }
  },[isDrag])

  /**
 * 拖进度条后，获取进度百分比，改变音乐时间
 */
  const dragBarNow: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const percent = getMusicUIPercent(e)
    props.song?.seek(percent*props.song?.duration())
  }

  // 点击播放/暂停按钮
  const playstopsong=()=>{
    if(!props.song){
      message.warning("please upload song")
      return
    }
    props.song?.volume(volume)
    if(props.song?.playing()){
      props.song?.pause()
      setPlayIcon("pause")
    }else{
      props.song?.play()
      setPlayIcon("play")
    }
  }

  const onVolChange=(e:number)=>{
    props.song?.volume(e)
  }

  const sliderformatter:Formatter=(value:number|undefined)=>{
    return `${Math.floor((value||0)*100)}%`
  }

  return (
    <div id="PlayerArea" onMouseLeave={() => { setIsDrag(false)}} onMouseMove={(e) => { if (isDrag) { dragBarNow(e) } }} onMouseUp={() => { setIsDrag(false)}}>
    <div id="playerprogress">
      <div id="playerprogress-bar" onMouseDown={(e) => { setIsDrag(true); dragBarNow(e)}}>
        <div id="playernow"></div>
      </div>
      <div id="buttonsArea">
        <Row align={'middle'} justify={'space-between'}>
        <span id="nowtimestr"></span>
        <Button onClick={playstopsong}>{playicon==="play"?<><PauseOutlined /></>:<><CaretRightOutlined /></>}</Button>
        <Col span={8}>Volume:<Slider style={{width:'100%'}} tooltip={{formatter:sliderformatter}} defaultValue={0.3} step={0.01} max={1.2} onChange={onVolChange}/></Col>
        </Row>
        
      </div>
    </div>

      
    </div>
  )
}

export default PlayerArea