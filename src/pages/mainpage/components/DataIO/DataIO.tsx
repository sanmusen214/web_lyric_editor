import React, { ChildContextProvider } from 'react'
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';

import { Lyric, Sentence, create_from_LRC } from '../../../../utils/lyric';
import { Howl} from 'howler'
import "./DataIO.css"
import { RcFile } from 'antd/es/upload';

type DataIOProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
    replaceSong:(song:Howl)=>void
}

export default function DataIO(props: DataIOProps) {

    function uploadlyric(file: RcFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const mylrc = create_from_LRC(reader.result + "")
                props.setLyc(mylrc)
            });
            reader.readAsText(file)
    }

    function uploadmusic(file: RcFile) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const res = reader.result
            if (typeof (res) === "string") {
                const song = new Howl({
                    src: res,
                    format: file.name.split(".").pop()?.toLowerCase()
                })
                props.replaceSong(song)
            }
        });
        reader.readAsDataURL(file)
    }

    const createNewLyc = () => {
        const newlyc = new Lyric()
        props.setLyc(newlyc)
    }

    return (<div id="DataIOArea">
        <Upload fileList={[]} accept='.lrc' beforeUpload={uploadlyric}>
            <Button icon={<UploadOutlined />}>Upload lyric</Button>
        </Upload>
        <div style={{ "height": '5px' }}></div>
        <Upload fileList={[]} accept='.mp3' beforeUpload={uploadmusic}>
            <Button icon={<UploadOutlined />}>Upload music</Button>
        </Upload>
        <div style={{ "height": '5px' }}></div>
        <Button icon={<FileOutlined />} onClick={createNewLyc}>New lyric</Button>
    </div>)
}