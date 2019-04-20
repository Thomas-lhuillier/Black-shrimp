<template>
  <div
    class="cursor-overlay"
    v-bind:class="[{ '-visible': isVisible }, '-' + cursor]"
    @mousemove="handleEvent($event)"
    @mousedown="handleEvent($event)"
  ></div>
</template>

<script>
// import Channel from "../utilities/channel.js";

// const channel_name = "overlay";

// const Pipe = new Channel({
//   name: channel_name,
//   model: {
//     // tabId: chrome.devtools.inspectedWindow.tabId,
//     src_channel: channel_name,
//     target_channel: "worker"
//   }
// });

export default {
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
    handleEvent(event) {
      if (this.activeTab != "color" || event.which !== 1) {
        return;
      }

      this.port.postMessage({
        type: "mousePos",
        coord: { x: event.clientX, y: event.clientY }
      });

      // Pipe.post({
      //   type: "mousePos",
      //   coord: { x: event.clientX, y: event.clientY }
      // });
    }
  }
};
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

.cursor-overlay {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  user-select: none;

  &.-visible {
    display: block;
  }

  &.-eyeDropper {
    // @todo Use SVG format
    cursor: url("../assets/img/cursor-eyeDropper.png") 0 22, pointer;

    &:active {
      cursor: url("../assets/img/cursor-eyeDropper-filled.png") 0 22, pointer;
    }
  }
}
</style>
