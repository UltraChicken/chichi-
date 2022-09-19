// 版本号
export const VERSION = process.env.VUE_APP_VERSION

/**
 * 默认网易云音乐热歌榜 https://music.163.com/#/discover/toplist?id=3778678
 */
export const defaultSheetId = 3778678

// 默认分页数量
export const defaultLimit = 30

// 默认背景图
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./assets/background',false)
const BG_ARR = requireAll(req)
export const defaultBG = BG_ARR[Math.floor(Math.random()*BG_ARR.length)]

// 默认音量
export const defaultVolume = 0.8

/**
 * 播放模式
 * listLoop：列表循环
 * order：顺序播放
 * loop：单曲循环
 * random：随机播放
 */
export const playMode = {
    listLoop:0,
    order:1,
    random:2,
    loop:3
}