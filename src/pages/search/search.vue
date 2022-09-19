<template>
  <!-- 搜索组件 -->
  <div class="search">
    <chicken-loading :value="loadShow" />
    <div class="search-head">
      <span
        v-for="(item, index) in Artists"
        :key="index"
        @click="clickHot(item.first)"
      >
        {{ item.first }}
      </span>
      <input
        v-model.trim="searchValue"
        type="text"
        class="search-input"
        placeholder="搜索音乐、歌手"
        @keyup.enter="onEnter"
      />
    </div>
    <music-list
      ref="musicList"
      :list="list"
      list-type="pullup"
      @select="selectItem"
      @pullUp="pullUpLoad"
    />
  </div>
</template>

<script>
import MusicList from "../../components/music-list/music-list.vue";
import ChickenLoading from "../../base/chicken-loading/chicken-loading.vue";
import { search, getMusicDetail, searchHot } from "../../api";
import { formatTopSongs } from "@/utils/song";
import { mapActions, mapMutations } from "vuex";
import { toHttps } from "@/utils/util";
export default {
  name: "Search",
  components: {
    MusicList,
    ChickenLoading,
  },
  data() {
    return {
      searchValue: "", // 关键词
      list: [], // 搜索数组
      Artists: [], // 热搜数组
      page: 0, // 分页
      lockUp: true, // 锁定上拉加载事件,默认锁定
      loadShow:false
    };
  },
  watch: {
    list(newList, oldList) {
      if (newList.length !== oldList.length) {
        this.lockUp = false;
      } else if (
        newList[newList.length - 1].id !== oldList[oldList.length - 1].id
      ) {
        this.lockUp = false;
      }
    },
  },
  created() {
    // 获取热搜
    searchHot().then(({data:{result}}) => {
      this.Artists = result.hots.slice(0, 5);
      this.loadShow = false;
    });
  },
  methods: {
    // 点击热搜
    clickHot(name) {
      this.searchValue = name;
      this.onEnter();
    },
    onEnter() {
      if (!this.searchValue) {
        this.$mmToast("搜索内容不能为空");
        return;
      }
      this.loadShow = true;
      this.page = 0;
      if (this.list.length > 0) {
        this.$refs.musicList.scrollTo();
      }
      search(this.searchValue).then(({ data: { result } }) => {
        this.list = formatTopSongs(result.songs);
        this.loadShow = false;
      });
      
    },
    // 滚动条加载事件
    pullUpLoad() {
      this.page += 1;
      search(this.searchValue, this.page).then(({ data: { result } }) => {
        if (!result.songs) {
          this.$mmToast("没有更多歌曲了");
          return;
        }
        this.list = [...list, ...formatSongs(result.songs)];
      });
    },
    // 播放歌曲
    async selectItem(music) {
      try {
        const image = await this._getMusicDetail(music.id);
        music.image = toHttps(image);
        this.selectAddPlay(music);
      } catch (error) {
        this.$mmToast("出错了");
      }
    },
    // 获取歌单详情
    _getMusicDetail(id) {
      return getMusicDetail(id).then(({ data }) => data.songs[0].al.picUrl);
    },
    ...mapMutations({
      setPlaying: "SET_PLAYING",
    }),
    ...mapActions(["selectAddPlay"]),
  },
  mounted() {
    if (this.$route.query.w) {
      this.searchValue = this.$route.query.w;
      this.onEnter();
    }
  },
};
</script>

<style lang="less" scoped>
.search {
  position: relative;
  width: 100%;
  height: 100%;
  .search-head {
    display: flex;
    height: 40px;
    padding: 10px 15px;
    overflow: hidden;
    background: @search_bg_color;
    span {
      line-height: 40px;
      margin-right: 15px;
      cursor: pointer;
      &:hover {
        color: @text_color_active;
      }
      @media (max-width: 640px) {
        & {
          display: none;
        }
      }
    }
    .search-input {
      flex: 1;
      height: 40px;
      box-sizing: border-box;
      padding: 0 15px;
      border: 1px solid @btn_color;
      outline: 0;
      background: transparent;
      color: @text_color_active;
      font-size: @font_size_medium;
      box-shadow: 0 0 1px 0 #fff inset;
      &::placeholder {
        color: @text_color;
      }
    }
  }
  .musicList {
    width: 100%;
    height: calc(~"100% - 50px");
  }
}
</style>