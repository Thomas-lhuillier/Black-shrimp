<template>
  <nav class="menu" data-js-draggable>
    <button
      v-for="(item, index) in items"
      :key="index"
      class="item"
      :class="[{'--active': item.isActive }, {'--moving': isMoving}, 'item--' + item.name]"
      data-js-draggable
    >
      <i class="icon" :class="['icon-' + item.icon]" data-js-draggable />
      <span data-js-draggable>{{ item.name }}</span>
    </button>

    <button
      class="ml-auto item item-close"
      :class="{'--moving': isMoving}"
      data-js-draggable
      @click="destroy()"
    >
      <i class="icon icon-close" data-js-draggable />
    </button>
  </nav>
</template>

<script>
export default {

  props: {
    isMoving: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      items: [
        { name: 'Color', icon: 'eyeDropper', isActive: true }
        // {name: 'Ruler', icon: 'ruler', isActive: false},
        // {name: 'Info' , icon: 'binoculars', isActive: false}
      ]
    }
  },

  computed: {
    port () {
      return this.$store.getters.getPort
    }
  },

  methods: {
    destroy: function () {
      this.port.postMessage({
        type: 'destroy'
      })
    }
  }
}
</script>

<style lang="scss">
@import "../sass/abstracts/variables";
@import "../sass/abstracts/mixins";

$height: 1.75rem;

.menu {
  position: relative;
  display: flex;
  height: $height;
  color: $gray-dark;
  background-color: $soft-white;
  user-select: none;

  .item {
    display: flex;
    position: relative;
    padding: 0 ($spacer * 2);

    font-size: 0.75rem;
    font-weight: $font-weight-bold;
    line-height: $height;

    border-top-right-radius: $border-radius;
    border: none;
    cursor: pointer;

    > * {
      line-height: inherit;
    }

    &:hover,
    &:focus {
      color: $soft-white;
      background: $gray-dark;
    }

    &:not(:last-child):after {
      content: "";
      border-style: solid;
      position: absolute;
      right: -9px;
      bottom: -2px;
      width: 5px;
      height: 5px;
      border-radius: 100%;
      border-color: transparent transparent transparent $gray;

      transform: rotate(-45deg);
    }

    &.--active {
      color: $soft-white;
      background-color: $gray;
    }

    &.--moving {
      cursor: move;
    }

    .icon {
      font-size: 1.125rem; // 1.125 * 16px = 18px
      color: $gray-lighter;

      &:not(:last-child) {
        margin-right: $spacer;
        margin-left: -$spacer;
      }
    }
  }

  .item-close {
    padding: 0 $spacer;
    background-color: transparent;
    outline: none;

    &:after {
      position: absolute;
      z-index: 0;
      display: block;
      content: "";
      width: 1.125rem;
      height: 1.125rem;
      top: ($height - 1.125rem) / 2;
      border-radius: $border-radius-sm;
      border-width: $border-width;
    }

    .icon {
      z-index: 1;
    }

    &:focus {
      box-shadow: none;
      background-color: $soft-white;

      &:after {
        @include outline-chrome;
        background-color: $gray-light;
      }
    }

    &:hover {
      background-color: transparent;

      .icon {
        color: $gray-lighter;
      }

      &:after {
        background-color: $gray-darker;
      }
    }
  }
}
</style>
