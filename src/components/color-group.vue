<template>
  <draggable
    class="color-collection"
    :list="colors"
    :tag="'ul'"
    :move="onMove"
    group="colors"
    @end="onEnd"
  >
    <ColorSwatchComponent
      v-for="(color, index) in colors"
      :key="index"
      :hex="color.hex"
      :isSelected="color.isSelected"
      data-maintain-selection
      @click.self.native="onClick($event, {color, index, colors, groupID})"
    />
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import ColorSwatchComponent from './color-swatch.vue'

export default {
  components: {
    draggable,
    ColorSwatchComponent
  },

  props: {
    colors: {
      required: true,
      type: Array
    },
    groupID: {
      required: false,
      default: null
    }
  },

  methods: {
    onClick (event, payload) {
      this.$emit('color-click', event, payload)
    },

    onEnd () {
      this.$emit('end')
    },

    onMove ({ relatedContext, draggedContext }) {
      console.log('onMove')
      const relatedElement = relatedContext.element
      const draggedElement = draggedContext.element
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      )
    }
  }
}
</script>
