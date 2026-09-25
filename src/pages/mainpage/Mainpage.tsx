import React, { useEffect, useRef, useState } from 'react'
import './Mainpage.css'
import DataIO from './components/DataIO/DataIO'
import EditArea from './components/EditArea/EditArea'
import PlayerArea from './components/PlayerArea/PlayerArea'
import ToolsArea from './components/ToolsArea/ToolsArea'

import { Lyric } from '../../utils/lyric'
import { Howl } from 'howler'
import { Button, message, Tooltip } from 'antd'
import { EyeInvisibleOutlined, EyeOutlined, GithubOutlined } from '@ant-design/icons'
import { WaveformData } from '../../utils/audio'
import intl from 'react-intl-universal'

export default function Mainpage() {
  const [lyc, setLyc] = useState<Lyric>(new Lyric(false))
  // replaceSong
  const [song,setSong] = useState<Howl|undefined>()
  const [loadsongicon,setLoadsongicon] = useState<boolean>(false)
  const [syncscroll,setSyncscroll] = useState<boolean>(false)
  const [waveform, setWaveform] = useState<WaveformData | undefined>()
  const [showSideControls, setShowSideControls] = useState<boolean>(true)
  const songUrlRef = useRef<string>()
  const songRef = useRef<Howl>()


  // 从localStorage里拿上次歌词
  useEffect(()=>{
    setLyc(new Lyric(true))
  },[])

  // 上传新歌曲的最后回调
  function replaceSong(newsong: Howl, objectUrl: string){
    song?.unload()
    if (songUrlRef.current) URL.revokeObjectURL(songUrlRef.current)
    songUrlRef.current = objectUrl
    songRef.current = newsong
    setSong(newsong)
  }

  useEffect(() => () => {
    songRef.current?.unload()
    if (songUrlRef.current) URL.revokeObjectURL(songUrlRef.current)
  }, [])

  // 上传提示
  useEffect(()=>{
    if(loadsongicon){
      message.loading({content:"Loading Music...",key:"loadsongicon",duration:0})
    }else{
      message.destroy("loadsongicon")
    }
  },[loadsongicon])

  // 如果当前歌词内有东西（避免由useState引起的保存），保存当前歌词到localstorage
  useEffect(() => {
    if(lyc.senlist.length!==0 || lyc.infolist.length!==0){
      console.log("Store Newwest lyc: ",lyc)
      localStorage.setItem("cachelyric",JSON.stringify(lyc.toJSON()))
    }
  }, [lyc])

  // // Ctrl + H 快捷键，focus当前歌曲时间对应的歌词
  // const focusNowSen:React.KeyboardEventHandler<HTMLDivElement> = (e) => {
  //   console.log("Focus", e)
  //   if (e.key.toUpperCase() === 'H' && e.ctrlKey) {
  //     e.preventDefault()
  //     const nowPlaySec001: number = 100 * (song?.seek() || 0)
  //     const nowPlayingInd: number = lyc.getNowLyricIndex(nowPlaySec001)
  //     // 将光标移到新的一行
  //     if (nowPlayingInd<0 || nowPlayingInd>=lyc.senlist.length) return
  //     // 找到第ind个conshow
  //     const ele: HTMLElement = document.querySelectorAll('.conshow')[nowPlayingInd] as HTMLElement
  //     ele.focus()
  //   }
  // }

  return (
    <div id="MainpageArea" className={showSideControls ? '' : 'side-controls-hidden'}>
      <Tooltip title="GitHub">
        <Button className="github-button" type="text" aria-label="GitHub" icon={<GithubOutlined />} onClick={()=>{window.open("https://github.com/sanmusen214/web_lyric_editor", "_blank", "noopener,noreferrer")}} />
      </Tooltip>
      <PlayerArea lyc={lyc} setLyc={setLyc} song={song} loadsongicon={loadsongicon} waveform={waveform}/>
      <DataIO lyc={lyc} setLyc={setLyc} song={song} replaceSong={replaceSong} setWaveform={setWaveform} loadsongicon={loadsongicon} setLoadsongicon={setLoadsongicon}/>
      <EditArea lyc={lyc} setLyc={setLyc} song={song} syncscroll={syncscroll}/>
      <ToolsArea lyc={lyc} song={song} setLyc={setLyc} syncscroll={syncscroll} setSyncscroll={setSyncscroll}/>
      <Tooltip title={showSideControls ? intl.get('hide-side-controls') : intl.get('show-side-controls')} placement="right">
        <Button className="side-controls-toggle" shape="circle"
          aria-label={showSideControls ? intl.get('hide-side-controls') : intl.get('show-side-controls')}
          icon={showSideControls ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowSideControls(value => !value)} />
      </Tooltip>
    </div>
  )
}

