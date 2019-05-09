<template>
  <div class="cursor-overlay" @mousemove="handleEvent($event)" @mousedown="handleEvent($event)" />
</template>

<script>
export default {
  methods: {
    handleEvent (event) {
      // Abort if left click is not pressed,
      // tis way we can hold click and the move to trigger the events.
      if (event.which !== 1) { return }

      const { clientX: x, clientY: y } = event
      this.$store.dispatch('getColor', { x, y })
    }
  }
}
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
