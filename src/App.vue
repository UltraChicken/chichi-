<template>
  <div id="app">
    <!-- 主体部分 -->
    <chicken-header />
    <router-view class="router-view" />
    <!-- 播放器 -->
    <audio ref="chickenPlayer"></audio>
    
  </div>
</template>

<script>
// import { VERSION } from './config';
// import {getVersion,setVersion} from './utils/storage'
import { mapMutations, mapActions } from "vuex";
import { getPlaylistDetail } from "./api";
import ChickenHeader from "../src/components/chicken-header";
// import { defaultBG } from "./config";
import { defaultSheetId } from "./config";

export default {
  name: "App",
  components: {
    ChickenHeader,
  },
  created() {
    // 获取正在播放列表
    getPlaylistDetail(defaultSheetId).then((playlist) => {
      // console.log('playlist请求成功',playlist)
      const list = playlist.tracks.slice(0, 100);
      this.setPlaylist({ list });
    });
    
    // 设置title
    let OriginTitle = document.title;
    let timer;
    document.addEventListener("visibilitychange", function () {
      // 页面切走了
      if (document.hidden) {
        document.title =
        "你干嘛~~~~~~哎呦~~~~~~";
        clearTimeout(timer);
      } else {
        document.title = "欢迎回来~~ ๑乛◡乛๑ (●′∀`●)";
        timer = setTimeout(() => {
          document.title = OriginTitle;
        }, 1000);
      }
    });

    // 首次加载完成后去掉动画
    let animateDom = document.querySelector("#appLoading");
    const animationendFunc = function () {
      animateDom.removeEventListener("animationend", animationendFunc);
      animateDom.removeEventListener("webkitAnimationEnd", animationendFunc);
      document.body.removeChild(animateDom);
      animateDom = null;
      // const version = getVersion();
      // if(version !== null){
      //   setVersion(VERSION)
      //   if(version !== VERSION){

      //   }
      // }
    }.bind(this);
    animateDom.addEventListener("animationend", animationendFunc);
    // Chrome,Safari,Opera
    animateDom.addEventListener("WebkitAnimationEnd", animationendFunc);
    animateDom.classList.add("removeAnimate");
    
    // 设置audio元素
    this.$nextTick(()=>{
      this.setAudioele(this.$refs.chickenPlayer)
    })
  },

  

  methods: {
    ...mapActions(["setPlaylist"]),
    ...mapMutations({
      setAudioele: "SET_AUDIOELE",
    }),
  },
};
</script>

<style lang='less'>
#app {
  position: relative;
  width: 100%;
  height: 100%;
  color: @text_color;
  font-size: @font_size_medium;

  .router-view {
    width: 100%;
    height: 100%;
  }

  
  audio {
    position: fixed;
  }
}
</style>
