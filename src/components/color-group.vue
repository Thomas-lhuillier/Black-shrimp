<template>
  <draggable
    class="color-collection"
    :list="colors"
    :tag="'ul'"
    :move="onMove"
    group="colors"
    @end="onEnd"
  >
    <colorSwatch
      v-for="(color, index) in colors"
      :key="index"
      :hex="color.hex"
      :is-selected="color.isSelected"
      data-maintain-selection
      @click.self.native="onClick($event, {color, index, colors, groupID})"
    />
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import colorSwatch from './color-swatch.vue'

export default {
  components: {
    draggable,
    colorSwatch
  },

  props: {
    colors: {
      required: true,
      type: Array
    },
    // eslint-disable-next-line vue/require-prop-types
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
      const relatedElement = relatedContext.element
      const draggedElement = draggedContext.element

      this.$emit('move')

      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      )
    }
  }
}
</script>
