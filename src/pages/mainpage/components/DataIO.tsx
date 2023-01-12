import React, { ChildContextProvider } from 'react'
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';

import { Lyric, Sentence, create_from_LRC } from '../../../utils/lyric';
import { fromLRCtime2flag } from '../../../utils/sentenceparse';

const props: UploadProps = {
    action: "",
    beforeUpload: (file) => {
        const isLRC = file.name.indexOf(".lrc") == file.name.length - 4
        if (!isLRC) {
            message.error(`${file.name} is not a LRC file`);
        } else {

        }
        return false
    },
    onChange: (info) => {
        console.log(info.fileList);
    },
};

type DataIOProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
}


export default function DataIO(props: DataIOProps) {
    return (<>
        <Upload fileList={[]} beforeUpload={(file) => {
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
        }}>
            <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
    </>)
}