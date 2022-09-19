import {
    clearHistoryList,
    setHistoryList,
    removeHistoryList,
    setMode,
    setUserID,
    setStorage_QRimg
} from '../utils/storage'
import * as types from './mutation-types'
function findIndexx(list, music) {
    return list.findIndex(item => {
        return item.id === music.id;
    })
}
// 设置播放列表
export function setPlaylist({ commit }, { list }) {
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_ORDERLIST, list)
}
// 选择播放（会更新整个播放列表）
export function selectPlay({ commit }, { list, index }) {
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_ORDERLIST, list)
    commit(types.SET_CURRENTINDEX, index)
    commit(types.SET_PLAYING, true)
}
// 选择播放（会插入一条到播放列表）
export function selectAddPlay({ commit, state }, music) {
    let list = [...state.playlist]
    // 查询当前播放列表是否有待插入的音乐，并返回其索引值
    let index = findIndexx(list, music)
    // 当前播放列表有待插入的音乐时，直接改变当前播放音乐的索引值
    if (index > -1) {
        commit(types.SET_CURRENTINDEX, index)
    } else {
        list.unshift(music)
        commit(types.SET_PLAYLIST, list)
        commit(types.SET_ORDERLIST, list)
        commit(types.SET_CURRENTINDEX, 0)
    }
    commit(types.SET_PLAYING, true)
}
// 添加下一首播放
export function selectAddNextPlay({ commit, state }, music) {
    let list = [...state.orderList]
    let index = findIndexx(list, music)
    let currentIndex = state.currentIndex;
    if (index > -1) {

        // 如果当前播放音乐
        if (currentIndex !== -1) {
            list.splice(index, 1)
            list.splice(currentIndex + 1, 0, music)
            commit(types.SET_ORDERLIST, list)
        }
        // commit(types.SET_PLAYLIST, list)
    } else {
        if (currentIndex !== -1) {
            if (currentIndex === list.length - 1) {
                list.shift()
                list.unshift(music)
                commit(types.SET_ORDERLIST,list)
            } else {
                list.pop()
                list.splice(currentIndex + 1, 0, music)
                commit(types.SET_ORDERLIST, list)
            }

        }
        // commit(types.SET_PLAYLIST, list)
    }
}
// 清空播放列表
export function clearPlayList({ commit }) {
    commit(types.SET_PLAYING, false)
    commit(types.SET_CURRENTINDEX, -1)
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_ORDERLIST, [])
}
// 删除正在播放列表中的歌曲
export function removerPlayListItem({ commit, state }, { list, index }) {
    let currentIndex = state.currentIndex
    if (index < state.currentIndex || list.length === state.currentIndex) {
        currentIndex--;
        commit(types.SET_CURRENTINDEX, currentIndex)
    }
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_ORDERLIST, list)
    if (!list.length) {
        commit(types.SET_PLAYING, false)
    } else {
        commit(types.SET_PLAYING, true)
    }
}
// 设置播放历史
export function setHistory({ commit }, music) {
    commit(types.SET_HISTORYLIST, setHistoryList(music))
}
// 删除播放历史
export function removeHistory({ commit }, music) {
    commit(types.SET_HISTORYLIST, removeHistoryList(music))
}
// 清空播放历史
export function clearHistory({ commit }) {
    commit(types.SET_HISTORYLIST, clearHistoryList())
}
// 设置播放模式
export function setPlayMode({ commit }, mode) {
    commit(types.SET_PLAYMODE, setMode(mode))
}
// 设置网易云用户UID
export function setUid({ commit }, uid) {
    commit(types.SET_UID, setUserID(uid))
}
// 设置二维码信息qrimg
export function setQRimg({ commit }, qrimg) {
    commit(types.SET_QRIMG, setStorage_QRimg(qrimg))
}