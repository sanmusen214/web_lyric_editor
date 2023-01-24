import React, { useState } from 'react'
import "./ToolsArea.css"
import { Button, Checkbox, Col, InputNumber, Row, Select, Switch, Tag } from 'antd'
import { Lyric, Sentence } from '../../../../utils/lyric'
import intl from "react-intl-universal"
import { Howl } from 'howler'

type ToolsAreaProps = {
  lyc: Lyric
  song: Howl|undefined
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

  const addlastsen=()=>{
    props.lyc.addsentence(-1,new Sentence(100*(props.song?.seek()||0),""))
    updateLyc(props.lyc)
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
        {intl.get("offset")}<InputNumber style={{ 'width': '90px' }} addonAfter="s" size='small' 
          value={props.lyc.offset}
          formatter={(value)=>{if(value){return value/100+""}return ""}}
          parser={(value)=>{if(value){return Number.parseFloat(value)*100}return 0}}
          precision={0}
          onChange={updateOffsettime}
          step={5} />
        </Row>
        <div style={{ 'height': '4px' }}></div>
        <Row justify={'end'}><Switch checked={props.syncscroll} onChange={(chk) => { props.setSyncscroll(chk) }}></Switch>{intl.get("sync-scroll")}</Row>
        <Row justify={'end'}><Tag style={{cursor:'pointer'}} onClick={addlastsen}>{intl.get("add-senline")}</Tag></Row>
      </Col>
    </div>
  )
}

export default ToolsArea