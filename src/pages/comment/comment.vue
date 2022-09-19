<template>
  <!-- 评论 -->
  <div class="mod_comment">
    <chicken-loading v-model="loadShow" />
    <div class="mod_hot_comment" v-if="hotComments.length>0">
      <!-- 评论列表 -->
      <ul class="comment_list" @scroll="listScroll($event)">
        <div class="comment_title">
          <h2>精彩评论</h2>
        </div>
        <li
          v-for="item in hotComments"
          :key="item.commentId"
          class="comment_list_item"
        >
          <div>
            <!-- 头像 -->
            <i class="comment_avatar">
              <img :src="item.user.avatarUrl" alt="用户头像" />
            </i>
            <!-- 用户昵称 -->
            <h4>{{ item.user.nickname }}</h4>
            <!-- 评论时间 -->
            <div class="comment_data">{{ item.time | format }}</div>
            <!-- 评论内容 -->
            <p class="comment_text">{{ item.content }}</p>
            <!-- 点赞/评论 -->
            <div class="comment_opt">
              <a>
                <!-- <chicken-icon type="good" /> -->
                <i
                  class="icon_comment icon_like"
                  @click="dianzan(item.commentId)"
                  :class="{ icon_liked: result(item.commentId) }"
                ></i>
                &nbsp;{{ item.likedCount }}
              </a>
              <a href="#">回复</a>
            </div>
          </div>
        </li>
        <div class="comment_title">
          <h2>全部评论 ( {{ total }} )</h2>
        </div>
        <li
          v-for="item in newComments"
          :key="item.commentId"
          class="comment_list_item"
        >
          <div>
            <!-- 头像 -->
            <i class="comment_avatar">
              <img :src="item.user.avatarUrl" alt="用户头像" />
            </i>
            <!-- 用户昵称 -->
            <h4>{{ item.user.nickname }}</h4>
            <!-- 评论时间 -->
            <div class="comment_data">{{ item.timeStr }}</div>
            <!-- 评论内容 -->
            <p class="comment_text">{{ item.content }}</p>
            <!-- 点赞/评论 -->
            <div class="comment_opt">
              <a>
                <chicken-icon type="good" />
                <span v-if="item.likedCount !== 0">
                  &nbsp;{{ item.likedCount }}
                </span>
              </a>
              <a href="#">回复</a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ChickenDialog from "../../base/chicken-dialog";
import { getComment, getCommentLike } from "../../api";
import { mapGetters } from "vuex";
import ChickenLoading from "@/base/chicken-loading/chicken-loading.vue";
import { loadMixin } from "../../utils/mixin";
export default {
  name: "Comment",
  components: {
    ChickenDialog,
    ChickenLoading,
  },
  mixins: [loadMixin],
  data() {
    return {
      lockUp: true, // 是否锁定滚动加载时间,默认锁定
      page: 0, // 分页
      hotComments: [], // 精彩评论
      newComments: [], // 最新评论
      total: 0, // 评论总数
      zanList: [], //  点赞过的评论index
      threadId: null,
      show: false, //  展示加载动画
    };
  },
  computed: {
    result() {
      return (id) => {
        if (this.zanList.indexOf(id) === -1) {
          return false;
        } else {
          return true;
        }
      };
    },
    ...mapGetters(["uid"]),
  },
  watch: {
    newComments(newList, oldList) {
      if (newList.length !== oldList.length) {
        this.lockUp = false;
      }
    },
  },
  filters: {
    // 格式化日期
    format(time) {
      let formatTime;
      let d = new Date(time);
      const dateObj = {
        year: d.getFullYear(),
        mouth: d.getMonth(),
        date: d.getDate(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
      };
      const { year, mouth, date, hours, minutes } = dateObj;
      formatTime = `${year}年${mouth}月${date}日`;
      return formatTime;
    },
  },

  created() {
    this.initData();
  },
  methods: {
    // 初始化数据
    initData() {
      getComment(this.$route.params.id, this.page).then(({ data }) => {
        this.hotComments = data.hotComments;
        this.newComments = data.comments;
        this.total = data.total;
        this.lockUp = true;
        this._hideLoad()
      });
    },
    listScroll(e) {
      if (this.lockUp) {
        return;
      }
      const { scrollTop, scrollHeight, offsetHeight } = e.target;
      if (scrollTop + offsetHeight >= scrollHeight - 100) {
        this.lockUp = true; // 锁定滚动加载
        this.page += 1;
        this.pullUp(); // 触发滚动加载事件
      }
    },
    // 滚动加载事件
    pullUp() {
      getComment(this.$route.params.id, this.page).then(
        ({ data: { comments } }) => {
          this.newComments = [...this.newComments, ...comments];
        }
      );
    },
    /**
     * 给评论点赞
     * @params id   资源id
     * @params cid 评论id
     * @params t    是否点赞 1---点赞  0---取消点赞
     * @params type 0---歌曲   1----mv   2----歌单
     */
    _getCommentLike(id, cid, t) {
      getCommentLike(id, cid, t).then((data) => {
      });
    },
    // 是否点击赞
    dianzan(id) {
      // 判断一下是否登录
      if (this.uid === null) {
        this.$mmToast("您还没有登录");
        setTimeout(() => {
          this.$bus.$emit("login", 0);
        }, 1500); // mmToast组件里的timeout就是1500
        return;
      }
      let list = this.zanList;
      if (list.indexOf(id) === -1) {
        // 没找到，加里去
        this.zanList.push(id);
        console.log(this.$route.params.id, id);
        this._getCommentLike(this.$route.params.id, id, 1);
      } else {
        for (let i in this.zanList) {
          if (this.zanList[i] === id) {
            this.zanList.splice(i, 1);
            this._getCommentLike(this.$route.params.id, id, 0);
          }
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.mod_comment {
  // height: 100%;
  .mod_hot_comment {
    height: 100%;
    .comment_title {
      position: relative;
      height: 34px;
      line-height: 34px;
      padding: 10px 0;
      border-bottom: 1px solid rgb(255, 255, 255);
      border-color: #fff;
      color: @text_color_active;
    }
    .comment_list {
      padding-bottom: 14px;
      overflow-x: hidden;
      overflow-y: auto;
      height: 100%;
      -webkit-overflow-scrolling: touch;
      .comment_list_item {
        position: relative;
        padding: 15px 0px 15px 56px;
        border-bottom: 1px solid rgb(255, 255, 255);
        border-color: #9c9797;
        // border-color: aqua;
        .comment_avatar {
          position: absolute;
          left: 0;
          top: 18px;
          width: 38px;
          height: 38px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
        h4 {
          font-weight: 400;
          overflow: hidden;
          height: 26px;
          line-height: 26px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .comment_data {
          margin-bottom: 10px;
          height: 20px;
          line-height: 20px;
          color: #aea8a8;
        }
        .comment_text {
          overflow: hidden;
          word-break: break-all;
          word-wrap: break-word;
          line-height: 24px;
          text-align: justify;
          color: #efe8e8;
        }
        .comment_opt {
          line-height: 24px;
          overflow: hidden;
          margin-top: 8px;
          a {
            margin-right: 20px;
            .icon_comment {
              background-image: url("../../assets/img/comment.png");
              background-repeat: no-repeat;
            }
            .icon_like {
              background-position: -25px -25px;
            }
            .icon_liked {
              background-position: 0 -25px;
            }
            .icon_like,
            .icon_liked {
              display: inline-block;
              margin-right: 5px;
              width: 17px;
              height: 17px;
              overflow: hidden;
              vertical-align: -3px;
            }
          }
        }
      }
    }
  }
}
</style>