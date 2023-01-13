import React from 'react'
import "./ToolsArea.css"
import { Button } from 'antd'
import { Lyric } from '../../../../utils/lyric'

type ToolsAreaProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
}

const ToolsArea:React.FC<ToolsAreaProps> = (props) => {
  return (
    <div id="ToolsArea">
        <Button>EditAll</Button>
    </div>
  )
}

export default ToolsArea