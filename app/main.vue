<template>
  <div id="black-shrimp" class="blackShrimp">
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

    box-sizing: border-box;
    position: fixed;
    top: 10px;
    left: 10px;
    width: 235px;

    font-family: 'Poppins', monospace;

    z-index: 9999;
  }
</style>

<script>
import MenuComponent  from './components/menu.vue'
import ColorComponent from './components/color.vue'

export default {
  components: {
    MenuComponent,
    ColorComponent
  },
  data() {
    return {
      debug: true
    }
  }
}
</script>