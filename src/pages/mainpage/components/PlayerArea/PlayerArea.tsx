import React, { useCallback, useEffect, useRef, useState } from 'react'
import './PlayerArea.css'
import { Lyric } from '../../../../utils/lyric'
import { Howl } from 'howler'
import { Button, Slider, message } from 'antd'
import { PauseOutlined, CaretRightOutlined, SoundOutlined } from '@ant-design/icons'
import { fromtimeflag2str } from '../../../../utils/sentenceparse'
import intl from 'react-intl-universal'
import { WaveformData } from '../../../../utils/audio'

type PlayerAreaProps = {
  lyc: Lyric
  setLyc: React.Dispatch<React.SetStateAction<Lyric>>
  song: Howl | undefined
  loadsongicon: boolean
  waveform: WaveformData | undefined
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const PlayerArea: React.FC<PlayerAreaProps> = ({ song, waveform }) => {
  const [volume, setVolume] = useState(0.3)
  const [isPlaying, setIsPlaying] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressNowRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const waveformHoverXRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const volumeRef = useRef(volume)

  const getCurrentTime = useCallback(() => {
    const seek = song?.seek()
    return typeof seek === 'number' && Number.isFinite(seek) ? seek : 0
  }, [song])

  const seekTo = useCallback((time: number) => {
    if (!song) return
    const duration = song.duration()
    if (!Number.isFinite(duration) || duration <= 0) return
    song.seek(clamp(time, 0, duration))
  }, [song])

  const drawWaveform = useCallback((currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    const cssWidth = width / dpr
    const cssHeight = height / dpr
    context.clearRect(0, 0, cssWidth, cssHeight)
    context.fillStyle = '#f5f8fb'
    context.fillRect(0, 0, cssWidth, cssHeight)

    context.strokeStyle = '#dce5ec'
    context.lineWidth = 1
    for (let second = -5; second <= 5; second += 1) {
      const x = ((second + 5) / 10) * cssWidth
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, cssHeight)
      context.stroke()
    }

    if (waveform && waveform.peaks.length > 0) {
      const centerY = cssHeight / 2
      const bars = Math.max(80, Math.floor(cssWidth / 2))
      context.fillStyle = '#5b8ff9'
      for (let bar = 0; bar < bars; bar += 1) {
        const time = currentTime - 5 + ((bar + 0.5) / bars) * 10
        const index = Math.floor((time / waveform.duration) * waveform.peaks.length)
        const peak = index >= 0 && index < waveform.peaks.length ? waveform.peaks[index] : 0
        const barHeight = Math.max(1, peak * (cssHeight - 10))
        const x = (bar / bars) * cssWidth
        context.fillRect(x, centerY - barHeight / 2, Math.max(1, cssWidth / bars - 0.7), barHeight)
      }
    }

    if (waveformHoverXRef.current !== null) {
      const hoverX = clamp(waveformHoverXRef.current, 0, cssWidth)
      context.fillStyle = 'rgba(80, 91, 102, .72)'
      context.fillRect(hoverX - 0.5, 0, 1, cssHeight)
    }

    context.fillStyle = '#20a464'
    context.fillRect(cssWidth / 2 - 1, 0, 2, cssHeight)
  }, [waveform])

  useEffect(() => {
    setIsPlaying(false)
    if (!song) return

    const onPlay = () => setIsPlaying(true)
    const onStop = () => setIsPlaying(false)
    const onPlayError = () => {
      setIsPlaying(false)
      message.error(intl.get('music-load-error'))
    }
    song.on('play', onPlay)
    song.on('pause', onStop)
    song.on('stop', onStop)
    song.on('end', onStop)
    song.on('playerror', onPlayError)
    song.volume(volumeRef.current)

    return () => {
      song.off('play', onPlay)
      song.off('pause', onStop)
      song.off('stop', onStop)
      song.off('end', onStop)
      song.off('playerror', onPlayError)
    }
  }, [song])

  useEffect(() => {
    let animationFrame = 0
    let lastDraw = 0
    const update = (timestamp: number) => {
      const currentTime = getCurrentTime()
      const duration = song?.duration() || waveform?.duration || 0
      const percent = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0
      if (progressNowRef.current) progressNowRef.current.style.transform = `scaleX(${percent})`
      if (progressRef.current) progressRef.current.setAttribute('aria-valuenow', String(Math.round(percent * 100)))
      if (timeRef.current) {
        const current = fromtimeflag2str(currentTime * 100)
        const total = duration > 0 ? fromtimeflag2str(duration * 100) : '--:--.--'
        timeRef.current.textContent = `${current} / ${total}`
      }
      if (timestamp - lastDraw > 32) {
        drawWaveform(currentTime)
        lastDraw = timestamp
      }
      animationFrame = requestAnimationFrame(update)
    }
    animationFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrame)
  }, [drawWaveform, getCurrentTime, song, waveform])

  const seekFromProgressPointer = (clientX: number) => {
    const progress = progressRef.current
    const duration = song?.duration() || 0
    if (!progress || duration <= 0) return
    const rect = progress.getBoundingClientRect()
    seekTo(((clientX - rect.left) / rect.width) * duration)
  }

  const onProgressPointerDown: React.PointerEventHandler<HTMLDivElement> = event => {
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    seekFromProgressPointer(event.clientX)
  }

  const onProgressPointerMove: React.PointerEventHandler<HTMLDivElement> = event => {
    if (draggingRef.current) seekFromProgressPointer(event.clientX)
  }

  const stopDragging: React.PointerEventHandler<HTMLDivElement> = event => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onProgressKeyDown: React.KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    seekTo(getCurrentTime() + (event.key === 'ArrowRight' ? 1 : -1))
  }

  const onWaveformPointerDown: React.PointerEventHandler<HTMLCanvasElement> = event => {
    const rect = event.currentTarget.getBoundingClientRect()
    seekTo(getCurrentTime() + ((event.clientX - rect.left) / rect.width - 0.5) * 10)
  }

  const onWaveformPointerMove: React.PointerEventHandler<HTMLCanvasElement> = event => {
    const rect = event.currentTarget.getBoundingClientRect()
    waveformHoverXRef.current = event.clientX - rect.left
  }

  const onWaveformPointerLeave = () => {
    waveformHoverXRef.current = null
  }

  const togglePlayback = () => {
    if (!song) {
      message.warning(intl.get('nomusic-warn'))
      return
    }
    if (song.playing()) song.pause()
    else song.play()
  }

  const onVolumeChange = (value: number) => {
    volumeRef.current = value
    setVolume(value)
    song?.volume(value)
  }

  return (
    <header id="PlayerArea">
      <div className="waveform-wrap">
        <canvas ref={canvasRef} className="waveform-canvas" onPointerDown={onWaveformPointerDown}
          onPointerMove={onWaveformPointerMove} onPointerLeave={onWaveformPointerLeave}
          aria-label={intl.get('waveform-label')} role="img" />
        {!waveform && <span className="waveform-empty">{intl.get('waveform-empty')}</span>}
        <span className="waveform-range waveform-range-left">-5s</span>
        <span className="waveform-range waveform-range-right">+5s</span>
      </div>
      <div className="player-controls">
        <div ref={progressRef} id="playerprogress-bar" role="slider" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
          tabIndex={0} onKeyDown={onProgressKeyDown}
          onPointerDown={onProgressPointerDown} onPointerMove={onProgressPointerMove}
          onPointerUp={stopDragging} onPointerCancel={stopDragging}>
          <div ref={progressNowRef} id="playernow" />
        </div>
        <div id="buttonsArea">
          <span ref={timeRef} id="nowtimestr">00:00.00 / --:--.--</span>
          <Button className="play-button" shape="circle" onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />} />
          <div className="volume-control">
            <SoundOutlined />
            <Slider value={volume} step={0.01} max={1} onChange={onVolumeChange}
              tooltip={{ formatter: value => `${Math.floor((value || 0) * 100)}%` }} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default PlayerArea
