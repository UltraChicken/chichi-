<template>
  <!-- 歌单详情 -->
  <div class="details">
    <chicken-loading v-model="loadShow" />
    <music-list :list="list" @select="selectItem" />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { getPlaylistDetail, getMusicDetail } from "../../api";
import ChickenLoading from "../../base/chicken-loading/chicken-loading.vue";
import MusicList from "../../components/music-list/music-list.vue";
import { loadMixin } from "../../utils/mixin";
import { formatTopSongs } from "../../utils/song";
export default {
  name: "Details",
  data() {
    return {
      list: [], //列表
    };
  },
  components: {
    ChickenLoading,
    MusicList,
  },
  mixins: [loadMixin],
  created() {
    // 获取歌单详情
    getPlaylistDetail(this.$route.params.id)
      .then((res) => {
        // 此接口不稳定，tracks有可能为undefined，此时需要获得所有 trackIds 调用song/detail
        if (!res.tracks) {
          let trackIds = [];
          res.trackIds.forEach((item) => {
            trackIds.push(item.id);
          });
          let newTrackIds = trackIds.join(",");
          this._getMusicDetail(newTrackIds);
          document.title = `${res.name} - chichi在线播放`;
        } else {
          this.list = res.tracks;
        }
        this._hideLoad();
      })
      .catch(() => {
        this._hideLoad();
      });
  },
  methods: {
    _getMusicDetail(newTrackIds) {
      getMusicDetail(newTrackIds).then(({ data }) => {
        this.list = formatTopSongs(data.songs)
      });
    },
    // 播放暂停事件
    selectItem(item, index) {
      this.selectPlay({
        list: this.list,
        index,
      });
    },
    ...mapActions(["selectPlay"]),
  },
};
</script>

<style lang="less" scoped>
.details {
  position: relative;
  width: 100%;
  height: 100%;
  .musicList {
    width: 100%;
    height: 100%;
  }
}
</style>