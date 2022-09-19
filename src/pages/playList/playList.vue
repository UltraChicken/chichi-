<template>
  <!-- 正在播放 -->
  <div class="playList">
    <music-list
      :list="playlist"
      listType="duration"
      @select="selectItem"
      @del="deleteItem"
    >
      <div slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <chicken-dialog
      ref="dialog"
      body-text="是否清空正在播放列表"
      confirm-btn-text="清空"
      v-on:confirm="clearList"
    />
  </div>
</template>

<script>
import ChickenDialog from "../../base/chicken-dialog";
import MusicList from "../../components/music-list/music-list.vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
export default {
  name: "PlayList",
  components: {
    ChickenDialog,
    MusicList,
  },
  computed: {
    ...mapGetters(["playlist", "currentMusic"]),
  },
  methods: {
    // 清空列表事件
    clearList() {
      this.clearPlayList();
      this.$mmToast("列表清空成功");
    },
    // 播放暂停事件
    selectItem(item, index) {
      // console.log('我被触发了',item.id,this.currentMusic.id,this.$event)
      if (item.id !== this.currentMusic.id) {
        this.setCurrentIndex(index);
        this.setPlaying(true);
      }
    },
    // 删除事件
    deleteItem(index) {
      // console.log('我被触发了')
      let list = [...this.playlist];
      list.splice(index, 1);
      this.removerPlayListItem({ list, index });
      this.$mmToast("删除成功");
    },
    ...mapMutations({
      setPlaying: "SET_PLAYING",
      setCurrentIndex: "SET_CURRENTINDEX",
    }),
    ...mapActions(["clearPlayList", "removerPlayListItem"]),
  },
};
</script>
<style lang="less">
.playList {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
    .list-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
      span {
        padding: 5px 20px;
        cursor: pointer;
        user-select: none;
        &:hover {
          color: @text_color_active;
        }
      }
    }
  }
}
</style>