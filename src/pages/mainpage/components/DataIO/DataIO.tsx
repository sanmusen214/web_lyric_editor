import React, { useState } from 'react'
import { CloudDownloadOutlined, UploadOutlined, FileOutlined, VerticalAlignBottomOutlined, CopyOutlined } from '@ant-design/icons';
import { Col, Popconfirm, Row } from 'antd';
import Drawer from 'antd/es/drawer';
import { Button, message, Upload } from 'antd';
import { PopInputArea } from './PopInputArea';
import { Info, Lyric, create_from_LRC } from '../../../../utils/lyric';
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

    const [drawopen, setDrawopen] = useState<boolean>(false)
    const [uploadedFileName, setUploadedFileName] = useState<string>("")

    const [showUploadButtons, setShowUploadButtons] = useState<boolean>(false)
    const [showDownloadButtons, setShowDownloadButtons] = useState<boolean>(false)
    const [showCopyButtons, setShowCopyButtons] = useState<boolean>(false)

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
        let fileNameSplit = file.name.split(".")
        // 删掉文件名后缀
        fileNameSplit.pop()
        setUploadedFileName(fileNameSplit.join("."))

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

    const downloadLyc = (twin: boolean) => {
        let stringData;
        if (twin === false) {
            // 要保存的字符串
            stringData = props.lyc.toLyc()
        } else {
            stringData = props.lyc.toTwinLyc()
        }
        // data 表示要转换的字符串数据，type 表示要转换的数据格式
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
        aTag.download = (uploadedFileName || "yourlrc") + ".lrc"
        // 给 a 标签添加点击事件
        aTag.click()
        // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
        // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
        URL.revokeObjectURL(objectURL)

    }

    // ---
    // thanks https://segmentfault.com/a/1190000042057110
    async function copyToClipboard(text: string) {
        try {
            return await navigator.clipboard.writeText(text)
        } catch {
            const element = document.createElement('textarea')
            const previouslyFocusedElement = document.activeElement

            element.value = text

            // Prevent keyboard from showing on mobile
            element.setAttribute('readonly', '')

            element.style.contain = 'strict'
            element.style.position = 'absolute'
            element.style.left = '-9999px'
            element.style.fontSize = '12pt' // Prevent zooming on iOS

            const selection = document.getSelection()
            const originalRange = selection
                ? selection.rangeCount > 0 && selection.getRangeAt(0)
                : null

            document.body.appendChild(element)
            element.select()

            // Explicit selection workaround for iOS
            element.selectionStart = 0
            element.selectionEnd = text.length

            document.execCommand('copy')
            document.body.removeChild(element)

            if (originalRange) {
                selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
                selection!.addRange(originalRange)
            }

            // Get the focus back on the previously focused element, if any
            if (previouslyFocusedElement) {
                ; (previouslyFocusedElement as HTMLElement).focus()
            }
        }
    }

    const copyLyc = (twin: boolean) => {
        let stringData;
        if (twin === false) {
            // 要保存的字符串
            stringData = props.lyc.toLyc()
        } else {
            stringData = props.lyc.toTwinLyc()
        }
        copyToClipboard(stringData).then(() => {
            message.success(intl.get("copy-success"))
        }).catch(() => {
            message.error(intl.get("copy-fail"))
        })
    }

    return (<div id="DataIOArea">
        <Col>
            <Row justify={'start'}>
                <Upload fileList={[]} beforeUpload={uploadmusic}>
                    <Button style={props?.song ? {} : { 'color': 'green' }} icon={<UploadOutlined />}>{intl.get("upload-music")}</Button>
                </Upload>
            </Row>
            {/* 文字超过10个自动缩略 */}
            <div style={{ 'height': '24px', 'width': '8em', 'overflow': 'hidden', 'textOverflow': 'ellipsis', 'whiteSpace': 'nowrap' }}>{uploadedFileName}</div>
            <Row justify={'start'}
                onMouseEnter={() => setShowUploadButtons(true)}
                onMouseLeave={() => setShowUploadButtons(false)}
            >
                <Upload fileList={[]} accept='.lrc' beforeUpload={uploadlyric}>
                    <Button style={props?.lyc.senlist.length == 0 ? { 'color': 'green' } : {}} icon={<UploadOutlined />}>{intl.get("upload-lyric")}</Button>
                </Upload>
                {showUploadButtons ? <><div style={{ 'width': '4px' }}></div>
                    <Button icon={<CloudDownloadOutlined />} onClick={() => setDrawopen(true)}>{intl.get("upload-sens")}</Button>
                    <div style={{ 'width': '4px' }}></div>
                    <Button icon={<CloudDownloadOutlined />} onClick={() => { window.open("https://music.liuzhijin.cn/") }}>{intl.get("find-lyric")}</Button></> : <></>}


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
                    <Button icon={<FileOutlined />} style={props?.lyc.senlist.length === 0 ? { 'color': 'green' } : {}}>{intl.get("create-lyric")}</Button>
                </Popconfirm>
            </Row>
            <div style={{ 'height': '24px' }}></div>
            <Row justify={'start'}
                onMouseEnter={() => setShowDownloadButtons(true)}
                onMouseLeave={() => setShowDownloadButtons(false)}
            >
                <Button
                    icon={<VerticalAlignBottomOutlined />}
                    onClick={() => downloadLyc(false)}
                >
                    {intl.get("download-lyric")}
                </Button>

                {showDownloadButtons && (
                    <>
                        <div style={{ 'width': '4px' }}></div>
                        <Button
                            icon={<VerticalAlignBottomOutlined />}
                            onClick={() => downloadLyc(true)}
                        >
                            {intl.get("download-lyric-twin")}
                        </Button>
                    </>
                )}
            </Row>

            <div style={{ 'height': '4px' }}></div>

            <Row justify={'start'}
                onMouseEnter={() => setShowCopyButtons(true)}
                onMouseLeave={() => setShowCopyButtons(false)}
            >
                <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyLyc(false)}
                >
                    {intl.get("copy-lyric")}
                </Button>

                {showCopyButtons && (
                    <>
                        <div style={{ 'width': '4px' }}></div>
                        <Button
                            icon={<CopyOutlined />}
                            onClick={() => copyLyc(true)}
                        >
                            {intl.get("copy-lyric-twin")}
                        </Button>
                    </>
                )}
            </Row>
        </Col>

        <Drawer
            title={intl.get("upload-sens")}
            onClose={() => setDrawopen(false)}
            open={drawopen}
            placement="left"
        >
            <PopInputArea drawopen={drawopen} setLyc={props.setLyc} />
        </Drawer>
    </div>)
}