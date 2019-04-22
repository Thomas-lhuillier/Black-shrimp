<template>
  <div class="cursor-overlay" @mousemove="handleEvent($event)" @mousedown="handleEvent($event)"></div>
</template>

<script>
export default {
  computed: {
    port() {
      return this.$store.getters.getPort;
    }
  },

  methods: {
    handleEvent(event) {
      if (event.which !== 1) {
        return;
      }

      this.port.postMessage({
        type: "mousePos",
        coord: { x: event.clientX, y: event.clientY }
      });
    }
  }
};
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

.cursor-overlay {
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  user-select: none;

  // @todo Use SVG format
  cursor: url("../assets/img/cursor-eyeDropper.png") 0 22, pointer;

  &:active {
    cursor: url("../assets/img/cursor-eyeDropper-filled.png") 0 22, pointer;
  }
}
</style>
