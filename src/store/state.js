// 获取播放模式
import { playMode } from '../config'
import { getHistoryList, getMode, getUserID,getStorage_QRimg } from '../utils/storage.js'

const state = {
    audioEle: null,    // audio元素
    mode: Number(getMode()) || playMode.listLoop,    // 播放历史，默认为列表循环
    playing: false,       // 播放状态
    playlist: [],        // 播放列表
    orderList: [],        // 顺序列表
    currentIndex: -1,  // 当前音乐索引
    historyList: getHistoryList() || [],   // 播放历史列表
    uid: getUserID() || null,   // 网易云用户UID

    qrimg:getStorage_QRimg() || null // 存放二维码base64
}

export default state;