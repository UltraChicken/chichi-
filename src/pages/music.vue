<template>
  <div class="music">
    <div class="music-content">
      <div class="music-left">
        <music-btn />
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive" class="music-list" />
        </keep-alive>
        <router-view
          v-if="!$route.meta.keepAlive"
          class="music-list"
          :key="$route.path"
        />
      </div>
      <div class="music-right" :class="{ show: lyricVisible }">
        <!-- <div class="close-lyric" @click="handleCloce"></div> -->
        <lyric
          ref="lyric"
          :lyric="lyric"
          :nolyric="nolyric"
          :lyric-index="lyricIndex"
        />
      </div>
    </div>
    <!-- 播放器 -->
    <div
      class="music-bar"
      :class="{ disable: !musicReady || !currentMusic.id }"
    >
      <div class="music-bar-btns">
        <!-- 上一曲 -->
        <chicken-icon
          class="pointer"
          type="prev"
          :size="36"
          title="上一曲 Ctrl + Left"
          @click="prev"
        />
        <!-- 暂停 -->
        <div
          class="control-play pointer"
          title="播放暂停 Ctrl + Space"
          @click="play"
        >
          <chicken-icon :type="playing ? 'pause' : 'play'" :size="24" />
        </div>
        <!-- 下一曲 -->
        <chicken-icon
          class="pointer"
          type="next"
          :size="36"
          title="下一曲 Ctrl + Right"
          @click="next"
        />
      </div>
      <div class="music-music">
        <div class="music-bar-info">
          <template v-if="currentMusic && currentMusic.id">
            {{ currentMusic.name }}
            <span>- {{ currentMusic.singer }}</span>
          </template>
          <template v-else>欢迎使用chickenPlayer</template>
        </div>
        <div v-if="currentMusic.id" class="music-bar-time">
          {{ currentTime | format }}&nbsp;/&nbsp;{{
            currentMusic.duration % 3600 | format
          }}
        </div>
        <chicken-progress
          class="music-progress"
          :percent="percentMusic"
          :percent-progress="currentProgress"
          @percentChange="progressMusic"
          @percentChangeEnd="progressMusicEnd"
        />
      </div>
      <!-- 播放模式 -->
      <chicken-icon
        class="icon-color pointer mode"
        :size="30"
        :type="getModeIconType()"
        :title="getModeIconTitle()"
        @click="modeChange"
      />
      <!-- 评论 -->
      <chicken-icon
        class="icon-color pointer comment"
        type="comment"
        :size="30"
        @click="openComment"
      />
      <!-- 音量控制 -->
      <div class="music-bar-volume" title="音量+-[Ctrl + Up / Down]">
        <volume :volume="volume" @volumeChange="volumeChange" />
      </div>
    </div>

    <!-- 遮罩 -->
    <div
      v-show="currentMusic.id"
      class="player-bg"
      :style="{ backgroundImage: picURL }"
    ></div>

    <video
      v-if="!currentMusic.id"
      autoplay
      muted
      loop
      style="height: 100% width:100%"
    >
      <source src="../assets/background/ikun.mp4" />
    </video>

    <div class="player-mask"></div>
  </div>
</template>

<script>
import MusicBtn from "../components/music-btn/music-btn.vue";
import Lyric from "../components/lyric/lyric.vue";
import ChickenProgress from "../base/chicken-progress/chicken-progress.vue";
import Volume from "../components/volume/volume.vue";

import playerMusic from "./playerMusic";

