<template>
  <button class="btn" v-on="$listeners">
    <slot />
  </button>
</template>

<style lang="scss">
@import "../sass/abstracts/variables";

.btn {
  padding: 0;
  color: $soft-white;
  background-color: $gray-light;
  font-size: 1rem;
  font-family: $font-family-base;
  line-height: $line-height-base;
  border-width: 0;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition:
    color $transition-duration,
    background-color $transition-duration,
    box-shadow $transition-duration;

  &:hover {
    background-color: $gray-darker;
  }

  .icon {
    color: $gray-lighter;
    font-size: 1.125em; // 1.125 * 16px = 18px
    vertical-align: text-bottom;
  }

  &.btn-square {
    padding: 0;
  }

  &.--color {
    width: 1.125em;
    height: 1.125em;
    box-shadow: 0 0 0 1px $gray-light;
  }

  &.--selected {
    outline: $outline-dashed;
    outline-color: $soft-white;
    box-shadow: inset 0 0 0px 1px $gray-dark;
  }
}
</style>
