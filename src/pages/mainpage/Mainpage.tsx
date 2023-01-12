import React, { FC, useEffect, useState } from 'react'
import DataIO from './components/DataIO'
import EditArea from './components/EditArea/EditArea'
import { Lyric } from '../../utils/lyric'

export default function Mainpage() {

  const [lyc, setLyc] = useState<Lyric>(new Lyric())

  useEffect(() => {
    console.log("Effect", lyc)
  }, [lyc])

  return (
    <div>
      <DataIO lyc={lyc} setLyc={setLyc} />
      <EditArea lyc={lyc} setLyc={setLyc} />
    </div>
  )
}

