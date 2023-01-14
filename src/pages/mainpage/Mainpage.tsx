import React, { FC, useEffect, useState } from 'react'
import DataIO from './components/DataIO/DataIO'
import EditArea from './components/EditArea/EditArea'
import PlayerArea from './components/PlayerArea/PlayerArea'
import ToolsArea from './components/ToolsArea/ToolsArea'

import { Lyric } from '../../utils/lyric'
import { Howl } from 'howler'

export default function Mainpage() {

  const [lyc, setLyc] = useState<Lyric>(new Lyric(true))
  const [song,setSong] = useState<Howl|undefined>()
  const [syncscroll,setSyncscroll] = useState<boolean>(false)

  // 上传新歌曲的最后回调
  function replaceSong(newsong:Howl){
    song?.stop()
    setSong(newsong)
  }

  // 实时保存当前歌词到localstorage
  useEffect(() => {
    localStorage.setItem("cachelyric",JSON.stringify(lyc.toJSON()))
  }, [lyc])

  return (
    <div id="MainpageArea">
      <PlayerArea lyc={lyc} setLyc={setLyc} song={song} />
      <DataIO lyc={lyc} setLyc={setLyc} replaceSong={replaceSong}/>
      <EditArea lyc={lyc} setLyc={setLyc} song={song} />
      <ToolsArea lyc={lyc} setLyc={setLyc} syncscroll={syncscroll} setSyncscroll={setSyncscroll}/>
    </div>
  )
}

