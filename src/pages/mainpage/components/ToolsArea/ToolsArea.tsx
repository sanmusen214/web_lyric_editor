import React, { useState } from 'react'
import "./ToolsArea.css"
import { Button, Checkbox, Col, InputNumber, Row, Select, Switch } from 'antd'
import { Lyric } from '../../../../utils/lyric'

type ToolsAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  syncscroll: boolean
  setSyncscroll: React.Dispatch<React.SetStateAction<boolean>>
}
const { Option } = Select
const selectBefore = (
  <Select defaultValue="add" style={{ width: 60 }}>
    <Option value="add">+</Option>
    <Option value="minus">-</Option>
  </Select>
)

const ToolsArea: React.FC<ToolsAreaProps> = (props) => {

  const updateOffsettime = (time: number | null) => {
    // console.log(time)
    if (typeof(time)==="number") {
      props.lyc.setoffset(time)
      updateLyc(props.lyc)
    }
  }

  /**
 * 替换Lyc，使页面重新渲染
 */
  const updateLyc = (oldlyc: Lyric): void => {
    const newlyc = new Lyric(false)
    newlyc.copy(oldlyc)
    props.setLyc(newlyc)
  }

  return (
    <div id="ToolsArea">
      <Col>
        <Row justify={'end'}>
          Set offset:<InputNumber style={{ 'width': '90px' }} addonAfter="s" size='small' 
          value={props.lyc.offset}
          //  formatter={(value)=>{if(value){return ""+value/100};return "error"}} 
          precision={0}
           onChange={updateOffsettime}
           step={10} />
        </Row>
        <div style={{ 'height': '4px' }}></div>
        <Row justify={'end'}><Switch checked={props.syncscroll} onChange={(chk) => { props.setSyncscroll(chk) }}></Switch>Sync scroll</Row>
      </Col>
    </div>
  )
}

export default ToolsArea