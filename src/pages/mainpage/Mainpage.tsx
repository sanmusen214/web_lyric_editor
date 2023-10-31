import React, { FC, useEffect, useState } from 'react'
import DataIO from './components/DataIO/DataIO'
import EditArea from './components/EditArea/EditArea'
import PlayerArea from './components/PlayerArea/PlayerArea'
import ToolsArea from './components/ToolsArea/ToolsArea'

import { Lyric } from '../../utils/lyric'
import { Howl } from 'howler'
import { message } from 'antd'

export default function Mainpage() {
  const [lyc, setLyc] = useState<Lyric>(new Lyric(false))
  // replaceSong
  const [song,setSong] = useState<Howl|undefined>()
  const [loadsongicon,setLoadsongicon] = useState<boolean>(false)
  const [syncscroll,setSyncscroll] = useState<boolean>(false)


  // 从localStorage里拿上次歌词
  useEffect(()=>{
    setLyc(new Lyric(true))
  },[])

  // 上传新歌曲的最后回调
  function replaceSong(newsong:Howl){
    song?.stop()
    setSong(newsong)
  }

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

  return (
    <div id="MainpageArea">
      <PlayerArea lyc={lyc} setLyc={setLyc} song={song} loadsongicon={loadsongicon}/>
      <DataIO lyc={lyc} setLyc={setLyc} song={song} replaceSong={replaceSong} loadsongicon={loadsongicon} setLoadsongicon={setLoadsongicon}/>
      <EditArea lyc={lyc} setLyc={setLyc} song={song} syncscroll={syncscroll}/>
      <ToolsArea lyc={lyc} song={song} setLyc={setLyc} syncscroll={syncscroll} setSyncscroll={setSyncscroll}/>
    </div>
  )
}