import { getLyric } from "../api";
import {
  parseLyric,
  silencePromise,
  format,
  randomSortArray,
} from "../utils/util";
import { getVolume, setVolume } from "../utils/storage";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { defaultBG, playMode } from "@/config";
import ChickenIcon from "@/base/chicken-icon/chicken-icon.vue";
export default {
  name: "Music",
  components: {
    MusicBtn,
    Lyric,
    ChickenProgress,
    Volume,
    ChickenIcon,
  },
  data() {
    const volume = getVolume();
    return {
      musicReady: false, // 播放器当前是否可用
      currentTime: 0, // 当前播放时间
      currentProgress: 0, // 当前缓冲进度
      lyricVisible: false, //移动端歌词显示
      lyric: [], // 歌词
      nolyric: false, // 是否有歌词
      lyricIndex: 0, // 当前播放歌词下标
      isMute: false, // 是否静音
      volume, // 音量大小
    };
  },
  computed: {
    picURL() {
      return this.currentMusic.id && this.currentMusic.image
        ? `url(${this.currentMusic.image}?param=300y300)`
        : `url(${defaultBG})`;
    },
    percentMusic() {
      const duration = this.currentMusic.duration;
      return this.currentMusic && duration ? this.currentTime / duration : 0;
    },
    ...mapGetters([
      "mode",
      "playlist",
      "orderList",
      "currentMusic",
      "audioEle",
      "playing",
      "currentIndex",
      "historyList",
    ]),
  },
  filters: {
    // 时间格式化
    format,
  },
  watch: {
    currentMusic(newMusic, oldMusic) {
      if (!newMusic.id) {
        this.lyric = [];
        return;
      }
      if (newMusic.id === oldMusic.id) {
        return;
      }
      this.audioEle.src = newMusic.url;
      // 重置相关参数
      this.lyricIndex = this.currentTime = this.currentProgress = 0;
      silencePromise(this.audioEle.play());
      this.$nextTick(() => {
        this._getLyric(newMusic.id);
      });
    },
    playing(newPlaying) {
      const audio = this.audioEle;
      this.$nextTick(() => {
        newPlaying ? silencePromise(audio.play()) : audio.pause();
        this.musicReady = true;
      });
    },
    currentTime(newTime) {
      if (this.nolyric) {
        return;
      }
      let lyricIndex = 0;
      for (let i = 0; i < this.lyric.length; ++i) {
        if (newTime > this.lyric[i].time) {
          lyricIndex = i;
        }
      }
      this.lyricIndex = lyricIndex;
    },
  },
  mounted() {
    this.$nextTick(() => {
      playerMusic.initAudio(this);
      this.initKeyDown();
      this.volumeChange(this.volume);
    });
  },
  methods: {
    // 按键事件
    initKeyDown() {
      document.onkeydown = (e) => {
        switch (e.ctrlKey && e.keyCode) {
          case 32: // 播放暂停 Ctrl + Space
            this.play();
            break;
          case 37: // 上一首 Ctrl + Left
            this.prev();
            break;
          case 39: // 下一首 Ctrl + Right
            this.next();
            break;
          case 38: // 音量＋ Ctrl + Up
            let plus = Number((this.volume += 0.1).toFixed(1));
            if (plus > 1) {
              plus = 1;
            }
            this.volumeChange(plus);
            break;
          case 40: // 音量- Ctrl + Down
            let reduce = Number((this.volume -= 0.1).toFixed(1));
            if (reduce < 0) {
              reduce = 0;
            }
            this.volumeChange(reduce);
            break;
          case 79: // 切换播放模式Ctrl + O
            this.modeChange();
            break;
        }
      };
    },
    // 上一首
    prev() {
      if (!this.musicReady || !this.currentMusic.id) {
        return;
      }
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex - 1;
        if (index < 0) {
          index = this.playlist.length - 1;
        }
        this.setCurrentIndex(index);
        if (!this.playing && this.musicReady) {
          this.setPlaying(true);
        }
        // this.musicReady = false
      }
    },

    // 暂停/播放
    play() {
      if (!this.currentMusic.id) {
        return;
      }
      this.setPlaying(!this.playing);
    },

    // 下一首
    next() {
      if (!this.musicReady || !this.currentMusic.id) {
        return;
      }
      if (this.playlist.length === 1) {
        this.loop();
      } else {
        let index = this.currentIndex + 1;
        if (index === this.playlist.length) {
          index = 0;
        }
        this.setCurrentIndex(index);
        if (!this.playing && this.musicReady) {
          this.setPlaying(true);
        }
        // this.musicReady = false
      }
    },

    // 循环播放
    loop() {
      this.audioEle.currentTime = 0;
      silencePromise(this.audioEle.play());
      this.setPlaying(true);
      if (this.lyric.length > 0) {
        this.lyricIndex = 0;
      }
    },

    // 修改音乐显示时长
    progressMusic(percent) {
      this.currentTime = this.currentMusic.duration * percent;
    },
    // 修改音乐进度
    progressMusicEnd(percent) {
      this.audioEle.currentTime = this.currentMusic.duration * percent;
    },
    // 切换播放顺序
    modeChange() {
      const mode = (this.mode + 1) % 4;
      this.setPlayMode(mode);
      if (mode === playMode.loop) {
        return;
      }
      let list = [];
      switch (mode) {
        case playMode.listLoop:
        case playMode.order:
          list = this.orderList;
          break;
        case playMode.random:
          list = randomSortArray(this.orderList);
          break;
      }
      this.resetCurrentIndex(list);
      this.setPlaylist(list);
    },
    // 修改当前歌曲索引
    resetCurrentIndex(list) {
      const index = list.findIndex((item) => {
        return item.id === this.currentMusic.id;
      });
      this.setCurrentIndex(index);
    },
    // 打开评论区
    openComment() {
      if (!this.currentMusic.id) {
        this.$mmToast("还没有播放歌曲");
        return false;
      }
      this.$router.push(`/music/comment/${this.currentMusic.id}`);
    },
    // 修改音量大小
    volumeChange(percent) {
      percent == 0 ? (this.isMute = true) : (this.isMute = false);
      this.volume = percent;
      this.audioEle.volume = percent;
      setVolume(percent);
    },
    // 获取播放模式 icon
    getModeIconType() {
      const PLAY_MODE = {
        [playMode.listLoop]: "loop",
        [playMode.order]: "sequence",
        [playMode.random]: "random",
        [playMode.loop]: "loop-one",
      };
      return PLAY_MODE[this.mode];
    },
    // 获取播放模式 title
    getModeIconTitle() {
      const PLAY_MODE = {
        [playMode.listLoop]: `列表循环`,
        [playMode.order]: `顺序播放`,
        [playMode.random]: `随机播放`,
        [playMode.loop]: `单曲循环`,
      };
      return PLAY_MODE[this.mode];
    },
    // 获取歌词
    _getLyric(id) {
      getLyric(id).then(
        ({
          data: {
            lrc: { lyric },
          },
        }) => {
          this.lyric = parseLyric(lyric);
          silencePromise(this.audioEle.play());
          // if (res.nolyric) {
          //   this.nolyric = true;
          // } else {
          //   this.nolyric = false;
          //   this.lyric = parseLyric(res.lrc.lyric);
          // }
          // silencePromise(this.audioEle.play());
        }
      );
    },
    ...mapMutations({
      setPlaying: "SET_PLAYING",
      setPlaylist: "SET_PLAYLIST",
      setCurrentIndex: "SET_CURRENTINDEX",
    }),
    ...mapActions(["setHistory", "setPlayMode"]),
  },
};
</script>

