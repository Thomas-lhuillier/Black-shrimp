<template>
  <div
    class="window"
    :style="{
      'left' : style.left + 'px',
      'top' : style.top + 'px',
      'cursor' : isMoving ? 'move' : 'default',
      'will-change' : isMoving ? 'top, left' : 'auto'
    }"
    @mousedown="onMouseDown($event)"
    @mouseup="onMouseUp($event)"
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
      style: {
        left: '1rem',
        top: '1rem'
      },
      isMoving: false,
      tempPos: {}
    }
  },

  mounted () {
    window.addEventListener('resize', this.fitBounds)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.fitBounds)
  },

  methods: {
    onMouseDown: function (event) {
      event = event || window.event
      if (event.srcElement.getAttribute('data-js-draggable') === null) {
        return
      }

      // Store initial position
      this.tempPos.left = this.$el.offsetLeft
      this.tempPos.top = this.$el.offsetTop
      this.tempPos.mouseX = event.clientX
      this.tempPos.mouseY = event.clientY

      this.isMoving = true
      document.addEventListener('mousemove', this.onMouseMove, true)
    },

    onMouseUp: function (event) {
      this.isMoving = false
      document.removeEventListener('mousemove', this.onMouseMove, true)
    },

    // Moves the main box when dragged
    onMouseMove: function (event) {
      if (!this.isMoving) { return }

      event = event || window.event

      const mouseX = event.clientX
      const mouseY = event.clientY
      const diffX = mouseX - this.tempPos.mouseX
      const diffY = mouseY - this.tempPos.mouseY

      this.style.left = this.tempPos.left + diffX
      this.style.top = this.tempPos.top + diffY

      this.fitBounds()
    },

    // Prevents the main box from getting past window inner border
    fitBounds: function () {
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

      // Restrain position inside viewport
      const maxWidth = window.innerWidth - width - verticalScrollbarWidth
      const maxHeight = window.innerHeight - height

      this.style.left = Math.min(this.style.left, maxWidth)
      this.style.top = Math.min(this.style.top, maxHeight)
      this.style.left = Math.max(this.style.left, 0)
      this.style.top = Math.max(this.style.top, 0)
    }
  }
}
</script>
