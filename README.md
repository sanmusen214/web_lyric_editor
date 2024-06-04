# Web Lyric Editor

一个所见即所得的在线LRC歌词编辑器

An online LRC lyric editor

[中文界面](https://sanmusen214.github.io/web_lyric_editor?lang=cn)| [English Interface](https://sanmusen214.github.io/web_lyric_editor?lang=en)

## 快捷键

按键|触发所需状态|功能
-|-|-
Ctrl + J / Ctrl + ← | 编辑状态 | 歌曲时间倒退三秒
Ctrl + L / Ctrl + → | 编辑状态 | 歌曲时间前进三秒
Ctrl + i / Ctrl + ↑ | 编辑状态 | 光标移动至上一句歌词
Ctrl + K / Ctrl + ↓ | 编辑状态 | 光标移动至下一句歌词
Ctrl + H | 非编辑状态/编辑状态 | 光标移动至当前歌曲时间所在歌词
Ctrl + R | 编辑状态 | 更新当前歌词的时间戳为当前歌曲的时间
Ctrl + F | 编辑状态 | 将当前歌曲时间改为光标所在歌词的时间戳

## Combined keys

Key|Function
-|-
Ctrl + J / Ctrl + ← | Go back three seconds
Ctrl + L / Ctrl + → | Go forward three seconds
Ctrl + i / Ctrl + ↑ | Move the cursor to the previous line
Ctrl + K / Ctrl + ↓ | Move the cursor to the next line
Ctrl + H | Move the cursor to the current time
Ctrl + R | Update the timestamp of the current lyric to the current time
Ctrl + F | Change the current song time to the time of the lyric where the cursor is

# Dev

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## `npm start`

启动本地开发服务器

## `npm build`

打包

## `npm run deploy`

部署至github page
