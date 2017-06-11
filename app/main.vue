<template>
<div
  id="black-shrimp"
  class="blackShrimp"
  :class="[{ '-visible': isVisible }]"
  :style="{
    'left': styleObject.left + 'px',
    'top': styleObject.top + 'px',
    'cursor': styleObject.cursor}"
  @mousedown="startMoving($event)"
  @mouseup="stopMoving($event)"
  @mousemove="move($event)"
>
  <CursorComponent></CursorComponent>
  <MenuComponent></MenuComponent>
  <ColorComponent></ColorComponent>
</div>
</template>

<style lang="scss">
  // @TODO remove this
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
      debug   : true,
      styleObject: {
        left    : 10,
        top     : 10,
        cursor  : 'default',
      },
      tempPos: {},
    }
  },
  computed: {
    isVisible() {
      return this.$store.getters.getVisibility;
    },
    isMoving() {
      return this.$store.getters.getMovingStatus;
    },
  },
  methods: {
    move : function(event) {
      if (!this.isMoving) { return; }

      event = event || window.event;

      var posX  = event.clientX,
          posY  = event.clientY,

          diffX = posX - this.tempPos.mouseX,
          diffY = posY - this.tempPos.mouseY;

      this.styleObject.left = this.tempPos.left + diffX;
      this.styleObject.top  = this.tempPos.top + diffY;
    },

    startMoving : function(event) {
      event = event || window.event;
      console.log(event);
      console.log(event.srcElement);

      if (event.srcElement.getAttribute('data-js-draggable') === null) { return }

      this.styleObject.cursor = 'move';

      this.tempPos.left = this.styleObject.left;
      this.tempPos.top = this.styleObject.top;
      this.tempPos.mouseX = event.clientX;
      this.tempPos.mouseY = event.clientY;

      this.isMoving = true;
      this.$store.commit('setMovingStatus', true);
    },

    stopMoving : function(event) {
      this.styleObject.cursor = 'default';
      this.isMoving = false;
      this.$store.commit('setMovingStatus', false);
    },
  }
}
</script>
