import React, { IframeHTMLAttributes, useRef, useState } from 'react'
import './TestPage.css'

import intl from 'react-intl-universal'
import { Button } from 'antd'


export default function TestPage() {
  const [word,setWord]=useState<string>("")
  const _iframe=useRef<HTMLIFrameElement>(null)

  const clickme=()=>{
    const biliwin:Window | null | undefined=_iframe.current?.contentWindow
  }

  return (
    <div id="testbox">
      <iframe id="ifm" ref={_iframe} style={{width:"720px",height:"470px"}} src="//player.bilibili.com/player.html?aid=348755670&bvid=BV1cR4y1k7HL&cid=925305885&page=1"> </iframe>
      <Button onClick={clickme}>看一看</Button>
      {word}
    </div>
  )
}

