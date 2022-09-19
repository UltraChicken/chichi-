<template>
  <header class="chicken-header">
    <!-- 头部搜索页面 -->
    <input
      ref="search_content"
      type="text"
      placeholder="搜索音乐、歌手"
      class="input_search"
      @keyup.enter="toSearch"
    />
    <h1 class="header">
      <a href="#" target="blank"> chichi🐤在线音乐播放器 </a>
    </h1>
    <!-- header主体部分 -->
    <dl class="user">
      <template v-if="user.userId">
        <router-link class="user-info" to="/music/userlist" tag="dt">
          <img
            class="avatar"
            :src="`${user.avatarUrl}?param=50y50`"
            alt="头像图片"
          />
          <span>{{ user.nickname }}</span>
        </router-link>
        <dd class="user-btn" @click="openDialog(2)">退出</dd>
      </template>
      <dd v-else class="user-btn" @click="openDialog(0)">登录</dd>
    </dl>
    <!-- 以下为相关的按钮弹窗，按需弹出 -->
    <!-- 1、登录 -->
    <chicken-dialog
      ref="loginDialog"
      head-text="登录"
      confirm-btn-text="登录"
      cancel-btn-text="关闭"
      @confirm="login"
    >
      <!-- 1.1 扫码登录 -->

      <div class="dialog-text" v-if="qrLogin">
        <div class="qr_main">
          <h3>扫码登录</h3>
          <div class="qr_content">
            <img :src="qrimg" alt="二维码" />
          </div>
          <p>
            使用&nbsp;
            <a href="https://music.163.com/#/download" target="_blank"
              >网易云音乐APP</a
            >
            &nbsp;扫码登录
          </p>
          <a class="other-login" @click="isQrLogin">选择其他方式登录</a>
        </div>
      </div>

      <!-- 1.2 手机号登录-->
      <div class="dialog-text" v-else>
        <section>
          <div class="phone-number">
            <a href="">+86</a>
            <input
              ref="phoneValue"
              type="text"
              placeholder="请输入手机号"
              oninput="value=value.replace(/[^\d]/g,'')"
              v-model="phoneNumber"
              autocomplete="off"
            />
          </div>
          <div class="identify-code">
            <input
              ref="phoneCaptcha"
              type="text"
              placeholder="请输入验证码"
              autocomplete="off"
              oninput="value=value.replace(/[^\d]/g,'')"
              v-model="phoneCaptcha"
            />
            <i @click="getCaptcha" v-if="!isSendCaptcha">获取验证码</i>
            <i v-if="isSendCaptcha">{{ sendMessage }}</i>
          </div>
          <i @click="phoneLogin">登录</i>
        </section>
        <span
          class="return-qr"
          v-text="text"
          @click="
            () => {
              qrLogin = !qrLogin;
            }
          "
        ></span>
      </div>
    </chicken-dialog>

    <!--2、退出 -->
    <chicken-dialog
      ref="outDialog"
      body-text="确定退出当前用户吗？"
      :confirmShow="true"
      @confirm="out"
    />
  </header>
</template>

