import React, { useRef } from 'react'
import "./PlayerArea.css"
import { Lyric } from '../../../../utils/lyric'
import { Howl, Howler } from 'howler'

type PlayerAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
}


/**
 * 默认获取进度条当前所在位置百分比,有event的话就获取鼠标对应的进度条位置
 */
const getMusicUIPercent = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>): number => {
  const progressbar = document.querySelector("#playerprogress-bar")
  const progressnow = document.querySelector("#playernow")
  if (progressbar && progressnow) {
    let left: number = 0
    if (e) {
      left = e.clientX - progressbar.getBoundingClientRect().x
    } else {
      left = progressnow.clientWidth
    }
    const total: number = progressbar.clientWidth
    return Math.max(Math.min(1, left / total), 0)
  }
  return 0
}

/**
 * 改变进度条UI位置
 */
const changeBarNow: React.MouseEventHandler<HTMLDivElement> = (e) => {
  const percent = getMusicUIPercent(e)
  const progressnow: HTMLImageElement | null = document.querySelector("#playernow")
  if (progressnow) {
    progressnow.style.width = `${percent * 100}%`
  }
}

const PlayerArea: React.FC<PlayerAreaProps> = () => {

  let isDrag = false

  return (
    <div id="PlayerArea" onMouseLeave={() => { isDrag = false }} onMouseMove={(e) => { if (isDrag) { changeBarNow(e) } }} onMouseUp={() => {isDrag = false}}>
      <div id="playerprogress">
        <div id="playerprogress-bar" onMouseDown={(e) => {isDrag = true;changeBarNow(e)}}>
          <div id="playernow"></div>
        </div>
      </div>
    </div>
  )
}

export default PlayerArea