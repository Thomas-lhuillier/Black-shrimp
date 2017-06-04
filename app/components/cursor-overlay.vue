<template>
  <div class="cursor-overlay" v-bind:class="[{ '-visible': isVisible }, { '-clicked': isClicked }, '-'+cursor]" track-by="isClicked" v-on:mouseleave="setIsClicked(false)" v-on:mousedown="setIsClicked(true)" v-on:mouseup="setIsClicked(false)">
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isClicked: false
      }
    },
    computed: {
      isVisible () {
        return this.$store.getters.getCursorOverlayState;
      },
      cursor () {
        return this.$store.getters.getCursorOverlayType;
      },
    },
    methods: {
      setIsClicked(val) {
        this.isClicked = val;
      }
    }
  }
</script>

<style lang="scss">
  @import "../sass/_vars.scss";

  .blackShrimp {
    .cursor-overlay {
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      &.-visible {
        display: block;
        &.-eyeDropper,
        &.-eyeDropper:hover {
          // background-color: rgba(150,0,0,0.5);
          cursor: url('~../../assets/img/cursor-eyeDropper.png') 0 22, pointer;
          &:active {
            cursor: url('~../../assets/img/cursor-eyeDropper-filled.png') 0 22, pointer;
          }
        }
        &.-clicked:hover {
        }
      }
    }
  }
</style>