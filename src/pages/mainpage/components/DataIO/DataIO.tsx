import React, { ChildContextProvider } from 'react'
import { UploadOutlined,FileOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';

import { Lyric, Sentence, create_from_LRC } from '../../../../utils/lyric';
import { fromLRCtime2flag } from '../../../../utils/sentenceparse';
import { upload } from '@testing-library/user-event/dist/upload';

import "./DataIO.css"

type DataIOProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
}

export default function DataIO(props: DataIOProps) {

    function uploadlyric(file:any){
        const isLRC = file.name.indexOf(".lrc") == file.name.length - 4
        if (!isLRC) {
            message.error(`${file.name} is not a LRC file`);
        } else {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const mylrc = create_from_LRC(reader.result + "")
                props.setLyc(mylrc)
            });
            reader.readAsText(file)
        }
        return false
    }

    function uploadmusic(file:any){
        return false
    }

    const createNewLyc=()=>{
        const newlyc = new Lyric()
        props.setLyc(newlyc)
    }

    return (<div id="DataIOArea">
        <Upload fileList={[]} accept='.lrc' beforeUpload={uploadlyric}>
            <Button icon={<UploadOutlined />}>Upload lyric</Button>
        </Upload>
        <div style={{"height":'5px'}}></div>
        <Upload fileList={[]} accept='.mp3' beforeUpload={uploadmusic}>
            <Button icon={<UploadOutlined />}>Upload music</Button>
        </Upload>
        <div style={{"height":'5px'}}></div>
        <Button icon={<FileOutlined />} onClick={createNewLyc}>New lyric</Button>
    </div>)
}