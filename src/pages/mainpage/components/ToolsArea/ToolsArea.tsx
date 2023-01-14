import React from 'react'
import "./ToolsArea.css"
import { Button, Checkbox, Col, Row } from 'antd'
import { Lyric } from '../../../../utils/lyric'

type ToolsAreaProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
    syncscroll:boolean
    setSyncscroll:React.Dispatch<React.SetStateAction<boolean>>
}

const ToolsArea:React.FC<ToolsAreaProps> = (props) => {
  return (
    <div id="ToolsArea">
        <Col>
        <Row ><Button>EditAll</Button></Row>
        <Row><Checkbox checked={props.syncscroll} onChange={(e)=>{props.setSyncscroll(e.target.checked)}}>Sync scroll</Checkbox></Row>
        </Col>
    </div>
  )
}

export default ToolsArea