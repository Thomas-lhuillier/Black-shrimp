<template>
  <li
    class="btn btn-square --color"
    :class="[{ '--selected': isSelected }]"
    :style="{ 'background-color': hex }"
  />
</template>

<script>
import { rgbToHex } from '../utilities/color'

export default {
  props: {
    id: {
      required: true,
      type: String
    },

    isSelected: {
      required: false,
      type: Boolean,
      default: false
    }
  },

  computed: {
    hex: function () {
      return rgbToHex(this.color)
    },

    color: function () {
      return this.$store.getters.findColorById(this.id)
    }
  }
}
</script>
