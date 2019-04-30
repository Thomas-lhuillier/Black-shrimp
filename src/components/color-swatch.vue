<template>
  <li
    class="btn btn-square --color"
    :class="[{ '--selected': isSelected }]"
    :style="{ 'background-color': hex }"
  />
</template>

<script>
export default {
  props: {
    hex: {
      required: true,
      type: String
    },

    isSelected: {
      type: Boolean,
      default: false
    }
  }
}
</script>
