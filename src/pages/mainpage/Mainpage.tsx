import React, { FC, useEffect, useState } from 'react'
import DataIO from './components/DataIO/DataIO'
import EditArea from './components/EditArea/EditArea'
import PlayerArea from './components/PlayerArea/PlayerArea'
import ToolsArea from './components/ToolsArea/ToolsArea'

import { Lyric } from '../../utils/lyric'

export default function Mainpage() {

  const [lyc, setLyc] = useState<Lyric>(new Lyric(true))

  const [timep,setTimep]=useState<number>(0)

  useEffect(() => {
    localStorage.setItem("cachelyric",JSON.stringify(lyc.toJSON()))
  }, [lyc])

  return (
    <div id="MainpageArea">
      <PlayerArea lyc={lyc} setLyc={setLyc} />
      <DataIO lyc={lyc} setLyc={setLyc} />
      <EditArea lyc={lyc} setLyc={setLyc} />
      <ToolsArea lyc={lyc} setLyc={setLyc} />
    </div>
  )
}

