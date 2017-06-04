<template>
  <div id="black-shrimp" class="blackShrimp" v-bind:class="[{ '-visible': isVisible }]">
    <CursorComponent></CursorComponent>
    <MenuComponent></MenuComponent>
    <ColorComponent></ColorComponent>
  </div>
</template>

<style lang="scss">
  @import "../assets/fonts/Black-shrimp/style.scss";
</style>

<style lang="scss">
  @import "sass/_vars.scss";

  .blackShrimp {
    // Style resets, preventing local style affecting this component.
    all: initial; /* blocking inheritance for all properties */
    * {
      all: unset; /* allowing inheritance within .black-shrimp */
    }

    display: none;
    position: fixed;
    top: 10px;
    left: 10px;
    width: 235px;
    box-sizing: border-box;

    font-family: 'Poppins', monospace;

    z-index: 9999;

    &.-visible {
      display: block;
    }
  }
</style>

<script>
import MenuComponent  from './components/menu.vue'
import ColorComponent from './components/color.vue'
import CursorComponent from './components/cursor-overlay.vue'

export default {
  components: {
    MenuComponent,
    ColorComponent,
    CursorComponent
  },
  data() {
    return {
      debug: true
    }
  },
  computed: {
    isVisible () {
      return this.$store.getters.getVisibilityState;
    }
  }
}
</script>