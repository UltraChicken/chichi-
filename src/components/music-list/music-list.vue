<template>
  <!-- 歌曲列表 -->
  <div class="musicList">
    <template v-if="list.length > 0">
      <div class="list-item list-header">
        <span class="list-name">歌曲</span>
        <span class="list-artist">歌手</span>
        <span v-if="isDuration" class="list-time">时长</span>
        <span v-else class="list-album">专辑</span>
      </div>
      <div ref="listContent" class="list-content" @scroll="listScroll($event)">
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="list-item"
          :class="{ on: playing && currentMusic.id === item.id }"
          @dblclick="selectItem(item, index, $event)"
        >
          <span class="list-num" v-text="index + 1"></span>
          <div class="list-name">
            <span>{{ item.name }}</span>
            <div class="list-menu">
              <chicken-icon
                class="hover"
                type="ic_playlist_add"
                :size="35"
                @click.stop="addOrderList(item, index)"
              />
              <chicken-icon
                class="hover"
                :type="getPlayIconType(item)"
                :size="35"
                @click.stop="selectItem(item, index)"
              />
            </div>
          </div>
          <div class="list-artist">{{ item.singer }}</div>
          <span v-if="isDuration" class="list-time">
            {{ item.duration % 3600 | format }}
            <chicken-icon
              class="hover list-menu-icon-del"
              type="delete-mini"
              :size="35"
              @click.stop="deleteItem(index)"
            />
          </span>
          <span v-else class="list-album">{{ item.album }}</span>
        </div>
        <slot name="listBtn"></slot>
      </div>
    </template>
    <chicken-no-result v-else title="无法获取歌曲列表" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import ChickenNoResult from "../../base/chicken-no-result/chicken-no-result.vue";
import { format } from "../../utils/util";

const LIST_TYPE_ALBUM = "album";
const LIST_TYPE_DURATION = "duration";
const LIST_TYPE_PULLUP = "pullup";

// 触发滚动加载的阈值
const THRESHOLD = 100;

export default {
  name: "MusicList",
  components: {
    ChickenNoResult,
  },
  filters: {
    format,
  },
  props: {
    // 歌曲数据
    list: {
      type: Array,
      default: () => [],
    },
    /**
     * 列表类型
     * album: 显示专辑栏目（默认）
     * duration: 显示时长栏目
     * pullup: 开启上拉加载
     */
    listType: {
      type: String,
      default: LIST_TYPE_ALBUM,
    },
  },
  data() {
    return {
      lockUp: true, // 是否锁定滚动加载事件，默认锁定
    };
  },
  computed: {
    isDuration() {
      return this.listType === LIST_TYPE_DURATION;
    },
    ...mapGetters(["playing", "currentMusic"]),
  },
  watch: {
    list(newList, oldList) {
      if (this.listType !== LIST_TYPE_PULLUP) {
        return;
      }
      if (newList.length !== oldList.length) {
        this.lockUp = false;
      } else if (
        newList[newList.length - 1].id !== oldList[oldList.length - 1].id
      ) {
        this.lockUp = false;
      }
    },
  },
  activated() {
    this.scrollTop &&
      this.$refs.listContent &&
      (this.$refs.listContent.scrollTop = this.scrollTop);
  },
  methods: {
    // 滚动事件
    listScroll(e) {
      const scrollTop = e.target.scrollTop;
      this.scrollTop = scrollTop;
      if (this.listType !== LIST_TYPE_PULLUP || this.lockUp) {
        return;
      }
      const { scrollHeight, offsetHeight } = e.target;
      if (scrollTop + offsetHeight >= scrollHeight - THRESHOLD) {
        this.lockUp = true; // 锁定滚动加载
        this.$emit("pullup"); // 触发滚动加载事件
      }
    },
    // 回到顶部
    scrollTo() {
      this.$refs.listContent.scrollTop = 0;
    },
    // 播放暂停事件
    selectItem(item, index) {
      if (this.currentMusic.id && item.id === this.currentMusic.id) {
        this.setPlaying(!this.playing);
        return;
      }
      this.$emit("select", item, index); //触发点击播放事件
    },
    // 添加下一首播放
    addOrderList(item, index) {
      this.$nextTick(()=>{
        this.selectAddNextPlay(item)
        this.$mmToast('添加成功')
      })
      
    },
    // 获取播放状态
    getPlayIconType({ id: itemId }) {
      const {
        playing,
        currentMusic: { id },
      } = this;

      return playing && id === itemId ? "pause-mini" : "play-mini";
    },
    // 删除事件
    deleteItem(index) {
      this.$emit("del", index); // 触发删除事件
    },
    ...mapMutations({ setPlaying: "SET_PLAYING" }),
    ...mapActions(['selectAddNextPlay'])
  },
};
</script>

<style lang="less" scoped>
.list-header {
  border-bottom: 1px solid @list_head_line_color;
  color: @text_color_active;
  .list-name {
    padding-left: 40px;
    user-select: none;
  }
}
.list-content {
  width: 100%;
  height: calc(~"100% - 60px");
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.list-no {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: @text_color;
}
.list-item {
  display: flex;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid @list_item_line_color;
  line-height: 50px;
  overflow: hidden;
  &.list-item-no {
    justify-content: center;
    align-items: center;
  }
  &.on {
    color: #fff;
    .list-num {
      font-size: 0;
      background: url("../../assets/img/wave.gif") no-repeat center center;
    }
  }
  &:hover {
    .list-name {
      padding-right: 80px;
      .list-menu {
        display: block;
      }
    }
  }
  &:not([class*="list-header"]):hover {
    .list-name {
      padding-right: 80px;
      .list-menu {
        display: block;
      }
    }
    .list-time {
      font-size: 0;
      .list-menu-icon-del {
        display: block;
      }
    }
  }
  .list-num {
    display: block;
    width: 30px;
    margin-right: 10px;
    text-align: center;
  }
  .list-name {
    position: relative;
    flex: 1;
    box-sizing: border-box;
    & > span {
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    small {
      margin-left: 5px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
    /*hover菜单*/
    .list-menu {
      display: none;
      position: absolute;
      top: 50%;
      right: 10px;
      height: 40px;
      font-size: 0;
      transform: translateY(-50%);
      .hover {
        line-height: 40px;
      }
    }
  }
  .list-artist,
  .list-album {
    display: block;
    width: 300px;
    // .no-wrap();
    @media (max-width: 1440px) {
      width: 200px;
    }
    @media (max-width: 1200px) {
      width: 150px;
    }
  }
  .list-time {
    display: block;
    width: 60px;
    position: relative;
    .list-menu-icon-del {
      display: none;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
}
@media (max-width: 960px) {
  .list-item .list-name {
    padding-right: 70px;
  }
}
@media (max-width: 768px) {
  .list-item {
    .list-name .list-menu {
      display: block;
    }
    .list-artist,
    .list-album {
      width: 20%;
    }
  }
}
@media (max-width: 640px) {
  .list-item {
    .list-artist {
      width: 80px;
    }
    .list-album,
    .list-time {
      display: none;
    }
  }
}
</style>