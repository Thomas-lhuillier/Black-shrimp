<template>
<div
  id="black-shrimp"
  class="blackShrimp"
  :class="[{ '-visible': isVisible }]"
  :style="{
    'left'   : styleObject.left + 'px',
    'top'    : styleObject.top + 'px',
    'cursor' : styleObject.cursor
  }"
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
@import "sass/_vars.scss";
@import "../package/assets/fonts/Black-shrimp/style.scss";
@import "../package/assets/fonts/Poppins/style.scss";

.blackShrimp {
  // Style resets, preventing local style affecting this component.
  all: initial; /* blocking inheritance for all properties */

  &:before,
  &:after,
  *:before,
  *:after,
  * {
    all: unset; /* allowing inheritance within .black-shrimp */
  }

  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  width: 235px;
  box-sizing: border-box;

  font-family: 'Poppins', monospace !important;

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
      debug : true,
      styleObject : {
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
    /* Store initial position and set moving cursor before moving the main box  */
    startMoving : function(event) {
      event = event || window.event;
      if (event.srcElement.getAttribute('data-js-draggable') === null) { return }

      this.styleObject.cursor = 'move';

      this.tempPos.left = this.styleObject.left;
      this.tempPos.top = this.styleObject.top;
      this.tempPos.mouseX = event.clientX;
      this.tempPos.mouseY = event.clientY;

      this.isMoving = true;
      this.$store.commit('setMovingStatus', true);
    },

    /* Moves the main box when dragged */
    move : function(event) {
      if (!this.isMoving) { return; }

      event = event || window.event;

      var mouseX  = event.clientX;
      var mouseY  = event.clientY;

      var diffX = mouseX - this.tempPos.mouseX;
      var diffY = mouseY - this.tempPos.mouseY;

      var posX = this.tempPos.left + diffX;
      var posY = this.tempPos.top + diffY;

      this.styleObject.left = posX;
      this.styleObject.top  = posY;

      this.fitBounds();
    },

    /* Prevents the main box from getting past window inner border */
    // @TODO trigger fitbounds on window resize, after checking window is big enough
    fitBounds: function(posX, posY) {
      var el = document.getElementById('black-shrimp');
      var width  = el.clientWidth;
      var height = el.clientHeight;

      var body = document.body;
      var html = document.documentElement;

      var docHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight);

      var verticalScrollbarWidth = docHeight > window.innerHeight ? 17 : 0;
      // var isHorizontalScrollbar = ? true : false;
      console.log('verticalScrollbarWidth:', verticalScrollbarWidth, '\n', document.innerHeight, window.innerHeight)

      if ( this.styleObject.left + width > window.innerWidth - verticalScrollbarWidth) {
        this.styleObject.left = window.innerWidth - width -verticalScrollbarWidth;
      }
      if ( this.styleObject.top + height > window.innerHeight ) {
        this.styleObject.top = window.innerHeight - height;
      }
      if ( this.styleObject.left < 0 ) {
        this.styleObject.left = 0;
      }
      if ( this.styleObject.top < 0 ) {
        this.styleObject.top = 0;
      }
    },

    /* Set back normal cursor, and moving status after moving the main box */
    stopMoving : function(event) {
      this.styleObject.cursor = 'default';
      this.isMoving = false;
      this.$store.commit('setMovingStatus', false);
    },
  }
}
</script>