<script>
import {
  getUserPlaylist,
  getStatus,
  getQR,
  sendCaptcha,
  verifyCaptcha,
  byPhoneLogin,
} from "../../api/index";
import ChickenDialog from "../../base/chicken-dialog";
import { mapGetters, mapActions } from "vuex";
import { toHttps } from "../../utils/util";
export default {
  name: "ChikenHeader",
  components: {
    ChickenDialog,
  },
  data() {
    return {
      user: {}, // 用户数据
      uidValue: "", // 记录用户UID,
      qrLogin: true,
      phoneNumber: "", // 电话号码
      phoneCaptcha: "", // 验证码
      password: "", // 密码
      isSendCaptcha: false, // 是否发送验证码
      sendMessage: "", //  倒计时时间
      text: "<返回扫码登录",
    };
  },
  watch: {
    // 监视号码长度
    phoneNumber(newPhone) {
      if (newPhone.length > 11) {
        this.phoneNumber = newPhone.slice(0, -1);
        this.$mmToast("电话号码不能超过11位");
      }
    },
    phoneCaptcha(newCaptcha) {
      if (newCaptcha.length > 6) {
        this.phoneCaptcha = newCaptcha.slice(0, -1);
        this.$mmToast("验证码不能超过8位");
      }
    },
  },
  computed: {
    ...mapGetters(["uid", "qrimg"]),
  },
  created() {
    this.uid && this._getUserPlaylist(this.uid);
  },
  methods: {
    // 验证码倒计时
    send() {
      let timer;
      let time = 60;
      this.sendMessage = time + "s";
      timer = setInterval(() => {
        if (time === 0) {
          clearInterval(timer);
          this.$nextTick(() => {
            this.isSendCaptcha = false;
          });
          return
        }
        time--;
        this.sendMessage = time + "s";
      }, 1000);
    },
    // 是否采用二维码登录
    isQrLogin() {
      this.qrLogin = false;
    },
    // 打开对话框
    openDialog(key) {
      switch (key) {
        case 0:
          this.$refs.loginDialog.show();
          // 获取二维码，并将用户cookie存到sessionStorage中
          getQR().then((res) => {
            if (res.cookie) {
              sessionStorage.setItem("cookie", res.cookie);
              getStatus(sessionStorage.getItem("cookie")).then(
                ({ data: { data } }) => {
                  this.openDialog(3);
                  this.setUid(data.profile.userId);
                  const profile = data.profile;
                  profile.avatarUrl = toHttps(data.profile.avatarUrl);
                  this.user = profile;
                  setTimeout(() => {
                    this.$mmToast(
                      `${this.user.nickname} 欢迎使用 chicken-Player`
                    );
                  }, 200);
                }
              );
            }
          });
          break;
        case 1:
          this.$refs.loginDialog.hide();
          this.$refs.helpDialog.show();
          break;
        case 2:
          this.$refs.outDialog.show();
          break;
        case 3:
          this.$refs.loginDialog.hide();
          break;
      }
    },
    // 退出登录
    out() {
      this.user = {};
      this.setUid(null);
      this.$mmToast("退出成功!");
    },
    // 登录
    login() {
      if (this.uidValue === "") {
        this.$mmToast("UID不能为空");
        this.openDialog(0);
        return;
      }
      this.openDialog(3);
      this._getUserPlaylist(this.uidValue);
    },
    // 获取洪湖数据
    _getUserPlaylist(uid) {
      getUserPlaylist(uid).then(({ data: { playlist = [] } }) => {
        this.uidValue = "";
        if (playlist.length === 0 || !playlist[0].creator) {
          this.$mmToast(`未查询找 UID 为 ${uid} 的用户信息`);
          return;
        }
        const creator = playlist[0].creator;
        this.setUid(uid); // 把uid存到vuex里
        creator.avatarUrl = toHttps(creator.avatarUrl); // 转成https前缀
        this.user = creator;
        setTimeout(() => {
          this.$mmToast(`${this.user.nickname} 欢迎使用 chicken-Player`);
        }, 200);
      });
    },
    // 跳转搜索界面
    toSearch() {
      let keyWords = this.$refs.search_content.value;
      this.$router.push({ path: "/music/search", query: { w: keyWords } });
    },
    // 获取验证码
    getCaptcha() {
      if (!this.$refs.phoneValue.value) {
        this.$mmToast("号码不能为空");
        return;
      }
      this.$nextTick(() => {
        this.isSendCaptcha = true;
      });
      this.send();
      sendCaptcha(Number(this.phoneNumber))
        .then()
        .catch(() => {
          this.$mmToast("验证码发送失败");
        });
    },
    // 通过手机登录
    phoneLogin() {
      if (!this.phoneCaptcha) {
        this.$mmToast("验证码不能为空");
        return;
      }
      if (!this.$refs.phoneValue.value) {
        this.$mmToast("号码不能为空");
        return;
      }
      // 将手机号和验证码转为数字
      const phoneNumber_digit = parseInt(this.phoneNumber);
      const phoneCaptcha_digit = parseInt(this.phoneCaptcha);

      verifyCaptcha(phoneNumber_digit, phoneCaptcha_digit)
        .then((res) => {
          // 验证码正确的话开始登录
          byPhoneLogin(phoneNumber_digit, phoneCaptcha_digit).then(
            ({ data }) => {
              sessionStorage.setItem("cookie", data.cookie);
              getStatus(sessionStorage.getItem("cookie")).then(
                ({ data: { data } }) => {
                  this.openDialog(3);
                  this.setUid(data.profile.userId);
                  const profile = data.profile;
                  profile.avatarUrl = toHttps(data.profile.avatarUrl);
                  this.user = profile;
                  setTimeout(() => {
                    this.$mmToast(
                      `${this.user.nickname} 欢迎使用 chicken-Player`
                    );
                  }, 200);
                }
              );
            }
          );
        })
        .catch((error) => {
          this.$mmToast("验证码错误");
        });
    },
    ...mapActions(["setUid"]),
  },
  mounted() {
    this.$bus.$on("login", (data) => {
      this.openDialog(data);
    });
  },
  beforeDestroy() {
    this.$bus.$off("login", (data) => {
      this.openDialog(data);
    });
  },
};
</script>

