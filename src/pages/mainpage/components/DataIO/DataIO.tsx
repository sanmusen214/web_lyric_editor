import React, { ChildContextProvider } from 'react'
import { UploadOutlined, FileOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Col, Row, UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';

import { Info, Lyric, Sentence, create_from_LRC } from '../../../../utils/lyric';
import { Howl } from 'howler'
import "./DataIO.css"
import { RcFile } from 'antd/es/upload';

type DataIOProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
    song: Howl|undefined
    replaceSong: (song: Howl) => void
    loadsongicon: boolean
    setLoadsongicon: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DataIO(props: DataIOProps) {

    function uploadlyric(file: RcFile) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const mylrc = create_from_LRC(reader.result + "")
            props.setLyc(mylrc)
        });
        reader.readAsText(file)
        return false
    }

    function uploadmusic(file: RcFile) {
        const reader = new FileReader();
        props.setLoadsongicon(true)
        reader.addEventListener('load', () => {
            return new Promise((resolve) => {
                const res = reader.result
                if (typeof (res) === "string") {
                    const song = new Howl({
                        src: res,
                        format: file.name.split(".").pop()?.toLowerCase()
                    })
                    song.on("load", () => {
                        props.replaceSong(song)
                    })
                    resolve(song)
                }
            }).then((song) => {
                props.setLoadsongicon(false)
            })
        });
        reader.readAsDataURL(file)
        return false
    }

    const createNewLyc = () => {
        const newlyc = new Lyric(false)
        newlyc.addblank_sentence(-1,0)
        newlyc.addinfo(-1,new Info("",""))
        props.setLyc(newlyc)
    }

    const downloadLyc = () => {
        // 要保存的字符串
        const stringData = props.lyc.toLyc()
        // dada 表示要转换的字符串数据，type 表示要转换的数据格式
        const blob = new Blob([stringData], {
            type: "text/plain;charset=utf-8"
        })
        // 根据 blob生成 url链接
        const objectURL = URL.createObjectURL(blob)

        // 创建一个 a 标签Tag
        const aTag = document.createElement('a')
        // 设置文件的下载地址
        aTag.href = objectURL
        // 设置保存后的文件名称
        aTag.download = "yourlrc.lrc"
        // 给 a 标签添加点击事件
        aTag.click()
        // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
        // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
        URL.revokeObjectURL(objectURL)

    }

    return (<div id="DataIOArea">
        <Col>
            <Row justify={'start'}>
                <Upload fileList={[]} accept='.mp3,.flac,.mp4,.flv' beforeUpload={uploadmusic}>
                    <Button style={props?.song?{}:{'color':'green'}} icon={<UploadOutlined />}>Upload music</Button>
                </Upload>
            </Row>
            <div style={{ 'height': '24px' }}></div>
            <Row justify={'start'} className='hovershow'>
                <Upload className='conshow' fileList={[]} accept='.lrc' beforeUpload={uploadlyric}>
                    <Button  style={props?.lyc.senlist.length==0?{'color':'green'}:{}}  icon={<UploadOutlined />}>Upload lyric</Button>
                </Upload>
                <div style={{'width':'4px'}}></div>
                <Button icon={<FileOutlined />} style={props?.lyc.senlist.length==0?{'color':'green'}:{}} onClick={createNewLyc}>New lyric</Button>
            </Row>
            <div style={{ 'height': '24px' }}></div>
            <Row justify={'start'}>
                <Button icon={<VerticalAlignBottomOutlined />} onClick={downloadLyc}>Download Lyc</Button>
            </Row>
        </Col>
    </div>)
}