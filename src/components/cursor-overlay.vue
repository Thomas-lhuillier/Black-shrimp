<template>
  <div
    class="cursor-overlay"
    v-bind:class="[{ '-visible': isVisible }, '-'+cursor]"
    @mousemove="mouseMove($event)"
    @mousedown="click($event)"
  ></div>
</template>

<script>
export default {
  data() {
    return {
      scrollPos: {}
    };
  },
  computed: {
    isVisible() {
      return this.$store.getters.getCursorVisibility;
    },
    activeTab() {
      return this.$store.getters.getActiveTab;
    },
    cursor() {
      return this.$store.getters.getCursorType;
    },
    port() {
      return this.$store.getters.getPort;
    }
  },
  methods: {
    mouseMove(event) {
      if (this.activeTab != "color") {
        return;
      }
      // if (this.activeTab == 'color') {
      this.scrollPos.x = event.clientX;
      this.scrollPos.y = event.clientY;

      if (event.which == 1) {
        // mousedown
        this.port.postMessage({
          type: "mousePos",
          coord: { x: this.scrollPos.x, y: this.scrollPos.y }
        });
      }
      // }
    },
    click(event) {
      if (this.activeTab == "color" && this.scrollPos.x && this.scrollPos.y) {
        this.port.postMessage({
          type: "mousePos",
          coord: { x: this.scrollPos.x, y: this.scrollPos.y }
        });
      }
    }
  }
};
</script>

<style lang="scss">
@import "../sass/variables";

.blackShrimp {
  .cursor-overlay {
    display: none;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    user-select: none;

    &.-visible {
      display: block;
      &.-eyeDropper,
      &.-eyeDropper:hover {
        // background-color: rgba(150,0,0,0.5);
        cursor: url("../assets/img/cursor-eyeDropper.png") 0 22, pointer;
        &:active {
          cursor: url("../assets/img/cursor-eyeDropper-filled.png") 0 22,
            pointer;
        }
      }
    }
  }
}
</style>
