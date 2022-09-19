<template>
  <!-- 加载动画 -->
  <!-- <div
    v-show="value"
    class="loading"
    :style="{ backgroundColor: loadingBgColor }"
  >
    <div class="loading-content">
      <svg class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20" fill="none" />
      </svg>
    </div>
  </div> -->
  <div v-show="value" class="loading">
    <div class="loading-content">
      <div class="gif"></div>
      <span>加载中{{dot}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChickenLoading",
  computed:{
    dot(){
      let dot = '';
      if(dot.length===3){
        clearTimeout(timer)
        dot = '';
      }
      let timer = setTimeout(() => {
        return dot+'.'
      }, 500);
    }
  },
  props: {
    // 是否显示
    value: {
      type: Boolean,
      default: true,
    },
    //加载动画背景颜色
    loadingBgColor: {
      type: String,
      default: "",
    },
  },
};
</script>

<style lang="less">
.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1996;
  background: @load_bg_color;
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    top: 50%;
    width: 100%;
    transform: translateY(-50%);
    // text-align: center;
    .gif {
      // position: absolute;
      // left: 50%;
      // transform: translateX(-50%);
      text-align: center;
      width: 60px;
      height: 60px;
      background: url("../../assets/img/chichi-run.GIF") no-repeat;
      background-size: 60px;
    }
    span {
      color:@text_color_active
    }
    // .circular {
    //   height: 50px;
    //   width: 50px;
    //   animation: loading-rotate 2s linear infinite;
    //   .path {
    //     animation: loading-dash 1.5s ease-in-out infinite;
    //     stroke-dasharray: 90, 150;
    //     stroke-dashoffset: 0;
    //     stroke-width: 2;
    //     stroke: @text_color;
    //     stroke-linecap: round;
    //   }
    // }
  }
}

// 动画函数
@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>