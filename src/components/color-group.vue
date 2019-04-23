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
      @click.self.native="onClick($event, {color, index, colors, groupID})"
      data-maintain-selection
    ></ColorSwatchComponent>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";
import ColorSwatchComponent from "./color-swatch.vue";

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
    onClick: function(event, payload) {
      this.$emit("color-click", event, payload);
    },

    onEnd: function() {
      this.$emit("end");
    },

    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    }
  }
};
</script>
