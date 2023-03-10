import React, { ChildContextProvider, useState } from 'react'
import { CloudDownloadOutlined, UploadOutlined, FileOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Col, Drawer, Popconfirm, Row, UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';
import { PopInputArea } from './PopInputArea';
import { Info, Lyric, Sentence, create_from_LRC } from '../../../../utils/lyric';
import { Howl } from 'howler'
import "./DataIO.css"
import { RcFile } from 'antd/es/upload';

import intl from 'react-intl-universal'

type DataIOProps = {
    lyc: Lyric
    setLyc: React.Dispatch<React.SetStateAction<Lyric>>
    song: Howl | undefined
    replaceSong: (song: Howl) => void
    loadsongicon: boolean
    setLoadsongicon: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DataIO(props: DataIOProps) {

    const [drawopen,setDrawopen]=useState<boolean>(false)

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
        newlyc.addblank_sentence(-1, 0)
        newlyc.addinfo(-1, new Info("", ""))
        props.setLyc(newlyc)

    }

    const downloadLyc = () => {
        // ?????????????????????
        const stringData = props.lyc.toLyc()
        // dada ????????????????????????????????????type ??????????????????????????????
        const blob = new Blob([stringData], {
            type: "text/plain;charset=utf-8"
        })
        // ?????? blob?????? url??????
        const objectURL = URL.createObjectURL(blob)

        // ???????????? a ??????Tag
        const aTag = document.createElement('a')
        // ???????????????????????????
        aTag.href = objectURL
        // ??????????????????????????????
        aTag.download = "yourlrc.lrc"
        // ??? a ????????????????????????
        aTag.click()
        // ???????????????????????????????????????????????? URL.createObjectURL() ????????? URL ?????????
        // ???????????????????????? URL ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        URL.revokeObjectURL(objectURL)

    }


    return (<div id="DataIOArea">
        <Col>
            <Row justify={'start'}>
                <Upload fileList={[]} accept='.mp3,.flac,.mp4,.flv' beforeUpload={uploadmusic}>
                    <Button style={props?.song ? {} : { 'color': 'green' }} icon={<UploadOutlined />}>{intl.get("upload-music")}</Button>
                </Upload>
            </Row>
            <div style={{ 'height': '24px' }}></div>
            <Row justify={'start'} className='hovershow'>
                <Upload className='conshow' fileList={[]} accept='.lrc' beforeUpload={uploadlyric}>
                    <Button style={props?.lyc.senlist.length == 0 ? { 'color': 'green' } : {}} icon={<UploadOutlined />}>{intl.get("upload-lyric")}</Button>
                </Upload>
                <div style={{ 'width': '4px' }}></div>
                <Button icon={<CloudDownloadOutlined />} onClick={()=>setDrawopen(true)}>{intl.get("upload-sens")}</Button>
                <div style={{ 'width': '4px' }}></div>
                <Button icon={<CloudDownloadOutlined />} onClick={() => { window.open("https://music.liuzhijin.cn/") }}>{intl.get("find-lyric")}</Button>
            </Row>
            <div style={{ 'height': '4px' }}></div>
            <Row>
                <Popconfirm
                    title={intl.get("create-lyric")}
                    description={intl.get("create-new-warn")}
                    onCancel={createNewLyc}
                    okText={intl.get("no")}
                    cancelText={intl.get("yes")}
                    placement="topLeft"
                >
                    <Button icon={<FileOutlined />} style={props?.lyc.senlist.length == 0 ? { 'color': 'green' } : {}}>{intl.get("create-lyric")}</Button>
                </Popconfirm>
            </Row>
            <div style={{ 'height': '24px' }}></div>
            <Row justify={'start'}>
                <Button icon={<VerticalAlignBottomOutlined />} onClick={downloadLyc}>{intl.get("download-lyric")}</Button>
            </Row>
        </Col>
        <Drawer 
        title={intl.get("upload-sens")}
        onClose={()=>setDrawopen(false)}
        open={drawopen}
        placement="left"
        >
            <PopInputArea drawopen={drawopen} setLyc={props.setLyc}/>
        </Drawer>

    </div>)
}