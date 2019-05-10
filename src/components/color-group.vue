<template>
  <div>
    <draggable
      :list="colors"
      :move="onMove"
      :animation="200"
      group="colors"
      @start="onStart"
      @end="onEnd"
    >
      <transition-group
        :name="isDragging ? 'flip-list' : 'fall'"
        type="transition"
        class="color-group"
        :class="{'--group': isGroup, '--selected': isGroupSelected}"
        :tag="'ul'"
        @click.self.native="$emit('select', $event)"
      >
        <colorSwatch
          v-for="(color, index) in colors"
          :key="color.id"
          :hex="color.hex"
          :is-selected="color.isSelected"
          data-maintain-selection
          @click.self.native="onClick($event, {color, index, colors, groupID})"
        />
      </transition-group>
    </draggable>
  </div>
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
      type: Array,
      required: true
    },

    // eslint-disable-next-line vue/require-prop-types
    groupID: {
      required: false,
      default: null
    },

    isGroup: {
      type: Boolean,
      required: false,
      default: false
    },

    isGroupSelected: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      isDragging: false
    }
  },

  methods: {
    onClick (event, payload) {
      this.$emit('color-click', event, payload)
    },

    onStart () {
      this.isDragging = true
    },

    onEnd () {
      this.isDragging = false
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

<style lang="scss">
@import "../sass/abstracts/variables";
@import "../sass/abstracts/mixins";

@include transition-fall;

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.color-group {
  display: flex;
  flex-wrap: wrap;
  margin-left: -($spacer / 2);

  &:not(:empty) {
    margin-bottom: $spacer;
  }

  &.--group {
    margin-top: -($spacer / 2);
    padding-top: ($spacer / 2);

    &:last-child {
      margin-bottom: $spacer;
    }

    &:before {
      display: block;
      margin-left: ($spacer / 2);
      margin-bottom: ($spacer / 2);
      font-size: 1.125em;
      line-height: 1;
      font-family: $font-family-icon;
      cursor: pointer;
      content: "\e902";
    }
  }

  &.--selected {
    background-color: #333333;
    outline: $outline-dashed;
  }

  .btn {
    margin-left: ($spacer / 2);
    margin-bottom: ($spacer / 2);
  }
}
</style>