<style lang='less' scope>
.chicken-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  @media (max-width: 768px) {
    background: @header_bg_color;
  }
  .input_search {
    position: absolute;
    width: 200px;
    top: 50%;
    left: 25px;
    transform: translateY(-50%);
    height: 25px;
    border: 1px solid #8a7878;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.4);
    padding: 2px 20px;
    color: @text_color;
  }
  .header {
    text-align: center;
    line-height: 60px;
    // 背景设置完毕再注释掉
    color: @text_color_active;
    font-size: @font_size_large;
    @media (max-width: 768px) {
      padding-left: 15px;
      text-align: left;
    }
  }
  .user {
    position: absolute;
    top: 50%;
    right: 15px;
    line-height: 30px;
    text-align: right;
    transform: translateY(-50%);
    &-info {
      float: left;
      margin-right: 15px;
      cursor: pointer;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 90px;
        vertical-align: middle;
      }
      span {
        margin-left: 10px;
        color: @text_color_active;
      }
    }
    &-btn {
      float: left;
      cursor: pointer;
      color: @text_color;
      &:hover {
        // 背景设置完毕注释掉
        color: @text_color_active;
      }
    }
    @media (max-width: 768px) {
      &-info {
        margin-right: 10px;
        span {
          display: none;
        }
      }
    }
  }
}
.dialog-text {
  text-align: center;
  .qr_main {
    display: flex;
    flex-direction: column;
    align-items: center;
    h3 {
      width: 100%;
      font-size: @font_size_large;
    }
    .qr_content {
      width: 100px;
      height: 100px;
      background-color: rgba(255, 255, 255, 0.8);
      margin: 13px auto;
      img {
        width: 100%;
        height: 100%;
      }
    }
    p {
      font-size: @font_size_small;
      a {
        color: #7ec7ff;
      }
    }
    .other-login {
      display: block;
      width: 118px;
      height: 28px;
      margin: 20px auto 0;
      padding-right: 0;
      font-size: @font_size_small;
      border: 1px solid @btn_color;
      border-radius: 15px;
      line-height: 28px;
      text-align: center;
      color: @text_color;
      &:hover {
        color: @text_color_active;
        border: 1px solid @btn_color_active;
      }
    }
  }
  .dialog-input {
    width: 100%;
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
      color: @btn_color;
    }
  }
  a:hover {
    color: #d43c33;
  }
  section {
    width: 220px;
    margin: 0 auto;
    padding: 30px 0 43px;
    .phone-number {
      position: relative;
      height: 30px;
      line-height: 30px;
      border: 1px solid #cdcdcd;
      border-radius: 2px;
      z-index: 11;
      a {
        position: relative;
        float: left;
        display: block;
        height: 30px;
        line-height: 30px;
        padding: 0 18px 0 5px;
        border-right: 1px solid #cdcdcd;
        color: @text_color;
        &::after {
          content: "";
          position: absolute;
          top: 14px;
          right: 7px;
          width: 7px;
          height: 4px;
          background: url(https://p6.music.126.net/obj/wo3DlcOGw6DClTvDisK1/9663139760/c674/1c72/42b8/ba32baac609d90c1c671ac3af4d29d14.png)
            no-repeat;
          background-position: -260px -450px;
        }
      }
      input {
        display: block;
        padding: 0 8px;
        width: 68%;
        height: 100%;
        outline: none;
        border: none;
        color: @text_color_active;
        background: rgba(255, 255, 255, 0.1);
      }
    }
    .region {
      position: absolute;
      top: 31px;
      left: -1px;
      width: 100%;
      height: 128px;
      border: 1px solid #cdcdcd;
      border-top: none;
      clear: both;
      background: #fff;
      overflow: auto;
      li {
        display: flex;
        justify-content: space-between;
        padding: 0 7px;
        height: 32px;
        color: @text_color;
        cursor: pointer;
        overflow: hidden;
      }
    }
    .identify-code {
      position: relative;
      width: 100%;
      height: 30px;
      line-height: 30px;
      border-radius: 2px;
      z-index: 10;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      input {
        display: block;
        padding: 0 8px;
        margin-right: 10px;
        width: 100%;
        height: 100%;
        outline: none;
        border: none;
        background: none;
        color: @text_color_active;
        border: 1px solid #cdcdcd;
      }
      i {
        display: inline-block;
        width: 120px;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        border: 1px solid #cdcdcd;
        border-radius: 5px;
        color: @text_color_active;
        font-size: @font_size_small;
        margin: 0;
        cursor: pointer;
      }
    }
    i {
      display: block;
      margin-top: 20px;
      height: 30px;
      line-height: 30px;
      color: @text_color_active;
      background: inherit;
      border: 1px solid #cdcdcd;
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .return-qr {
    display: block;
    position: relative;
    width: 100px;
    height: 20px;
    color: #7ec7ff;
    font-size: @font_size_small;
    top: 0;
    right: 0;
    cursor: pointer;
  }
}
</style>