<style lang="less">
.music {
  padding: 75px 25px 25px 25px;
  width: 100%;
  max-width: 1750px;
  margin: 0 auto;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .music-content {
    display: flex;
    width: 100%;
    height: calc(~"100% - 80px");
    .music-left {
      flex: 1;
      height: 100%;
      overflow: hidden;
      .music-list {
        height: calc(~"100% - 60px");
      }
    }
    .music-right {
      position: relative;
      width: 310px;
      margin-left: 10px;
    }
  }
  /* 播放器 */
  .music-bar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
    padding-bottom: 15px;
    color: #fff;
    &.disable {
      pointer-events: none;
      opacity: 0.6;
    }
    .icon-color {
      color: #fff;
    }
    .music-bar-btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 180px;
      .control-play {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        // line-height:45px;
        // text-align: center;
        border-radius: 50%;
        color: #fff;
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
    .music-music {
      position: relative;
      width: 100%;
      flex: 1;
      box-sizing: border-box;
      padding-left: 40px;
      font-size: @font_size_small;
      color: @text_color_active;
      .music-bar-info {
        height: 15px;
        padding: 0 80px 0 6px;
        line-height: 15px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .music-bar-time {
        position: absolute;
        top: 0;
        right: 4px;
      }
    }

    .mode,
    .comment,
    .music-bar-volume {
      margin-left: 20px;
    }
  }
  .player-bg,
  .player-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .player-bg {
    z-index: -2;
    // width: 50%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 50%;
    filter: blur(12px);
    opacity: 0.7;
    transition: all 0.8s;
    transform: scale(1.1);
  }
  .player-mask {
    z-index: -1;
    background-color: @mask_color;
  }

  video {
    position: fixed;
    left: 50%;
    top: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -9999;
    transform: translate(-50%, -50%);
  }
  video:after {
    content: "";
    width: 100%;
    height: 100%;
    filter: blur(13px);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }
  @media (min-width: 960px) {
    .close-lyric {
      display: none;
    }
  }

  //当屏幕小于960时
  @media (max-width: 960px) {
    .music-right {
      display: none;
      &.show {
        display: block;
        margin-left: 0;
        width: 100%;
      }
    }
  }
  //当屏幕小于768时
  @media (max-width: 768px) {
    & {
      padding: 75px 15px 5px 15px;
    }

    .music-content .music-left {
      .music-list {
        font-size: @font_size_medium;
      }
    }

    .music-bar {
      .music-bar-info span,
      .music-bar-volume .mmProgress {
        display: none;
      }
    }
  }
  //当屏幕小于520时
  @media (max-width: 520px) {
    .music-bar {
      position: relative;
      flex-direction: column;
      .music-bar-btns {
        width: 60%;
        margin-top: 15px;
        order: 2;
      }
      .music-music {
        padding-left: 0;
        order: 1;
      }
      & > i.mode {
        position: absolute;
        top: 40px;
        left: 5px;
        margin: 0;
      }
      .comment {
        position: absolute;
        top: 40px;
        right: 5px;
      }
      .music-bar-volume {
        display: none;
      }
    }
  }
}
</style>