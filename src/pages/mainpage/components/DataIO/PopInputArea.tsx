import { Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React, { useEffect, useState } from 'react'
import { Lyric, create_from_TXT } from '../../../../utils/lyric'

type PopInputAreaProps={
    drawopen:boolean
    setLyc:React.Dispatch<React.SetStateAction<Lyric>>
}

export const PopInputArea = (props:PopInputAreaProps) => {


    const [text,setText]=useState<string>("")

    useEffect(()=>{
        setText("")
    },[props.drawopen])

    const handleSubmit=()=>{
        props.setLyc(create_from_TXT(text))
    }

  return (<>
    <TextArea autoSize value={text} onChange={(e)=>setText(e.target.value)}></TextArea>
    <Button onClick={handleSubmit}>Submit</Button>
    </>
  )
}
