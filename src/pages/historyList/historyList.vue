<template>
  <!-- 历史播放 -->
  <div class="historyList">
    <music-list
      :list="historyList"
      list-type="duration"
      @select="selectItem"
      @del="deleteItem"
    >
      <div slot="listBtn" class="list-btn">
        <span @click="$refs.dialog.show()">清空列表</span>
      </div>
    </music-list>
    <chicken-dialog
      ref="dialog"
      body-text="是否清空播放历史"
      confirm-btn-text="清空"
      @confirm="clearList"
      :confirmShow="true"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
// import ChickenDialog from "../../base/chicken-dialog";
import ChickenDialog from "../../base/chicken-dialog/index.vue";
import MusicList from "../../components/music-list/music-list.vue";
export default {
  name: "HistoryList",
  components: {
    ChickenDialog,
    MusicList,
  },
  computed: {
    ...mapGetters(["historyList", "playing", "currentMusic"]),
  },
  methods: {
    // 清空列表事件
    clearList() {
      this.clearHistory();
      this.$mmToast("清除列表成功");
    },
    // 播放事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.historyList,
        index,
      });
    },
    // 删除事件
    deleteItem(index) {
      let list = [...this.historyList];
      list.splice(index, 1);
      this.removeHistory(list);
      this.$mmToast("删除成功");
    },
    ...mapMutations({
      setPlaying: "SET_PLAYING",
    }),
    ...mapActions(["selectPlay", "clearHistory", "removeHistory"]),
  },
};
</script>

<style lang="less" scoped>
.historyList {
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