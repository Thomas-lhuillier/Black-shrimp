<template>
  <div class="menu" data-js-draggable>
    <span
      v-for="(item, index) in items"
      class="item"
      v-bind:class="[{active: item.isActive }, {'-moving': isMoving}, 'item--' + item.name]"
      data-js-draggable
      v-bind:key="index"
    >
      <i class="icon" v-bind:class="['icon-' + item.icon]" data-js-draggable></i>
      <span data-js-draggable>{{item.name}}</span>
    </span>

    <span class="ml-auto item" :class="{'-moving': isMoving}" @click="destroy()" data-js-draggable>
      <i class="icon icon-close" data-js-draggable></i>
    </span>
  </div>
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
  computed: {
    isMoving() {
      return this.$store.getters.getMovingStatus;
    },
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
    padding: 0 8px;

    font-size: 12px;
    font-weight: 600;
    line-height: $height;

    cursor: pointer;
    transition: color 0.3s linear, background-color 0.3s linear;

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
    }
  }
}
</style>
