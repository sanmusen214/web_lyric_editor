# Web Lyric Editor

一个所见即所得的在线LRC歌词编辑器

An online LRC lyric editor

*[**中文界面**](https://web-lyric-editor.wyf9.top?lang=cn) || [**English Interface**](https://web-lyric-editor.wyf9.top?lang=en)*

## Fork

Fork, 进行了一些修改:

- 增加复制歌词功能 / Add `copy lyric` button
- 部署到 GitHub Pages + Cloudflare CDN

## 双语LRC

你可以在歌词中使用 `|` 来划分原文以及翻译，随后下载时使用 `下载歌词(双语)` 按钮下载可以双行显示的LRC歌词

如果使用双语LRC，则末行必须是空行

## 快捷键

| 按键                | 触发所需状态        | 功能                                   |
| ------------------- | ------------------- | -------------------------------------- |
| Ctrl + J / Ctrl + ← | 编辑状态            | 歌曲时间倒退三秒                       |
| Ctrl + L / Ctrl + → | 编辑状态            | 歌曲时间前进三秒                       |
| Ctrl + i / Ctrl + ↑ | 编辑状态            | 光标移动至上一句歌词                   |
| Ctrl + K / Ctrl + ↓ | 编辑状态            | 光标移动至下一句歌词                   |
| Ctrl + H            | 非编辑状态/编辑状态 | 光标移动至当前歌曲时间所在歌词         |
| Ctrl + R            | 编辑状态            | 更新当前歌词的时间戳为当前歌曲的时间   |
| Ctrl + F            | 编辑状态            | 将当前歌曲时间改为光标所在歌词的时间戳 |
| Ctrl + Enter(回车)  | 编辑状态            | 在当前歌词下一行以当前时间轴插入新歌词 |
| Ctrl + Space(空格)  | 编辑状态            | 播放/暂停歌曲                          |
| Tab                 | 编辑状态            | 光标移动至下一个输入框                 |

## Twin LRC

You can use `|` to split raw text and translated, and press `download lyric(twin)` button to download LRC lyric that contains two lines on one timestamp.

If use twin lrc, the last line must be blank.

## Keys

| Key                 | Function                                                                  |
| ------------------- | ------------------------------------------------------------------------- |
| Ctrl + J / Ctrl + ← | Go back three seconds                                                     |
| Ctrl + L / Ctrl + → | Go forward three seconds                                                  |
| Ctrl + i / Ctrl + ↑ | Move the cursor to the previous line                                      |
| Ctrl + K / Ctrl + ↓ | Move the cursor to the next line                                          |
| Ctrl + H            | Move the cursor to the current time                                       |
| Ctrl + R            | Update the timestamp of the current lyric to the current time             |
| Ctrl + F            | Change the current song time to the time of the lyric where the cursor is |
| Ctrl + Enter        | Insert a new lyric at the current time axis below the current lyric       |
| Ctrl + Space        | Play/Pause the song                                                       |
| Tab                 | Move the cursor to the next input box                                     |

# Dev

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## `npm start`

启动本地开发服务器

## `npm build`

打包

## `npm run deploy`

部署至 GitHub Pages

> 使用 `gh-pages -d build`, 须先安装相应工具
