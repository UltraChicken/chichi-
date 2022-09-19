import axios from "axios";
import { defaultLimit } from '../config'
import { formatTopSongs } from '../utils/song'
import store from "@/store";
import md5 from 'js-md5'


axios.defaults.baseURL = process.env.VUE_APP_BASE_API_URL

// 排行榜列表---------/toplist/detail
export function getToplistDetail() {
    return axios.get('/toplist/detail')
}

// 推荐歌单-------/personalized
export function getPersonalized() {
    return axios.get('/personalized')
}

// 歌单详情-------/related/playlist
export function getPlaylistDetail(id) {
    return new Promise((resolve, reject) => {
        axios
            .get('/playlist/detail', {
                params: { id }
            })
            .then(({ data: { playlist } }) =>
                playlist || {}
            ).then(playlist => {
                const { trackIds, tracks } = playlist
                if (!Array.isArray(trackIds)) {
                    reject(new Error('获取歌单详情失败'))
                    return
                }
                // 过滤完整歌单，如排行榜
                if (trackIds.length === tracks.length) {
                    // 都变成自己包装的Song对象
                    playlist.tracks = formatTopSongs(playlist.tracks)
                    resolve(playlist)
                    return
                }
                // 限制歌单详情最大 500
                const ids = trackIds.slice(0, 500).map(v => v.id).toString()
                getMusicDetail(ids).then(({ songs }) => {
                    playlist.tracks = formatTopSongs(songs)
                    resolve(playlist)
                })

            })
    })
}
/**
 * 搜索 
 * @param {*} keywords:关键词 
 * @param {*} page ：
 * @param {*} limit ：返回数量，默认30
 * @returns 
 */
export function search(keywords, page = 0, limit = defaultLimit) {
    return axios.get('/cloudsearch', {
        params: {
            offset: page * limit,
            limit,
            keywords
        }
    })
}
// 热搜
export function searchHot() {
    return axios.get('/search/hot')
}
// 获取用户歌单详情
export function getUserPlaylist(uid) {
    return axios.get('/user/playlist', {
        params: {
            uid
        }
    })
}
// 获取歌单详情
export function getMusicDetail(ids) {
    return axios.get('/song/detail', {
        params: {
            ids
        }
    })
}
// 获取音乐是否可以用
export function getCheckMusic(id) {
    return axios.get('/check/music', {
        params: {
            id
        }
    })
}
// 获取音乐地址URL
export function getMusicUrl(id) {
    return axios.get('/song/url', {
        params: {
            id
        }
    })
}
// 获取歌词
export function getLyric(id) {
    const url = '/lyric'
    return axios.get(url, {
        params: {
            id
        }
    })
}
/**
 * 歌曲评论
 * @params id:音乐id
 * @params limit:取出评论数量
 */
export function getComment(id, page, limit = defaultLimit) {
    return axios.get('/comment/music', {
        params: {
            id,
            offset: page * limit,
            limit
        }
    })
}

/**
 * 给评论点赞
 * @params id   资源id
 * @params cid 评论id
 * @params t    是否点赞 1---点赞  0---取消点赞
 * @params type 0---歌曲   1----mv   2----歌单
 */
export function getCommentLike(id, cid, t, type = 0) {
    return axios.get('/comment/like', {
        params: {
            id,
            cid,
            t,
            type
        }
    })
}

// 获取ThreadId
export function getThreadId(id) {
    return axios.get('/user/event', {
        params: {
            id
        }
    })
}

/**
 * 二维码登录
 * 二维码登录涉及到 3 个接口,调用务必带上时间戳,防止缓存
 * 1.二维码 key 生成接口
 * 2.二维码生成接口
 *      @params key
 *      @params qrimg
 * 3.二维码检测扫码状态接口
*/
export function getQR() {
    return new Promise((resolve, reject) => {
        // 生成一个时间戳
        let nowTime = Date.now()
        axios.get('/login/qr/key?timerstamp=' + nowTime).then(({ data: { data: { unikey } } }) =>
            unikey || ''
        ).then(unikey => {
            // console.log('unikey', unikey);
            if (unikey.length === 0) {
                reject(new Error('获取key失败'))
                return
            }
            if (unikey.length > 0) {
                getQRqrimg(unikey)
                    .then(({ data: { data: { qrimg } } }) =>
                        qrimg || ""
                    )
                    .then(qrimg => {
                        if (!qrimg) {
                            reject(new Error('生成qrimg失败'))
                            return
                        }
                        if (qrimg) {
                            // 每隔 3秒 check 一次
                            store.commit('SET_QRIMG', qrimg)

                            let timer = setInterval(() => {
                                QRcheck(unikey).then((res) => {
                                    if (res.data.code === 800) {
                                        alert(res.data.message)
                                        clearInterval(timer)
                                        return
                                    }
                                    // 等待扫码 限时1分钟
                                    // if(res.data.code === 801){
                                    //     setTimeout(() => {

                                    //     }, 60000);
                                    // }
                                    if (res.data.code === 803) {
                                        alert(res.data.message)
                                        clearInterval(timer)
                                        resolve(res.data)
                                        return
                                    }
                                })
                            }, 3000);
                            // resolve(qrimg)
                            // return
                        }
                    });
            }
        })

    })
}
// 生成 qrimg 
function getQRqrimg(unikey) {
    return axios.get('/login/qr/create?qrimg=true', {
        params: {
            key: unikey,
        }
    })
}
// 二维码检测状态接口
function QRcheck(unikey) {
    return axios.get('/login/qr/check', {
        params: {
            key: unikey,
            timerstamp: new Date().getTime()     // 传入时间戳
        }
    })
}
// 获取扫码后的用户登录状态
export function getStatus(c) {
    return axios.get('/login/status', {
        params: {
            cookie: c
        }
    })
}

/**
 * 手机登录
 * @param phone:手机号码
 * @param ctcode:国家区号,默认86
 * /captcha/sent
 */
// 发送验证码
export function sendCaptcha(phone) {
    return axios.get('/captcha/sent', {
        params: {
            phone,
        }
    })
}
// 验证验证码
export function verifyCaptcha(phone, captcha) {
    return axios.get('/captcha/verify', {
        params: {
            phone,
            captcha
        }
    })
}
// 验证码登录
export function byPhoneLogin(phone, captcha) {
    return axios.post('/login/cellphone', {
        phone,
        captcha,
    })
}
// 密码登录
export function byPasswordLogin(phone, password) {
    return axios.post('/login/cellphone', {
        phone,
        md5_password: md5(password)
    })
}
// 邮箱登录
export function byEmailLogin(email, password) {
    return axios.post('/login', {
        params: {
            email,
            md5_password: md5(password)
        }
    })
}