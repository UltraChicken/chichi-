// 默认音量
import { defaultVolume } from '../config'

/**
 * 每次在对localStorage进行操作时
 * 都要进行判断页面localStorage是否为空
 */
const _storage = window.localStorage
const storage = {
    get(key, data = []) {
        if (_storage) {
            return _storage.getItem(key)
                ? Array.isArray(data)
                    ? JSON.parse(_storage.getItem(key))
                    : _storage.getItem(key)
                : data
        }
    },
    set(key,val){
        if(_storage){
            _storage.setItem(key,val)
        }
    },
    clear(key){
        if(_storage){
            _storage.removeItem(key)
        }
    }
}

/**
 * 版本号
 * @type VERSION_KEY：key值
 */
const VERSION_KEY = '__chickenPlayer_version__'
// 获取版本号
export function getVersion(){
    let version = storage.get(VERSION_KEY,null)
    return Array.isArray(version) ? null : version
}
// 修改版本号
export function setVersion(version){
    storage.set(VERSION_KEY,version)
    return version
}

/**
 * 播放模式
 * @type    MODE_KEY:key
 *          HistoryListMax:最大长度
 */
const MODE_KEY = '__chickenPlayer_mode__'
// 获取播放模式
export function getMode(){
    return storage.get(MODE_KEY,null)
}
// 修改播放模式
export function setMode(mode){
    storage.set(MODE_KEY,mode);
    return mode;
}

/**
 * 网易云用户uid
 * @type USERID_KEY:key
 */
const USERID_KEY = '__chickenPlayer_userID__';
// 获取网易云用户ID
export function getUserID(){
    return Number(storage.get(USERID_KEY,null));
}
// 修改网易云用户ID
export function setUserID(uid){
    storage.set(USERID_KEY,uid);
    return uid
}
/**
 * 播放历史
 * @type        HISTORYLIST_KEY:key
 *              HistoryListMAX：最大长度
 */
const HISTORYLIST_KEY = '__chickenPlayer_historyList__'
const HistoryListMAX = 200
// 获取播放历史
export function getHistoryList(){
    return storage.get(HISTORYLIST_KEY);
}

// 更新播放历史
export function setHistoryList(music){
    let list = storage.get(HISTORYLIST_KEY);
    const index = list.findIndex(item=>{
        return item.id === music.id;
    })
    if(index===0){
        return list;
    }
    if(index>0){
        list.splice(index,1);
    }
    list.unshift(music)
    if(HistoryListMAX && list.length > HistoryListMAX){
        list.pop();
    }
    storage.set(HISTORYLIST_KEY,JSON.stringify(list))
    return list;
}
// 删除一条播放历史
export function removeHistoryList(music){
    storage.set(HISTORYLIST_KEY,JSON.stringify(music))
    return music
}
// 清空播放历史
export function clearHistoryList(){
    storage.clear(HISTORYLIST_KEY);
    return []
}
/**
 * 音量
 * @type VOLUME_KEY:key值
 */
const VOLUME_KEY = '__chickenPlayer_volume__'
// 获取音量
export function getVolume(){
    const volume = storage.get(VOLUME_KEY,defaultVolume)
    return Number(volume)
}
// 修改音量
export function setVolume(volume){
    storage.set(VOLUME_KEY,volume)
    return volume
}

/***
 * 二维码信息
 * @type QR_IMG :key 值
 */
const QR_IMG = '__chickenPlayer_qrimg__'
// 获取二维码
export function getStorage_QRimg(){
    return  storage.get(QR_IMG,null)
}
// 修改二维码
export function setStorage_QRimg(qrimg){
    storage.set(QR_IMG,qrimg)
    return qrimg
}