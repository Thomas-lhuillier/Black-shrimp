<template>
  <draggable
    v-model="listLocal"
    group="colors"
    :animation="200"
    :move="onMove"
    @start="onStart"
    @end="onEnd"
  >
    <transition-group
      :name="isDragging ? 'flip-list' : 'fall'"
      type="transition"
      class="color-group"
      :class="{'--group': groupId, '--selected': isGroupSelected}"
      :tag="'ul'"
      :data-maintain-selection="groupId.length !== 0"
      @click.self.native="$emit('select', $event)"
    >
      <colorSwatch
        v-for="(colorId, index) in listLocal"
        :id="colorId"
        :key="colorId"
        :is-selected="selection[colorId]"
        data-maintain-selection
        @click.self.native="$emit('color-click', $event, {colorId, groupId, index})"
      />
    </transition-group>
  </draggable>
</template>

<script>
import { mapState } from 'vuex'
import draggable from 'vuedraggable'
import colorSwatch from './color-swatch.vue'

export default {
  components: {
    draggable,
    colorSwatch
  },

  props: {
    list: {
      type: Array,
      required: true
    },

    groupId: {
      type: String,
      required: false,
      default: ''
    },

    selection: {
      type: Object,
      required: false,
      default: () => {}
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

  computed: {
    ...mapState(['colors']),

    listLocal: {
      get () {
        return this.list
      },
      set (data) {
        this.$emit('change', data)
      }
    }
  },

  methods: {
    onStart () {
      this.isDragging = true
    },

    onEnd () {
      this.isDragging = false
      this.$emit('end')
    },

    onMove () {
      this.$emit('move')
    }
  }
}
</script>

<style lang="scss">
@import "../sass/abstracts/variables";
@import "../sass/abstracts/mixins";

@include transition-fall;

.flip-list-move {
  transition: transform $transition-duration;
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
