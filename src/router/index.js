import Vue from "vue"
import Router from 'vue-router'
// import userlist from '../pages/userList/userList'

Vue.use(Router)

const original = Router.prototype.push
Router.prototype.push = function push(location) {
    return original.call(this, location).catch(err => err)
}

const routes = [
    // 重定向
    {
        path: '/',
        redirect: '/music'
    },
    {
        path: '/music',
        component: () => import('../pages/music'),
        redirect: '/music/playlist',
        children: [
            {
                path: '/music/userlist',     // 我的歌单
                component: () => import('../pages/userList/userList.vue'),
                meta: {
                    keepAlive: true
                }
            },
            {
                path: '/music/playlist',
                component: () => import('../pages/playList/playList.vue'),
                meta: {
                    keepAlive: true
                }
            },
            {
                path: '/music/comment/:id',  // 音乐评论
                component: () => import('../pages/comment/comment.vue'),
                meta: {
                    title: '评论详情'
                }
            },
            {
                path: '/music/search/',   //搜索
                component: () => import('../pages/search/search.vue'),
                mata: {
                    title: '搜索',
                    keepAlive: true
                }
            },
            {
                path: '/music/toplist',  // 排行榜列表
                component: () => import('../pages/topList/topList.vue'),
                meta: {
                    title: '排行榜',
                    keepAlive: true
                }
            },
            {
                path: '/music/details/:id',  // 音乐详情列表
                component: () => import('../pages/details/details.vue')
            },
            {
                path: '/music/historylist', // 历史记录
                component:()=>import('../pages/historyList/historyList.vue'),
                meta:{
                    title:'历史播放'
                    // keepAlive:true
                }
            }
        ]
    }
]

export default new Router({
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    routes
})