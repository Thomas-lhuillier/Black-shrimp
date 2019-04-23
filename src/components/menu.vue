<template>
  <nav class="menu" data-js-draggable>
    <button
      v-for="(item, index) in items"
      class="item"
      v-bind:class="[{active: item.isActive }, {'-moving': isMoving}, 'item--' + item.name]"
      data-js-draggable
      v-bind:key="index"
    >
      <i class="icon" v-bind:class="['icon-' + item.icon]" data-js-draggable></i>
      <span data-js-draggable>{{item.name}}</span>
    </button>

    <button
      class="ml-auto item item-close"
      :class="{'-moving': isMoving}"
      @click="destroy()"
      data-js-draggable
    >
      <i class="icon icon-close" data-js-draggable></i>
    </button>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { name: "Color", icon: "eyeDropper", isActive: true }
        // {name: 'Ruler', icon: 'ruler', isActive: false},
        // {name: 'Info' , icon: 'binoculars', isActive: false}
      ]
    };
  },

  props: {
    isMoving: {
      default: false
    }
  },

  computed: {
    port() {
      return this.$store.getters.getPort;
    }
  },

  methods: {
    destroy: function() {
      this.port.postMessage({
        type: "destroy"
      });
    }
  }
};
</script>

<style lang="scss">
@import "../sass/abstracts/variables";
@import "../sass/abstracts/mixins";

$height: 28px;

.menu {
  position: relative;
  display: flex;
  height: $height;
  color: $gray-dark;
  background-color: $soft-white;
  user-select: none;

  .item {
    display: flex;
    padding: 0 12px;

    font-size: 12px;
    font-weight: 600;
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

    &.active {
      color: $soft-white;
      background-color: $gray;
    }

    &.-moving {
      cursor: move;
    }

    .icon {
      font-size: 18px;
      color: $gray-lighter;

      &:not(:last-child) {
        margin-right: 5px;
        margin-left: -5px;
      }
    }

    &.item-close {
      padding: 0 8px;
      background-color: transparent;
      outline: none;

      &:after {
        position: absolute;
        z-index: 0;
        display: block;
        content: "";
        width: 18px;
        height: 18px;
        top: 5px;
        border-radius: 4px;
        border-width: 1px;
        box-sizing: border-box;
      }

      .icon {
        z-index: 1;
      }

      &:focus {
        &:after {
          @include outline;
          background-color: $gray-light;
        }
      }

      &:hover {
        .icon {
          color: $gray-lighter;
        }

        &:after {
          background-color: $gray-darker;
        }
      }
    }
  }
}
</style>
