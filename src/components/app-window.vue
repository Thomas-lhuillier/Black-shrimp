<template>
  <div
    class="window"
    :style="{
      'left' : styleObject.left + 'px',
      'top' : styleObject.top + 'px',
      'cursor' : styleObject.cursor
    }"
    @mousedown="startMoving($event)"
    @mouseup="stopMoving($event)"
    @mousemove="move($event)"
  >
    <appMenu :is-moving="isMoving" />
    <colorPanel />
  </div>
</template>

<style lang="scss">
@import "../sass/main";

.window {
  position: fixed;
  z-index: 10;
  top: 1rem;
  left: 1rem;
  width: 235px;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: $border-radius;
  box-shadow: $shadow;
}
</style>

<script>
import appMenu from './app-menu.vue'
import colorPanel from './color-panel.vue'

export default {
  components: {
    appMenu,
    colorPanel
  },

  data () {
    return {
      styleObject: {
        left: '1rem',
        top: '1rem',
        cursor: 'default'
      },
      tempPos: {},
      isMoving: false
    }
  },

  methods: {
    // Store initial position and set moving cursor before moving the main box
    startMoving: function (event) {
      event = event || window.event
      if (event.srcElement.getAttribute('data-js-draggable') === null) {
        return
      }

      this.styleObject.cursor = 'move'

      this.tempPos.left = this.$el.offsetLeft
      this.tempPos.top = this.$el.offsetTop
      this.tempPos.mouseX = event.clientX
      this.tempPos.mouseY = event.clientY

      this.isMoving = true
    },

    // Moves the main box when dragged
    // @todo @perf Throttle
    move: function (event) {
      if (!this.isMoving) {
        return
      }

      event = event || window.event

      var mouseX = event.clientX
      var mouseY = event.clientY

      var diffX = mouseX - this.tempPos.mouseX
      var diffY = mouseY - this.tempPos.mouseY

      var posX = this.tempPos.left + diffX
      var posY = this.tempPos.top + diffY

      this.styleObject.left = posX
      this.styleObject.top = posY

      this.fitBounds()
    },

    // Prevents the main box from getting past window inner border
    // @todo Trigger fitbounds on window resize, after checking window is big enough
    fitBounds: function (posX, posY) {
      const width = this.$el.clientWidth
      const height = this.$el.clientHeight

      const body = document.body
      const html = document.documentElement

      const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      )

      const verticalScrollbarWidth = docHeight > window.innerHeight ? 17 : 0

      // Change position if out of bound
      if (
        this.styleObject.left + width >
        window.innerWidth - verticalScrollbarWidth
      ) {
        this.styleObject.left =
          window.innerWidth - width - verticalScrollbarWidth
      }

      if (this.styleObject.top + height > window.innerHeight) {
        this.styleObject.top = window.innerHeight - height
      }

      if (this.styleObject.left < 0) {
        this.styleObject.left = 0
      }

      if (this.styleObject.top < 0) {
        this.styleObject.top = 0
      }
    },

    // Set back normal cursor, and moving status after moving the main box
    stopMoving: function (event) {
      this.styleObject.cursor = 'default'
      this.isMoving = false
    }
  }
}
</script>
