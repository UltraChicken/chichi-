<template>
  <!-- 音量控制 -->
  <div class="volume">
    <chicken-icon class="pointer volume-icon" :type="getVolumeIconType()" :size="30" @click="handleToggleVolume"/>
    <div class="volume-progress-wrapper">
      <chicken-progress
        :percent="volumeProgress"
        @percentChangeEnd="handleVolumeChange"
        @percentChange="handleVolumeChange"
      />
    </div>
  </div>
</template>

<script>
import ChickenProgress from "../../base/chicken-progress/chicken-progress.vue";
export default {
  name: "Volume",
  components: {
    ChickenProgress,
  },
  props: {
    volume: {
      type: Number,
      required: true,
    },
  },
  computed: {
    volumeProgress() {
      return this.volume;
    },
    isMute: {
      get() {
        return this.volumeProgress === 0;
      },
      set(newMute){
        const volume = newMute ? 0 : this.lastVolume
        if(newMute){
            this.lastVolume = this.volumeProgress
        }
        this.handleVolumeChange(volume)
      }
    },
  },
  methods: {
    getVolumeIconType() {
      return this.isMute ? "volume-off" : "volume";
    },
    // 静音事件
    handleToggleVolume() {
      this.isMute = !this.isMute;
    },
    handleVolumeChange(percent) {
      this.$emit("volumeChange", percent);
    },
  },
};
</script>

<style lang="less" scoped>
.volume{
    display: flex;
    align-items: center;
    width: 150px;
    &-icon{
        margin-right: 5px;
        color: #fff;
    }
    &-progress-wrapper{
        flex: 1;
    }
    @media(max-width:768px){
        top: 2px;
        width: 36px;
    }
}
</style>